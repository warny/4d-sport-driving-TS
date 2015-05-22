/// <reference path="FileUtils.ts"/>

module StuntCompression {
    export class StuntUnpack implements FileUtils.IUnpack {

        STPK_MAX_SIZE = 0xFFFFFF;
        STPK_PASSES_MASK = 0x7F;
        STPK_PASSES_RECUR = 0x80;

        STPK_TYPE_RLE = 0x01;
        STPK_TYPE_VLE = 0x02;

        STPK_RLE_ESCLEN_MASK = 0x7F;
        STPK_RLE_ESCLEN_MAX = 0x0A;
        STPK_RLE_ESCLEN_NOSEQ = 0x80;
        STPK_RLE_ESCLOOKUP_LEN = 0x100;
        STPK_RLE_ESCSEQ_POS = 0x01;

        STPK_VLE_WDTLEN_MASK = 0x7F;
        STPK_VLE_WDTLEN_MAX = 0x0F;
        STPK_VLE_WDTLEN_UNK = 0x80;

        STPK_VLE_ESCARR_LEN = 0x10;
        STPK_VLE_ALPH_LEN = 0x100;
        STPK_VLE_ESC_WIDTH = 0x40;
        STPK_VLE_BYTE_MSB = 0x80;

        Unpack(packed: FileUtils.Reader): Int8Array {
            console.log("Unpack");
            var reportedSize = packed.ReadUInt(4);
            var compType = reportedSize & this.STPK_PASSES_MASK;
            var decompSize = reportedSize >> 8;

            if ((compType >= 1) && (compType <= 2) && (packed.Length <= this.STPK_MAX_SIZE) && (packed.Length < decompSize)) {
                packed.Seek(packed.Position - 4);

                return this.stpk_decomp(packed, 0);
            }
            // Data doesn't fit compression header, give up.
            else {
                console.error("Invalid file. Reported size (", reportedSize, ") doesn't match actual file size (", packed.Length, ") or compression header.");
                throw new RangeException();
            }



            return null;
        }

        stpk_decomp(file: FileUtils.Reader, maxPasses: number): Int8Array {
            console.log("stpk_decomp");
            var src: FileUtils.Reader = file;
            var retval: number = 1;
            var finalLen: number;

            var passes: number = src.ReadByte();
            if (passes & this.STPK_PASSES_RECUR) {
                passes &= this.STPK_PASSES_MASK;
                console.log("  -passes=", passes);
                finalLen = this.stpk_getLength(src);
                console.log("  -finalLen=", finalLen);
                console.log("  -srcLen=", src.Length);
                console.log("  -ratio=", finalLen / src.Length);
            }
            else {
                src.Seek(src.Position - 1);
                passes = 1;
            }

            if (src.AtEndOfFile) {
                console.error("Reached EOF while parsing file header\n");
                throw new RangeException();
            }
            var dst: FileUtils.Writer;

            for (var i: number = 0; i < passes; i++) {
                console.log("Pass=", i + 1, "/", passes);
                var type: number = src.ReadByte();
                var dstLen: number = this.stpk_getLength(src);
                console.log("  -dstLen=", dstLen);

                dst = new FileUtils.Writer(dstLen);
                switch (type) {
                    case this.STPK_TYPE_RLE:
                        console.log("  -RunLengthEncoding");
                        this.stpk_decompRLE(src, dst);
                        break;
                    case this.STPK_TYPE_VLE:
                        console.log("  -VariableLengthEncoding");
                        this.stpk_decompVLE(src, dst);
                        break;
                    default:
                        console.log("  -Unrecognized packtype : ", type);
                        throw new RangeException();
                }
                if (i + 1 > maxPasses && passes != maxPasses) {
                    console.log("Parsing limited to ", maxPasses, " decompression pass(es), aborting.");
                    throw new RangeException();
                }

                src = new FileUtils.Reader(dst);
                dst = null;
            }

            return dst.Content;
        }

