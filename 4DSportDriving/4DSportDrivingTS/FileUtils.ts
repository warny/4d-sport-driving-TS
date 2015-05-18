module FileUtils {
    export class Reader {
        private __content: Int8Array;
        private __pos: number;
        private __minpos: number;
        private __maxpos: number;

        constructor(content: any, start: number = null, length: number = null) {
            if (content instanceof FileUtils.Reader) {
                content = content.__content;
            }
            else if (content instanceof Array) {
                content = new Int8Array(content);
            }
            else if (!(content instanceof Int8Array)) {
                throw new RangeException();
            }
            this.__minpos = start == null ? 0 : start;
            this.__maxpos = length == null || this.__minpos + length > content.length ? content.length : this.__minpos + length;

            this.__content = content;
            this.__pos = this.__minpos;
        }

        public static ReadBlob(blob: Blob, success: Function, fail: Function = null) {
            var reader = new FileReader();
            reader.onloadend = function (evt: ProgressEvent) {
                if (reader.readyState == reader.DONE) {
                    var content = new Int8Array(reader.result);
                    success(new Reader(content));
                }
            };
            reader.onerror = function (evt: ErrorEvent) {
                fail(evt.error.name);
            };
            reader.readAsArrayBuffer(blob);
        }

        public get Length(): number {
            return this.__maxpos - this.__minpos;
        }

        public get Position(): number {
            return this.__pos - this.__minpos;
        }

        public get AtEndOfFile(): boolean {
            return this.__maxpos <= this.__pos;
        }

        public Seek(position: number) {
            if (position >= 0 && position < this.__maxpos - this.__minpos) {
                this.__pos = position + this.__minpos;
            }
        }

        public Shift(shift: number) {
            if (this.__pos + shift < this.__minpos) {
                this.__pos = this.__minpos;
            }
            if (this.__pos + shift >= this.__maxpos) {
                this.__pos = this.__maxpos;
            }
            this.__pos += shift;
        }

        public ReadByte(): number {
            if (this.AtEndOfFile) return null;
            var value: number = this.__content[this.__pos++];
            if (value < 0) value = 256 + value;
            return value;
        }

        public ReadUInt(size: number): number {
            if (this.__maxpos <= (this.__pos + size)) return null;
            var value: number = 0;
            for (var i = 0; i < size; i++) {
                value = value + this.ReadByte() * Math.pow(256, i);
            }
            return value;
        }

        public ReadInt(size: number): number {
            if (this.__maxpos <= (this.__pos + size)) return null;
            var value: number = 0;
            var lastByte: number;
            for (var i = 0; i < size; i++) {
                lastByte = this.ReadByte();
                value = value + lastByte * Math.pow(256, i);
            }
            if (lastByte >= 128) {
                value = -value + 128 * Math.pow(256, size - 1);
            }
            return value;
        }

        public GetReader(length: number): Reader {
            return new Reader(this.__content, this.__pos, length);
        }

        public ReadArray(size: number): Int8Array {
            if (this.__maxpos <= (this.__pos + size)) return null;
            var value: Int8Array = this.__content.subarray(this.__pos, this.__pos + size);
            this.__pos += size;
            return value;
        }

        public ReadUIntArray(arraySize: number, numberSize: number) {
            if (this.__maxpos <= (this.__pos + arraySize * numberSize)) return null;
            var value: number[] = new Array<number>(arraySize);
            for (var i: number; i < arraySize; i++) {
                value[i] = this.ReadUInt(numberSize);
            }
        }

        public ReadIntArray(arraySize: number, numberSize: number) {
            if (this.__maxpos <= (this.__pos + arraySize * numberSize)) return null;
            var value: number[] = new Array<number>(arraySize);
            for (var i: number; i < arraySize; i++) {
                value[i] = this.ReadInt(numberSize);
            }
        }

        public ReadArray2(sizeX: number, sizeY: number): Int8Array[]{
            if (this.__maxpos <= (this.__pos + (sizeX * sizeY))) return null;
            var value: Int8Array[] = new Array<Int8Array>(sizeX);

            for (var x = 0; x < sizeX; x++) {
                value[x] = this.ReadArray(sizeY);
            }
            return value;
        }

        public ReadString(size?: number): string {
            if (this.__maxpos <= (this.__pos + size)) return null;
            var value: string = "";
            if (size == null) {
                for (var c: Number = this.ReadByte(); c != 0; c = this.ReadByte()) {
                    value += String.fromCharCode(this.ReadByte());
                }
            } else {
                for (var i = 0; i < size; i++) {
                    value += String.fromCharCode(this.ReadByte());
                }
            }
            return value;
        }

        public Unpack(packAlgorithm: IUnpack) {
            this.__content = packAlgorithm.Unpack(this);
            this.__minpos = 0;
            this.__maxpos = this.__content.length;
        }
    }

    export class Writer {
        private __content: Int8Array;
        private __pos: number;

        constructor(length: number, position: number = 0) {
            this.__content = new Int8Array(length);
            this.__pos = position;
        }

        public get Length() {
            return this.__content.length;
        }

        public get Position(): number {
            return this.__pos;
        }

        public get Content() {
            return this.__content;
        }

        public get AtEndOfFile(): boolean {
            return this.__content.length <= this.__pos;
        }

        public Seek(position: number) {
            if (position >= 0 && position < this.__content.length) {
                this.__pos = position;
            }
        }

        public WriteByte(byte: number): void {
            if (byte < -128 || byte >= 256) {
                throw new RangeException();
            }
            if (byte >= 128) { byte = byte - 256; }

            this.__content[this.__pos++] = byte;
        }

    }

    export interface IUseReader {
        Read(Reader: FileUtils.Reader);
    }

    export interface IReader<T> {
        Read(Reader: FileUtils.Reader) : T;
    }

    export interface IUnpack {
        Unpack(packed: Reader): Int8Array;
    }
}