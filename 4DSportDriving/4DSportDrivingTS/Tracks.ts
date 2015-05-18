/// <reference path="FileUtils.ts"/>
module Tracks {
    export class Element {
        Terrain: number;
        Obj: number;

        constructor(Terrain: number, Obj: number) {
            this.Terrain = Terrain;
            this.Obj = Obj;
        }
    }

    export class StuntTrack implements FileUtils.IReader<Track> {
        public Read(Reader: FileUtils.Reader): Track {
            var size: number = Math.sqrt((Reader.Length / 2) - 1);
            if (size != Math.round(size)) {
                throw new RangeException();
            }

            var track = new Track();

            track.SizeX = size;
            track.SizeY = size;

            track.Elements = new Array(track.SizeX);

            //read terrain
            var objects = Reader.ReadArray2(track.SizeX, track.SizeY);
            track.Horizon = Reader.ReadByte();
            var terrain = Reader.ReadArray2(track.SizeX, track.SizeY);
            var unkown = Reader.ReadByte();

            for (var x: number = 0; x < track.SizeX; x++) {
                track.Elements[x] = new Array<Element>(track.SizeY);
                for (var y: number = 0; y < track.SizeY; y++) {
                    track.Elements[x][y] = new Element(terrain[y][x], objects[size-1-y][x]);
                }
            }
            return track;
        }
    }

    export class Track  {
        public SizeX: number;
        public SizeY: number;
        public Elements: Array<Array<Element>>;
        public Horizon: number;
    }

    export class Tile {
        Image: HTMLImageElement;

        constructor(url: string) {
            this.Image = new Image();
            this.Image.src = url;
        }
    }

    export var TerrainTiles = {
        0x00: new Tile("Graphics/terrain/0x00.png"),
        0x01: new Tile("Graphics/terrain/0x01.png"),
        0x02: new Tile("Graphics/terrain/0x02.png"),
        0x03: new Tile("Graphics/terrain/0x03.png"),
        0x04: new Tile("Graphics/terrain/0x04.png"),
        0x05: new Tile("Graphics/terrain/0x05.png"),
        0x06: new Tile("Graphics/terrain/0x06.png"),
        0x07: new Tile("Graphics/terrain/0x07.png"),
        0x08: new Tile("Graphics/terrain/0x08.png"),
        0x09: new Tile("Graphics/terrain/0x09.png"),
        0x0a: new Tile("Graphics/terrain/0x0a.png"),
        0x0b: new Tile("Graphics/terrain/0x0b.png"),
        0x0c: new Tile("Graphics/terrain/0x0c.png"),
        0x0d: new Tile("Graphics/terrain/0x0d.png"),
        0x0e: new Tile("Graphics/terrain/0x0e.png"),
        0x0f: new Tile("Graphics/terrain/0x0f.png"),
        0x10: new Tile("Graphics/terrain/0x10.png"),
        0x11: new Tile("Graphics/terrain/0x11.png"),
        0x12: new Tile("Graphics/terrain/0x12.png")
    }

