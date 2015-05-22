using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UnpackResources
{
	class StuntUnpack
	{

		const uint STPK_MAX_SIZE = 0xFFFFFF;
		const byte STPK_PASSES_MASK = 0x7F;
		const byte STPK_PASSES_RECUR = 0x80;

		const byte STPK_TYPE_RLE = 0x01;
		const byte STPK_TYPE_VLE = 0x02;

		const uint STPK_RLE_ESCLEN_MASK = 0x7F;
		const uint STPK_RLE_ESCLEN_MAX = 0x0A;
		const uint STPK_RLE_ESCLEN_NOSEQ = 0x80;
		const uint STPK_RLE_ESCLOOKUP_LEN = 0x100;
		const uint STPK_RLE_ESCSEQ_POS = 0x01;

		const byte STPK_VLE_WDTLEN_MASK = 0x7F;
		const byte STPK_VLE_WDTLEN_MAX = 0x0F;
		const byte STPK_VLE_WDTLEN_UNK = 0x80;

		const byte STPK_VLE_ESCARR_LEN = 0x10;
		const uint STPK_VLE_ALPH_LEN = 0x100;
		const byte STPK_VLE_ESC_WIDTH = 0x40;
		const byte STPK_VLE_BYTE_MSB = 0x80;


		// Decompress sub-files in source buffer.

		public void Unpack ( Reader src, Writer trg )
		{
			var reportedSize = src.ReadUInt();
			if (reportedSize == src.Length) {
				src.Position = 0;
				trg.Write(src.ReadByteArray((int)src.Length));
				return;
			}

			byte compType = (byte)(reportedSize & STPK_PASSES_MASK);

			uint decompSize = reportedSize >> 8;
			uint fileSize = (uint)src.Length;

			if ((compType >= 1) && (compType <= 2) && (fileSize <= STPK_MAX_SIZE) && (fileSize < decompSize)) {
				src.Position = 0;

				var dst = stpk_decomp(src, 0);

				trg.Write(dst.ReadByteArray((int)dst.Length));
			}
				// Data doesn't fit compression header, give up.
			else {
				throw new InvalidDataException(string.Format("Invalid file. Reported size ({0}) doesn't match actual file size ({1}) or compression header.", reportedSize, src.Length));
			}

			

		}

		Reader stpk_decomp ( Reader src, int maxPasses )
		{
			Writer dst = null;
			byte passes, type, i;
			int finalLen;

			passes = src.ReadByte();
			if (STPK_GET_FLAG(passes, STPK_PASSES_RECUR)) {

				passes &= STPK_PASSES_MASK;

				Debug.WriteLine("  passes = {0}", passes);

				finalLen = stpk_getLength(src);
				Debug.WriteLine("  finalLen = {0}", finalLen);
				Debug.WriteLine("    srcLen = {0}", src.Length);
				Debug.WriteLine("    ratio = {0}", (float)finalLen / src.Length);
			} else {
				src.Seek(-1);
				passes = 1;
			}

			if (src.AtEndOfStream) {
				Debug.WriteLine("Reached EOF while parsing file header");
				throw new EndOfStreamException();
			}

			for (i = 0; i < passes; i++) {
				Debug.WriteLine("Pass {0}/{1}: ", i + 1, passes);

				type = src.ReadByte();
				var passLength = stpk_getLength(src);

				dst = new Writer(passLength);
				Debug.WriteLine("  dstLen = {0}", dst.Length);

				switch (type) {
					case STPK_TYPE_RLE:
						Debug.WriteLine("  type Run-length encoding");
						stpk_decompRLE(src, dst);
						break;
					case STPK_TYPE_VLE:
						Debug.WriteLine("  type Variable-length encoding");
						stpk_decompVLE(src, dst);
						break;
					default:
						Debug.WriteLine("Error parsing source file. Expected type 1 (run-length) or 2 (variable-length), got {0}", type);
						throw new InvalidDataException(string.Format("Error parsing source file. Expected type 1 (run-length) or 2 (variable-length), got {0}", type));
				}

				if (i + 1 == maxPasses && passes != maxPasses) {
					Debug.WriteLine("Parsing limited to {0} decompression pass(es), aborting.", maxPasses);

					var res = new Reader(dst.Stream) { Position = 0 };
					return res;
				}

				// Destination buffer is source for next pass.
				src = new Reader(dst.Stream);
				src.Position = 0;
			}

			if (dst != null) {
				return src;
			} else {
				return null;
			}
		}

		// Decompress run-length encoded sub-file.
		void stpk_decompRLE ( Reader src, Writer dst )
		{
			byte unk, escLen;
			byte[] esc = new byte[STPK_RLE_ESCLEN_MAX];
			byte[] escLookup = new byte[STPK_RLE_ESCLOOKUP_LEN];

			var srcLen = stpk_getLength(src);
			Debug.WriteLine("  srcLen = {0}", srcLen);

			unk = src.ReadByte();
			Debug.WriteLine("  unk = {0}", unk);

			if (unk != 0) {
				Debug.WriteLine("Unknown RLE header field (unk) is {0}, expected 0", unk);
			}

			escLen = src.ReadByte();
			Debug.WriteLine("  %-10s %d (no sequences = %d)\n\n", "escLen", escLen & STPK_RLE_ESCLEN_MASK, STPK_GET_FLAG(escLen, STPK_RLE_ESCLEN_NOSEQ));

			if ((escLen & STPK_RLE_ESCLEN_MASK) > STPK_RLE_ESCLEN_MAX) {
				Debug.WriteLine("escLen & STPK_RLE_ESCLEN_MASK greater than max length {0}, got {1}", STPK_RLE_ESCLEN_MAX, escLen & STPK_RLE_ESCLEN_MASK);
				throw new InvalidDataException(string.Format("escLen & STPK_RLE_ESCLEN_MASK greater than max length {0}, got {1}", STPK_RLE_ESCLEN_MAX, escLen & STPK_RLE_ESCLEN_MASK));
			}

			// Read escape codes.
			for (int i = 0; i < (escLen & STPK_RLE_ESCLEN_MASK); i++) esc[i] = src.ReadByte();

			if (src.AtEndOfStream) {
				Debug.WriteLine("Reached end of source buffer while parsing run-length header");
				throw new EndOfStreamException();
			}

			// Generate escape code lookup table.
			for (int i = 0; i < STPK_RLE_ESCLOOKUP_LEN; i++) escLookup[i] = 0;
			for (byte i = 0; i < (escLen & STPK_RLE_ESCLEN_MASK); i++) escLookup[esc[i]] = (byte)(i + 1);

			Debug.WriteLine("Run-length ");

			Writer tmp;
			Reader finalSrc;

			if (!STPK_GET_FLAG(escLen, STPK_RLE_ESCLEN_NOSEQ)) {
				tmp = new Writer();
				stpk_rleDecodeSeq(src, tmp, esc[STPK_RLE_ESCSEQ_POS]);
				finalSrc = new Reader(dst.Stream);
				finalSrc.Position = 0;
			} else {
				finalSrc = src;
			}

			stpk_rleDecodeOne(finalSrc, dst, escLookup);
		}

		// Decode sequence runs.
		void stpk_rleDecodeSeq ( Reader src, Writer dst, byte esc )
		{
			uint progress = 0;

			Debug.WriteLine("[");

			Debug.WriteLine("Decoding sequence runs...    ");

			// We do not know the destination length for this pass, dst.Length covers both RLE passes.
			while (src.Position < src.Length) {
				byte cur = src.ReadByte();

				if (cur == esc) {
					Writer writeSequence = new Writer();
					while ((cur = src.ReadByte()) != esc) {
						writeSequence.Write(cur);
					}
					Reader readSequence = new Reader(writeSequence.Stream);
					readSequence.Position = 0;
					var sequence = readSequence.ReadByteArray((int)readSequence.Length);

					byte repetition = src.ReadByte();

					for (int i = 0; i < repetition; i++) {
						dst.Write(sequence);
					}
				} else {
					dst.Write(cur);

					if (dst.AtEndOfStream) {
						Debug.WriteLine("Reached end of temporary buffer while writing non-RLE byte");
						throw new EndOfStreamException();
					}
				}

				// Progress bar.
				if (((src.Position * 100) / src.Length) >= (progress * 25)) {
					Debug.WriteLine("{0}", progress++ * 25);
				}
			}

			Debug.WriteLine("]   ");
		}

		// Decode single-byte runs.
		void stpk_rleDecodeOne ( Reader src, Writer dst, byte[] esc )
		{
			byte cur;
			int progress = 0, rep;

			Debug.WriteLine("[");

			Debug.WriteLine("Decoding single-byte runs... ");

			while (!dst.AtEndOfStream) {
				cur = src.ReadByte();

				if (src.AtEndOfStream) {
					Debug.WriteLine("Reached unexpected end of source buffer while decoding single-byte runs\n");
				}

				if ((esc[cur] & 0xFF) != 0) {
					switch (esc[cur]) {
						case 1:
							rep = src.ReadByte();

							break;

						case 3:
							rep = src.ReadUShort();
							break;

						default:
							rep = esc[cur] - 1;
							break;
					}
					cur = src.ReadByte();

					for (int i = 0; i < rep; i++) {
						dst.Write(cur);
					}

				} else {
					dst.Write(cur);
				}

				// Progress bar.
				if (((src.Position * 100) / src.Length) >= (progress * 25)) {
					Debug.WriteLine("{0}", progress++ * 25);
				}
			}

			Debug.WriteLine("\n");
			Debug.WriteLine("]\n");

			if (!src.AtEndOfStream) {
				Debug.WriteLine("RLE decoding finished with unprocessed data left in source buffer ({0} bytes left)\n", src.Length - src.Position);
			}
		}

		// Decompress variable-length sub-file.
		void stpk_decompVLE ( Reader src, Writer dst )
		{
			byte widthsLen;
			byte[] alphabet = new byte[STPK_VLE_ALPH_LEN];
			byte[] symbols = new byte[STPK_VLE_ALPH_LEN];
			byte[] widths = new byte[STPK_VLE_ALPH_LEN];
			ushort[] esc1 = new ushort[STPK_VLE_ESCARR_LEN];
			ushort[] esc2 = new ushort[STPK_VLE_ESCARR_LEN];

			widthsLen = src.ReadByte();
			var widthsOffset = src.Position;

			if (STPK_GET_FLAG(widthsLen, STPK_VLE_WDTLEN_UNK)) {
				Debug.WriteLine("Invalid source file. Unknown flag set in widthsLen");
				throw new InvalidDataException("Invalid source file. Unknown flag set in widthsLen");
			} else if ((widthsLen & STPK_VLE_WDTLEN_MASK) > STPK_VLE_WDTLEN_MAX) {
				Debug.WriteLine("widthsLen & STPK_VLE_WDTLEN_MASK greater than {0}, got {1}", STPK_VLE_WDTLEN_MAX, widthsLen & STPK_VLE_WDTLEN_MASK);
				throw new InvalidDataException(string.Format("widthsLen & STPK_VLE_WDTLEN_MASK greater than {0}, got {1}", STPK_VLE_WDTLEN_MAX, widthsLen & STPK_VLE_WDTLEN_MASK));
			}

			uint alphLen = stpk_vleGenEsc(src, esc1, esc2, widthsLen);

			if (alphLen > STPK_VLE_ALPH_LEN) {
				Debug.WriteLine("alphLen greater than {0}, got {1}", STPK_VLE_ALPH_LEN, alphLen);
				throw new InvalidDataException(string.Format("alphLen greater than {0}, got {1}", STPK_VLE_ALPH_LEN, alphLen));
			}

			// Read alphabet.
			for (int i = 0; i < alphLen; i++) {
				alphabet[i] = src.ReadByte();
				Debug.WriteLine("  alphabet[{0}] = {1}", i, alphabet[i]);
			}

			if (src.AtEndOfStream) {
				Debug.WriteLine("Reached end of source buffer while parsing variable-length header\n");
				throw new EndOfStreamException();
			}

			var codesOffset = src.Position;
			src.Position = widthsOffset;

			stpk_vleGenLookup(src, widthsLen, alphabet, symbols, widths);

			src.Position = codesOffset;

			stpk_vleDecode(src, dst, alphabet, symbols, widths, esc1, esc2);
		}

		/// <summary>
		/// Read widths to generate escape table and return length of alphabet.
		/// </summary>
		/// <param name="src">Source reader</param>
		/// <param name="esc1">first escape table</param>
		/// <param name="esc2">second escape table</param>
		/// <param name="widthsLen">escape table length</param>
		/// <returns></returns>
		uint stpk_vleGenEsc ( Reader src, ushort[] esc1, ushort[] esc2, uint widthsLen )
		{
			ushort inc = 0, alphLen = 0;

			for (int i = 0; i < widthsLen; i++) {
				inc <<= 1;
				esc1[i] = (ushort)(alphLen - inc);
				byte tmp = src.ReadByte();

				inc += tmp;
				alphLen += tmp;

				esc2[i] = inc;

				Debug.WriteLine("  esc1[{0}] = {1};  esc2[{0}] = {2}", i, esc1[i], esc2[i]);
			}

			return alphLen;
		}

		// Generate code lookup table for symbols and widths.
		void stpk_vleGenLookup ( Reader src, uint widthsLen, byte[] alphabet, byte[] symbols, byte[] widths )
		{
			uint widthDistrLen = (widthsLen >= 8 ? 8 : widthsLen);
			byte symbsCount = STPK_VLE_BYTE_MSB;

			// Distribution of symbols and widths.
			uint i = 0, j = 0;
			for (byte width = 1; width <= widthDistrLen; width++) {
				symbsCount >>= 1;
				for (byte symbsWidth = src.ReadByte(); symbsWidth > 0; symbsWidth--) {
					j++;
					for (byte symbsCountLeft = symbsCount; symbsCountLeft > 0; symbsCountLeft--) {
						i++;
						symbols[i] = alphabet[j];
						widths[i] = width;
						Debug.WriteLine("  symbols[{0}] = {1};  widths[{0}] = {2}", i, symbols[i], widths[i]);
					}
				}
			}

			// Pad widths.
			for (; i < STPK_VLE_ALPH_LEN; i++) widths[i] = STPK_VLE_ESC_WIDTH;
		}

		// Decode variable-length compression codes.
		void stpk_vleDecode ( Reader src, Writer dst, byte[] alphabet, byte[] symbols, byte[] widths, ushort[] esc1, ushort[] esc2 )
		{
			byte curWidth = 8, nextWidth = 0;
			ushort curWord = 0;
			uint progress = 0;

			curWord = (ushort)((src.ReadByte() << curWidth) | src.ReadByte());

			Debug.WriteLine("Var-length [");

			Debug.WriteLine("Decoding compression codes... \n");

			while (!dst.AtEndOfStream) {

				byte code = (byte)(curWord >> 8 & 0xFF);

				nextWidth = widths[code];

				if (nextWidth > 8) {
					if (nextWidth != STPK_VLE_ESC_WIDTH) {
						Debug.WriteLine("Invalid escape value. nextWidth != {0}, got {1}", STPK_VLE_ESC_WIDTH, nextWidth);
						throw new InvalidDataException(string.Format("Invalid escape value. nextWidth != {0}, got {1}", STPK_VLE_ESC_WIDTH, nextWidth));
					}

					code = (byte)(curWord & 0xFF);
					curWord >>= 8;

					byte ind = 7;
					bool done = false;

					while (!done) {
						if (curWidth == 0) {
							code = src.ReadByte();
							curWidth = 8;
						}

						curWord = (ushort)((curWord << 1) + (STPK_GET_FLAG(code, STPK_VLE_BYTE_MSB) ? 1 : 0));
						code <<= 1;
						curWidth--;
						ind++;

						if (ind >= STPK_VLE_ESCARR_LEN) {
							Debug.WriteLine("Escape array index out of bounds ({0} >= {1})", ind, STPK_VLE_ESCARR_LEN);
							throw new IndexOutOfRangeException(string.Format("Escape array index out of bounds ({0} >= {1})", ind, STPK_VLE_ESCARR_LEN));
						}

						if (curWord < esc2[ind]) {
							curWord += esc1[ind];

							if (curWord > 0xFF) {
								Debug.WriteLine("Alphabet index out of bounds ({0} > {1})", curWord, STPK_VLE_ALPH_LEN);
								throw new IndexOutOfRangeException(string.Format("Alphabet index out of bounds ({0} > {1})", curWord, STPK_VLE_ALPH_LEN));
							}

							dst.Write(alphabet[curWord]);

							done = true;
						}
					}

					// Reset and continue.
					curWord = (ushort)((code << curWidth) | src.ReadByte());
					nextWidth = (byte)(8 - curWidth);
					curWidth = 8;
				} else {
					dst.Write(symbols[code]);

					if (curWidth < nextWidth) {
						curWord <<= curWidth;

						nextWidth -= curWidth;
						curWidth = 8;

						curWord |= src.ReadByte();
					}
				}

				curWord <<= nextWidth;
				curWidth -= nextWidth;

				if (src.AtEndOfStream && !dst.AtEndOfStream) {
					Debug.WriteLine("Reached unexpected end of source buffer while decoding variable-length compression codes");
					throw new EndOfStreamException();
				}

				// Progress bar.
				if (((src.Position * 100) / src.Length) >= (progress * 25)) {
					Debug.WriteLine("{0}", progress++ * 25);
				}
			}

			Debug.WriteLine("]");

			if (src.Position < src.Length) {
				Debug.WriteLine("Variable-length decoding finished with unprocessed data left in source buffer ({0} bytes left)\n", src.Length - src.Position);
			}
		}

		// Read file length: WORD remainder + BYTE multiplier * 0x10000.
		int stpk_getLength ( Reader buf )
		{
			int len = buf.ReadUShort();
			len += 0x10000 * buf.ReadByte(); // Add multiplier.
			return len;
		}

		//// Write bit values as string to stpk_b16. Used in verbose output.
		//char *stpk_stringBits16(ushort val)
		//{
		//	int i;
		//	for (i = 0; i <  16; i++) stpk_b16[(16 - 1) - i] = '0' + STPK_GET_FLAG(val, (1 << i));
		//	stpk_b16[i] = 0;

		//	return stpk_b16;
		//}

		//// Print formatted array. Used in verbose output.
		//void stpk_printArray(byte *arr, uint len, char *name)
		//{
		//	uint i = 0;

		//	printf("  %s[%02X]\n", name, len);
		//	printf("    0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F\n");

		//	while (i < len) {
		//		if ((i % 0x10) == 0) printf(" %2X", i / 0x10);
		//		printf(" %02X", arr[i++]);
		//		if ((i % 0x10) == 0) printf("\n");
		//	}

		//	if ((i % 0x10) != 0) printf("\n");
		//	printf("\n");
		//}

		bool STPK_GET_FLAG ( uint value, uint flag )
		{
			return (value & flag) == flag;
		}

	}
}