        stpk_decompRLE(src: FileUtils.Reader, dst: FileUtils.Writer) {
            console.log("stpk_decompRLE");

            var retval = 1;
            var srcLen: number;

            var unk: number, escLen: number;
            var esc: Int8Array;
            var escLookup: Int8Array = new Int8Array(this.STPK_RLE_ESCLOOKUP_LEN);

            srcLen = this.stpk_getLength(src);
            console.log("  -srcLen=", srcLen);

            unk = src.ReadByte();
            console.log("  -unk=", srcLen);
            if (unk != 0) {
                throw new RangeException();
            }

            //lit la table d'échappement RLE
            escLen = src.ReadByte();
            console.log("  -escLen=", escLen, ", masked(escLen)=", escLen & this.STPK_RLE_ESCLEN_MASK, ", nosequenced=", escLen & this.STPK_RLE_ESCLEN_NOSEQ)

            if ((escLen & this.STPK_RLE_ESCLEN_MASK) > this.STPK_RLE_ESCLEN_MAX) {
                console.log("  ! escLen & STPK_RLE_ESCLEN_MASK greater than max length ", this.STPK_RLE_ESCLEN_MAX,", got ", escLen & this.STPK_RLE_ESCLEN_MASK);
                return 1;
            }

            esc = src.ReadArray(escLen & this.STPK_RLE_ESCLEN_MASK);
            if (src.AtEndOfFile) {
                throw new RangeException();
            }

            for (var i = 0; i < this.STPK_RLE_ESCLOOKUP_LEN; i++) escLookup[i] = 0;
            for (var i = 0; i < (escLen & this.STPK_RLE_ESCLEN_MASK); i++) escLookup[esc[i]] = i + 1;

            var finalSrc: FileUtils.Reader;
            //décompresse le fichier
            if ((escLen & this.STPK_RLE_ESCLEN_NOSEQ) == 0) {
                var data = new FileUtils.Writer(dst.Length);
                this.stpk_rleDecodeSeq(src, data, esc[this.STPK_RLE_ESCSEQ_POS])

                finalSrc = new FileUtils.Reader(data.Content);
            } else {
                finalSrc = src;
            }

            this.stpk_rleDecodeOne(finalSrc, dst, esc);
        }

        stpk_rleDecodeSeq(src: FileUtils.Reader, dst: FileUtils.Writer, esc: number) {
            console.log("stpk_rleDecodeSeq");

	        var progress: number = 0;

            console.log("Decoding sequence runs...    ");
            console.log("srcOff dstOff rep seq");
            console.log("~~~~~~ ~~~~~~ ~~~ ~~~~~~~~");

            // We do not know the destination length for this pass, dst->len covers both RLE passes.
            while (!src.AtEndOfFile) {
                var cur: number = src.ReadByte();

                if (cur == esc) {
                    var seqOffset: number = dst.Position;
                    var seqLength: number = 0;
                    while ((cur = src.ReadByte()) != esc) {
                        if (src.AtEndOfFile) {
                            console.error("Reached end of source buffer before finding sequence end escape code %02X\n", esc);
                            throw new RangeException();
                        }
                        dst.WriteByte(cur);
                        seqLength++;
                    }

                    var rep: number = src.ReadByte() - 1; // Already wrote sequence once.

                    var sequence = dst.Content.subarray(seqOffset, seqOffset + seqLength);

                    for (var i = 0; i < rep; i++) {
                        dst.WriteArray(sequence);
                    }
                }
                else {
			        dst.WriteByte(cur);

                    if (dst.AtEndOfFile) {
                        console.error("Reached end of temporary buffer while writing non-RLE byte\n");
                        throw new RangeException();
                    }
                }

                // Progress bar
                console.debug("Progression : ", Math.ceil((100 * src.Position) / src.Length), "%");
                progress++;
            }
        }