    export var TrackTiles = {
        0x01: new Tile("Graphics/track/0x01.png"),
        0x04: new Tile("Graphics/track/0x04.png"),
        0x05: new Tile("Graphics/track/0x05.png"),
        0x06: new Tile("Graphics/track/0x06.png"),
        0x07: new Tile("Graphics/track/0x07.png"),
        0x08: new Tile("Graphics/track/0x08.png"),
        0x09: new Tile("Graphics/track/0x09.png"),
        0x0a: new Tile("Graphics/track/0x0a.png"),
        0x0b: new Tile("Graphics/track/0x0b.png"),
        0x0c: new Tile("Graphics/track/0x0c.png"),
        0x0d: new Tile("Graphics/track/0x0d.png"),
        0x0e: new Tile("Graphics/track/0x0e.png"),
        0x0f: new Tile("Graphics/track/0x0f.png"),
        0x10: new Tile("Graphics/track/0x10.png"),
        0x11: new Tile("Graphics/track/0x11.png"),
        0x12: new Tile("Graphics/track/0x12.png"),
        0x13: new Tile("Graphics/track/0x13.png"),
        0x14: new Tile("Graphics/track/0x14.png"),
        0x15: new Tile("Graphics/track/0x15.png"),
        0x16: new Tile("Graphics/track/0x16.png"),
        0x17: new Tile("Graphics/track/0x17.png"),
        0x18: new Tile("Graphics/track/0x18.png"),
        0x19: new Tile("Graphics/track/0x19.png"),
        0x1a: new Tile("Graphics/track/0x1a.png"),
        0x1b: new Tile("Graphics/track/0x1b.png"),
        0x1c: new Tile("Graphics/track/0x1c.png"),
        0x1d: new Tile("Graphics/track/0x1d.png"),
        0x1e: new Tile("Graphics/track/0x1e.png"),
        0x1f: new Tile("Graphics/track/0x1f.png"),
        0x20: new Tile("Graphics/track/0x20.png"),
        0x21: new Tile("Graphics/track/0x21.png"),
        0x22: new Tile("Graphics/track/0x22.png"),
        0x23: new Tile("Graphics/track/0x23.png"),
        0x24: new Tile("Graphics/track/0x24.png"),
        0x25: new Tile("Graphics/track/0x25.png"),
        0x26: new Tile("Graphics/track/0x26.png"),
        0x27: new Tile("Graphics/track/0x27.png"),
        0x28: new Tile("Graphics/track/0x28.png"),
        0x29: new Tile("Graphics/track/0x29.png"),
        0x2a: new Tile("Graphics/track/0x2a.png"),
        0x2b: new Tile("Graphics/track/0x2b.png"),
        0x2c: new Tile("Graphics/track/0x2c.png"),
        0x2d: new Tile("Graphics/track/0x2d.png"),
        0x2e: new Tile("Graphics/track/0x2e.png"),
        0x2f: new Tile("Graphics/track/0x2f.png"),
        0x30: new Tile("Graphics/track/0x30.png"),
        0x31: new Tile("Graphics/track/0x31.png"),
        0x32: new Tile("Graphics/track/0x32.png"),
        0x33: new Tile("Graphics/track/0x33.png"),
        0x34: new Tile("Graphics/track/0x34.png"),
        0x35: new Tile("Graphics/track/0x35.png"),
        0x36: new Tile("Graphics/track/0x36.png"),
        0x37: new Tile("Graphics/track/0x37.png"),
        0x38: new Tile("Graphics/track/0x38.png"),
        0x39: new Tile("Graphics/track/0x39.png"),
        0x3a: new Tile("Graphics/track/0x3a.png"),
        0x3b: new Tile("Graphics/track/0x3b.png"),
        0x3c: new Tile("Graphics/track/0x3c.png"),
        0x3d: new Tile("Graphics/track/0x3d.png"),
        0x3e: new Tile("Graphics/track/0x3e.png"),
        0x3f: new Tile("Graphics/track/0x3f.png"),
        0x40: new Tile("Graphics/track/0x40.png"),
        0x41: new Tile("Graphics/track/0x41.png"),
        0x42: new Tile("Graphics/track/0x42.png"),
        0x43: new Tile("Graphics/track/0x43.png"),
        0x44: new Tile("Graphics/track/0x44.png"),
        0x45: new Tile("Graphics/track/0x45.png"),
        0x46: new Tile("Graphics/track/0x46.png"),
        0x47: new Tile("Graphics/track/0x47.png"),
        0x48: new Tile("Graphics/track/0x48.png"),
        0x49: new Tile("Graphics/track/0x49.png"),
        0x4a: new Tile("Graphics/track/0x4a.png"),
        0x4b: new Tile("Graphics/track/0x4b.png"),
        0x4c: new Tile("Graphics/track/0x4c.png"),
        0x4d: new Tile("Graphics/track/0x4d.png"),
        0x4e: new Tile("Graphics/track/0x4e.png"),
        0x4f: new Tile("Graphics/track/0x4f.png"),
        0x50: new Tile("Graphics/track/0x50.png"),
        0x51: new Tile("Graphics/track/0x51.png"),
        0x52: new Tile("Graphics/track/0x52.png"),
        0x53: new Tile("Graphics/track/0x53.png"),
        0x54: new Tile("Graphics/track/0x54.png"),
        0x55: new Tile("Graphics/track/0x55.png"),
        0x56: new Tile("Graphics/track/0x56.png"),
        0x57: new Tile("Graphics/track/0x57.png"),
        0x58: new Tile("Graphics/track/0x58.png"),
        0x59: new Tile("Graphics/track/0x59.png"),
        0x5a: new Tile("Graphics/track/0x5a.png"),
        0x5b: new Tile("Graphics/track/0x5b.png"),
        0x5c: new Tile("Graphics/track/0x5c.png"),
        0x5d: new Tile("Graphics/track/0x5d.png"),
        0x5e: new Tile("Graphics/track/0x5e.png"),
        0x5f: new Tile("Graphics/track/0x5f.png"),
        0x60: new Tile("Graphics/track/0x60.png"),
        0x61: new Tile("Graphics/track/0x61.png"),
        0x62: new Tile("Graphics/track/0x62.png"),
        0x63: new Tile("Graphics/track/0x63.png"),
        0x64: new Tile("Graphics/track/0x64.png"),
        0x65: new Tile("Graphics/track/0x65.png"),
        0x66: new Tile("Graphics/track/0x66.png"),
        0x67: new Tile("Graphics/track/0x67.png"),
        0x68: new Tile("Graphics/track/0x68.png"),
        0x69: new Tile("Graphics/track/0x69.png"),
        0x6a: new Tile("Graphics/track/0x6a.png"),
        0x6b: new Tile("Graphics/track/0x6b.png"),
        0x6c: new Tile("Graphics/track/0x6c.png"),
        0x6d: new Tile("Graphics/track/0x6d.png"),
        0x6e: new Tile("Graphics/track/0x6e.png"),
        0x6f: new Tile("Graphics/track/0x6f.png"),
        0x70: new Tile("Graphics/track/0x70.png"),
        0x71: new Tile("Graphics/track/0x71.png"),
        0x72: new Tile("Graphics/track/0x72.png"),
        0x73: new Tile("Graphics/track/0x73.png"),
        0x74: new Tile("Graphics/track/0x74.png"),
        0x75: new Tile("Graphics/track/0x75.png"),
        0x76: new Tile("Graphics/track/0x76.png"),
        0x77: new Tile("Graphics/track/0x77.png"),
        0x78: new Tile("Graphics/track/0x78.png"),
        0x79: new Tile("Graphics/track/0x79.png"),
        0x7a: new Tile("Graphics/track/0x7a.png"),
        0x7b: new Tile("Graphics/track/0x7b.png"),
        0x7c: new Tile("Graphics/track/0x7c.png"),
        0x7d: new Tile("Graphics/track/0x7d.png"),
        0x7e: new Tile("Graphics/track/0x7e.png"),
        0x7f: new Tile("Graphics/track/0x7f.png"),
        0x80: new Tile("Graphics/track/0x80.png"),
        0x81: new Tile("Graphics/track/0x81.png"),
        0x82: new Tile("Graphics/track/0x82.png"),
        0x83: new Tile("Graphics/track/0x83.png"),
        0x84: new Tile("Graphics/track/0x84.png"),
        0x85: new Tile("Graphics/track/0x85.png"),
        0x86: new Tile("Graphics/track/0x86.png"),
        0x87: new Tile("Graphics/track/0x87.png"),
        0x88: new Tile("Graphics/track/0x88.png"),
        0x89: new Tile("Graphics/track/0x89.png"),
        0x8a: new Tile("Graphics/track/0x8a.png"),
        0x8b: new Tile("Graphics/track/0x8b.png"),
        0x8c: new Tile("Graphics/track/0x8c.png"),
        0x8d: new Tile("Graphics/track/0x8d.png"),
        0x8e: new Tile("Graphics/track/0x8e.png"),
        0x8f: new Tile("Graphics/track/0x8f.png"),
        0x90: new Tile("Graphics/track/0x90.png"),
        0x91: new Tile("Graphics/track/0x91.png"),
        0x92: new Tile("Graphics/track/0x92.png"),
        0x93: new Tile("Graphics/track/0x93.png"),
        0x94: new Tile("Graphics/track/0x94.png"),
        0x95: new Tile("Graphics/track/0x95.png"),
        0x96: new Tile("Graphics/track/0x96.png"),
        0x97: new Tile("Graphics/track/0x97.png"),
        0x98: new Tile("Graphics/track/0x98.png"),
        0x99: new Tile("Graphics/track/0x99.png"),
        0x9a: new Tile("Graphics/track/0x9a.png"),
        0x9b: new Tile("Graphics/track/0x9b.png"),
        0x9c: new Tile("Graphics/track/0x9c.png"),
        0x9d: new Tile("Graphics/track/0x9d.png"),
        0x9e: new Tile("Graphics/track/0x9e.png"),
        0x9F: new Tile("Graphics/track/0x9F.png"),
        0xA0: new Tile("Graphics/track/0xA0.png"),
        0xA1: new Tile("Graphics/track/0xA1.png"),
        0xA2: new Tile("Graphics/track/0xA2.png"),
        0xa3: new Tile("Graphics/track/0xa3.png"),
        0xa4: new Tile("Graphics/track/0xa4.png"),
        0xa5: new Tile("Graphics/track/0xa5.png"),
        0xa6: new Tile("Graphics/track/0xa6.png"),
        0xa7: new Tile("Graphics/track/0xa7.png"),
        0xa8: new Tile("Graphics/track/0xa8.png"),
        0xa9: new Tile("Graphics/track/0xa9.png"),
        0xaa: new Tile("Graphics/track/0xaa.png"),
        0xab: new Tile("Graphics/track/0xab.png"),
        0xac: new Tile("Graphics/track/0xac.png"),
        0xad: new Tile("Graphics/track/0xad.png"),
        0xae: new Tile("Graphics/track/0xae.png"),
        0xaf: new Tile("Graphics/track/0xaf.png"),
        0xb0: new Tile("Graphics/track/0xb0.png"),
        0xb1: new Tile("Graphics/track/0xb1.png"),
        0xb2: new Tile("Graphics/track/0xb2.png"),
        0xb3: new Tile("Graphics/track/0xb3.png"),
        0xb4: new Tile("Graphics/track/0xb4.png"),
        0xb5: new Tile("Graphics/track/0xb5.png")
    }


}