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
            console.log(arguments.callee.name);


            return null;
        }

        stpk_decomp(file: FileUtils.Reader, maxPasses: number, verbose: number, err: string): Int8Array {
           console.log(arguments.callee.name);
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
                passes = 1;
            }

            if (src.AtEndOfFile) {
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

            return dst;
        }

        stpk_decompRLE(src: FileUtils.Reader, dst: FileUtils.Writer) {
            console.log(arguments.callee.name);
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
            console.log(arguments.callee.name);
        }
        stpk_rleDecodeOne(src: FileUtils.Reader, dst: FileUtils.Writer, esc: Int8Array) {
            console.log(arguments.callee.name);
        }

        stpk_decompVLE(src: FileUtils.Reader, dst: FileUtils.Writer) {
            console.log(arguments.callee.name);
        }
        stpk_vleGenEsc(src: FileUtils.Reader, esc1: Int8Array, esc2: Int8Array, widthsLen: number) {
            console.log(arguments.callee.name);
        }
        stpk_vleGenLookup(src: FileUtils.Reader, widthsLen: number, alphabet: Int8Array, symbols: Int8Array, widths: Int8Array) {
            console.log(arguments.callee.name);
        }
        stpk_vleDecode(src: FileUtils.Reader, dst: Int8Array, alphabet: Int8Array, symbols: Int8Array, widths: Int8Array, esc1: Int8Array, esc2: Int8Array) {
            console.log(arguments.callee.name);
        }

        stpk_getLength(buf: FileUtils.Reader): number {
            console.log(arguments.callee.name);
            var len: number = buf.ReadInt(2);
            len += 0x10000 * buf.ReadByte();
            return len;
        }
    }
}