        stpk_rleDecodeOne(src: FileUtils.Reader, dst: FileUtils.Writer, esc: Int8Array) {
            console.log("stpk_rleDecodeOne");


	        var progress:number = 0;

            console.log("Decoding single-byte runs... ");
            console.log("srcOff dstOff   rep cur");
            console.log("~~~~~~ ~~~~~~ ~~~~~ ~~~");

            while (!dst.AtEndOfFile) {
                var cur:number = src.ReadByte();

                if (src.AtEndOfFile) {
                    console.error("Reached unexpected end of source buffer while decoding single-byte runs");
                    throw new RangeException();
                }

                var rep;
                if (esc[cur] & 0xFF) {
                    switch (esc[cur]) {
                        case 1:
                            rep = src.ReadByte();
                            break;

                        case 3:
                            rep = src.ReadUInt(2);
                            break;

                        default:
                            rep = esc[cur] - 1;
                            break;
                    }
                    var cur: number = src.ReadByte();

                    for (var i: number = 0; i < rep; i++) {
                        dst.WriteByte(cur);
                    }

                }
                else {
                    dst.WriteByte(cur);
                }

                // Progress bar
                console.debug("Progression : ", Math.ceil((100 * src.Position) / src.Length), "%");
                progress++;
            }

            if (!src.AtEndOfFile) {
                console.warn("RLE decoding finished with unprocessed data left in source buffer (", src.Length - src.Position, " bytes left)\n");
            }

            return 0;
        }

        stpk_decompVLE(src: FileUtils.Reader, dst: FileUtils.Writer): void {
            console.log("stpk_decompVLE");

            var alphabet: Int16Array = new Int16Array(this.STPK_VLE_ALPH_LEN);
            var symbols: Int16Array = new Int16Array(this.STPK_VLE_ALPH_LEN);
            var widths: Int16Array = new Int16Array(this.STPK_VLE_ALPH_LEN);

            var esc1: Int32Array = new Int32Array(this.STPK_VLE_ESCARR_LEN);
            var esc2: Int32Array = new Int32Array(this.STPK_VLE_ESCARR_LEN);


            var widthsLen: number = src.ReadByte();
            var widthsOffset: number = src.Position;

            if ((widthsLen & this.STPK_VLE_WDTLEN_UNK) == this.STPK_VLE_WDTLEN_UNK) {
                console.error("Invalid source file. Unknown flag set in widthsLen");
                throw new RangeException();
            }
            else if ((widthsLen & this.STPK_VLE_WDTLEN_MASK) > this.STPK_VLE_WDTLEN_MAX) {
                console.error("widthsLen & STPK_VLE_WDTLEN_MASK greater than ", this.STPK_VLE_WDTLEN_MAX, ", got ", widthsLen & this.STPK_VLE_WDTLEN_MASK);
                throw new RangeException();
            }

            var alphLen: number = this.stpk_vleGenEsc(src, esc1, esc2, widthsLen);

            if (alphLen > this.STPK_VLE_ALPH_LEN) {
                console.error("alphLen greater than %02X, got %02X\n", this.STPK_VLE_ALPH_LEN, alphLen);
                throw new RangeException();
            }

            // Read alphabet.
            alphabet.set(src.ReadUIntArray(alphLen, 1), 0);

            if (src.AtEndOfFile) {
                console.log("Reached end of source buffer while parsing variable-length header");
                throw new RangeException();
            }

            var codesOffset: number = src.Position;

            src.Seek(widthsOffset);
            this.stpk_vleGenLookup(src, widthsLen, alphabet, symbols, widths);

	        src.Seek(codesOffset);
            this.stpk_vleDecode(src, dst, alphabet, symbols, widths, esc1, esc2);
        }

        stpk_vleGenEsc(src: FileUtils.Reader, esc1: Int32Array, esc2: Int32Array, widthsLen: number): number {
            console.log("stpk_vleGenEsc");


            var inc: number = 0;
            var alphLen: number = 0;

            for (var i: number = 0; i < widthsLen; i++) {
                inc <<= 1;
                esc1[i] = ((alphLen - inc) >>> 0) % 0x10000;
            
                var tmp: number = src.ReadByte();

                inc += tmp;
                alphLen += tmp;

                esc2[i] = inc % 0x10000;
            }

            return alphLen;
        }

