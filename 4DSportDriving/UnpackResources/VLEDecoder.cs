using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FileUtils;

namespace UnpackResources
{
	public class VLEDecoder: IDecoder
	{
		Alphabet[] alphabets;
		byte[] symbols;
		byte[] widths;

		public void Decode ( Reader source, Writer destination )
		{
			ReadHeader(source);
			throw new NotImplementedException();
		}

		private void ReadHeader (Reader source) {
			byte alphabetLength = source.ReadByte();
			alphabets = new Alphabet[alphabetLength];

			uint inc = 0, totalLength = 0;

			for (byte i = 0; i < alphabetLength; i++) {
				var curalphabet = alphabets[i] = new Alphabet(i);
				inc <<= 1;
				curalphabet.Escape1 = (ushort)(totalLength - inc);

				byte tmp = source.ReadByte();
				curalphabet.Length = tmp;

				inc += tmp;
				curalphabet.Escape2 = (ushort)inc;
			}
			for (byte i = 0; i < alphabetLength; i++) {
				alphabets[i].Symbols = source.ReadByteArray(alphabets[i].Length);
				Debug.WriteLine("  {0}", alphabets[i]);
			}

			var alphabet = alphabets.SelectMany(a => a.Symbols).ToArray();
			StuntUnpack.DebugWriteArray("alphabet", alphabet);
			GenerateLookup(alphabet);
			
		}

		private void GenerateLookup (byte[] alphabet)
		{
			uint i = 0, j = 0;
			uint widthDistributionLength = ((uint)alphabets.Length >= 8 ? 8 : (uint)alphabets.Length);
			byte symbolsCount = StuntUnpack.STPK_VLE_BYTE_MSB;

			for (byte width = 1; width <= widthDistributionLength; width++) {
				foreach (var a in alphabets) {
					for (byte symbsWidth = a.Length; symbsWidth > 0; symbsWidth--) {
						for (byte symbsCountLeft = symbolsCount; symbsCountLeft > 0; symbsCountLeft--) {
							symbols[i] = alphabet[j];
							widths[i] = width;
							i++;
						}

						j++;
					}

				}

				symbolsCount >>= 1;
			}
		}
	}

	class Alphabet
	{
		public int Index { get; private set; }
		public byte Length { get; set; }
		public ushort Escape1 { get; set; }
		public ushort Escape2 { get; set; }
		public byte[] Symbols { get; set; }

		public Alphabet ( int index )
		{
			this.Index = index;
		}

		public override string ToString ()
		{
			return string.Format("Index = {0}; Length = {1}; Escape1 = {2}; Escape2 = {3}; Symbols[{4}] = {{ {5} }};",
				this.Index,
				this.Length,
				this.Escape1,
				this.Escape2,
				this.Symbols.Length,
				string.Join(", ",this.Symbols.Select(s=>s.ToString("X").PadLeft(2, '0'))));
		}
	}
}
