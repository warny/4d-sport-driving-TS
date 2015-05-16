﻿module FileUtils {
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

        get Length(): number {
            return this.__content.length;
        }

        get Position(): number {
            return this.__pos - this.__minpos;
        }

        get AtEndOfFile(): boolean {
            return this.__maxpos <= this.__pos;
        }

        Seek(position: number) {
            if (position >= 0 && position < this.__maxpos - this.__minpos) {
                this.__pos = position + this.__minpos;
            }
        }

        Shift(shift: number) {
            if (this.__pos + shift < this.__minpos) {
                this.__pos = this.__minpos;
            }
            if (this.__pos + shift >= this.__maxpos) {
                this.__pos = this.__maxpos;
            }
            this.__pos += shift;
        }

        ReadByte(): number {
            if (this.AtEndOfFile) return null;
            return this.__content[this.__pos++];
        }

        ReadUInt(size: number): number {
            if (this.__maxpos <= (this.__pos + size)) return null;
            var value: number;
            for (var i = 0; i < size; i++) {
                value = value + this.ReadByte() * 256 ^ i;
            }
            return value;
        }

        ReadInt(size: number): number {
            if (this.__maxpos <= (this.__pos + size)) return null;
            var value: number;
            var lastByte: number;
            for (var i = 0; i < size; i++) {
                lastByte = this.ReadByte();
                value = value + lastByte * 256 ^ i;
            }
            if (lastByte >= 128) {
                value = -(value - 128 * (256 ^ (size - 1)));
            }
            return value;
        }

        GetReader(length: number): Reader {
            return new Reader(this.__content, this.__pos, length);
        }

        ReadArray(size: number): Int8Array {
            if (this.__maxpos <= (this.__pos + size)) return null;
            var value: Int8Array = this.__content.subarray(this.__pos, this.__pos + size);
            this.__pos += size;
            return value;
        }

        ReadIntArray(arraySize: number, numberSize: number) {
            if (this.__maxpos <= (this.__pos + arraySize * numberSize)) return null;
            var value: number[] = new Array<number>(arraySize);
            for (var i: number; i < arraySize; i++) {
                value[i] = this.ReadUInt(numberSize);
            }
        }

        ReadArray2(sizeX: number, sizeY: number): Int8Array[] {
            if (this.__maxpos <= (this.__pos + (sizeX * sizeY))) return null;
            var value: Int8Array[] = new Array<Int8Array>(sizeX);

            for (var x = 0; x < sizeX; x++) {
                value[x] = this.ReadArray(sizeY);
            }
            return value;
        }

        ReadString(size?: number): string {
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
        }
    }

    export interface IUseReader {
        Read(Reader: FileUtils.Reader);
    }

}