        stpk_vleGenLookup(src: FileUtils.Reader, widthsLen: number, alphabet: Int16Array, symbols: Int16Array, widths: Int16Array) {
            console.log("stpk_vleGenLookup");

            var widthDistrLen: number = (widthsLen >= 8 ? 8 : widthsLen);
            var width: number = 1;

            var symbsCount: number = this.STPK_VLE_BYTE_MSB;

            var symbsWidth: number, symbsCountLeft: number;

            // Distribution of symbols and widths.
            var i: number = 0, j: number = 0;

            for (; width <= widthDistrLen; width++, symbsCount >>= 1) {
                for (symbsWidth = src.ReadByte(); symbsWidth > 0; symbsWidth--) {
                    j++;
                    for (symbsCountLeft = symbsCount; symbsCountLeft; symbsCountLeft--) {
                        i++;
                        symbols[i] = alphabet[j];
                        widths[i] = width;
                    }
                }
            } 

            // Pad widths.
            for (; i < this.STPK_VLE_ALPH_LEN; i++) {
                widths[i] = this.STPK_VLE_ESC_WIDTH;
            }
        }

        stpk_vleDecode(src: FileUtils.Reader, dst: FileUtils.Writer, alphabet: Int8Array, symbols: Int8Array, widths: Int8Array, esc1: Int32Array, esc2: Int32Array) {
            console.log("stpk_vleDecode");

            console.log("Decoding compression codes... ");
            console.log("srcOff dstOff cW nW curWord               cd    Description");

            var progress = 0;

            var curWidth = 8;
            var curWord: number = src.ReadUInt(2, true);

            while (!dst.AtEndOfFile) {
                console.log("~~~~~~ ~~~~~~ ~~ ~~ ~~~~~~~~~~~~~~~~~~~~~ ~~    ~~~~~~~~~~~~~~~~~~");

                var code: number = (curWord & 0xFF00) >> 8;

                var nextWidth: number = widths[code];

                if (nextWidth > 8) {
                    if (nextWidth != this.STPK_VLE_ESC_WIDTH) {
                        console.error("Invalid escape value. nextWidth != ", this.STPK_VLE_ESC_WIDTH, ", got ", nextWidth);
                        return 1;
                    }

                    code = (curWord & 0x00FF);
                    curWord >>= 8;
                    console.log("Escaping");

                    var ind: number = 7;
                    var done: boolean = false;

                    while (!done) {
                        if (curWidth == 0) {
                            code = src.ReadByte();
                            curWidth = 8;
                        }

                        curWord = (curWord << 1) + (((code & this.STPK_VLE_BYTE_MSB) == this.STPK_VLE_BYTE_MSB) ? 1 : 0);
                        code <<= 1;
                        curWidth--;
                        ind++;

                        if (ind >= this.STPK_VLE_ESCARR_LEN) {
                            console.error("Escape array index out of bounds (", ind," >= ", this.STPK_VLE_ESCARR_LEN,")");
                            throw new RangeException();
                        }

                        if (curWord < esc2[ind]) {
                            curWord += esc1[ind];

                            if (curWord > 0xFF) {
                                console.error("Alphabet index out of bounds (", curWord," > ", this.STPK_VLE_ALPH_LEN,")\n");
                                throw new RangeException();
                            }

					        dst.WriteByte(alphabet[curWord]);

                            done = true;
                        }
                    }

                    // Reset and continue.
                    curWord = (code << curWidth) | src.ReadByte();
                    nextWidth = 8 - curWidth;
                    curWidth = 8;
                }
                else {
			        dst.WriteByte(symbols[code]);

                    if (curWidth < nextWidth) {
                        curWord <<= curWidth;

                        nextWidth -= curWidth;
                        curWidth = 8;

                        curWord |= src.ReadByte();
                    }
                }

                curWord <<= nextWidth;
                curWidth -= nextWidth;

                if (src.AtEndOfFile && !dst.AtEndOfFile) {
                    console.error("Reached unexpected end of source buffer while decoding variable-length compression codes\n");
                    throw new RangeException();
                }

                // Progress bar.
                console.debug("Progression : ", Math.ceil((100 * src.Position) / src.Length), "%");
                progress++;
            }

            if (!src.AtEndOfFile) {
                console.warn("Variable-length decoding finished with unprocessed data left in source buffer (", src.Length - src.Position , " bytes left)\n");
            }
        }

        stpk_getLength(buf: FileUtils.Reader): number {
            console.log("stpk_getLength");

            var len: number = buf.ReadUInt(2);
            len += 0x10000 * buf.ReadByte();
            return len;
        }
    }
}