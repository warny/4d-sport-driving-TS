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

    export enum OrientationEnum {
        North = 0,
        South = Math.PI,
        West = Math.PI / 2,
        East = -Math.PI / 2
    }

    export class Objects {
        Orientation: OrientationEnum;
        Elements: string[];
        ZElements: string[];
        PaintJobs: number[];

        Terrain: number = null;
        IsReplacement: boolean = false;
        ReplaceTerrain: boolean = false;
        DimensionX: number;
        DimensionY: number;

        constructor(dimensionX: number, dimensionY: number, orientation: OrientationEnum, elements: string[], zelements: string[] = null, paintJobs: number[] = [0]) {
            this.Orientation = orientation;
            this.Elements = elements;
            this.ZElements = zelements != null ? zelements : elements;
            this.PaintJobs = paintJobs;
            this.DimensionX = dimensionX;
            this.DimensionY = dimensionY;
        }

        public ShiftX(scale: number): number {
            return scale * (Math.abs(Math.cos(this.Orientation)) * this.DimensionX + Math.abs(Math.sin(this.Orientation)) * this.DimensionY) / 2;
        }

        public ShiftY(scale: number): number {
            return scale * (Math.abs(Math.sin(this.Orientation)) * this.DimensionX + Math.abs(Math.cos(this.Orientation)) * this.DimensionY) / 2;
        }


    }

    export class ReplacementObjects extends Objects {
        constructor(terrain: number, dimensionX: number, dimensionY: number, orientation: OrientationEnum, elements: string[], zelements: string[]= null, paintJobs: number[]= [0], replaceTerrain = false) {
            super(dimensionX, dimensionY,orientation, elements, zelements, paintJobs);
            this.Terrain = terrain;
            this.IsReplacement = true;
            this.ReplaceTerrain = false;
            this.DimensionX = dimensionX;
            this.DimensionY = dimensionY;
        }
    }

    export interface ITile {
        Image: HTMLImageElement;
        Objects: Objects[];
    }

    export class Tile implements ITile {
        Image: HTMLImageElement;
        Objects: Objects[];

        constructor(url: string, ...objects: Objects[]) {
            this.Image = new Image();
            this.Image.src = url;
            this.Objects = objects;
        }
    }

    export class TerrainTile implements ITile {
        Image: HTMLImageElement;
        Objects: Objects[];
        TerrainHeight: number = 0;
        ObjectsHeight: number = 0;
        constructor(url: string, terrainHeight: number, objectsHeight:number, ...objects: Objects[]) {
            this.Image = new Image();
            this.TerrainHeight = terrainHeight;
            this.ObjectsHeight = objectsHeight;
            this.Image.src = url;
            this.Objects = objects;
        }
    }

    export var TerrainTiles = {
        0x00: new TerrainTile("Graphics/terrain/0x00.png", 0, 0),
        0x01: new TerrainTile("Graphics/terrain/0x01.png", 0, 0, new Objects(1, 1, OrientationEnum.South, ["lake"])),
        0x02: new TerrainTile("Graphics/terrain/0x02.png", 0, 0, new Objects(1, 1, OrientationEnum.South, ["lakc"])),
        0x03: new TerrainTile("Graphics/terrain/0x03.png", 0, 0, new Objects(1, 1, OrientationEnum.North, ["lakc"])),
        0x04: new TerrainTile("Graphics/terrain/0x04.png", 0, 0, new Objects(1, 1, OrientationEnum.East, ["lakc"])),
        0x05: new TerrainTile("Graphics/terrain/0x05.png", 0, 0, new Objects(1, 1, OrientationEnum.West, ["lakc"])),
        0x06: new TerrainTile("Graphics/terrain/0x06.png", 131, 131, new Objects(1, 1, OrientationEnum.West, ["high"])),
        0x07: new TerrainTile("Graphics/terrain/0x07.png", 0, 0, new Objects(1, 1, OrientationEnum.North, ["goup"])),
        0x08: new TerrainTile("Graphics/terrain/0x08.png", 0, 0, new Objects(1, 1, OrientationEnum.East , ["goup"])),
        0x09: new TerrainTile("Graphics/terrain/0x09.png", 0, 0, new Objects(1, 1, OrientationEnum.South, ["goup"])),
        0x0a: new TerrainTile("Graphics/terrain/0x0a.png", 0, 0, new Objects(1, 1, OrientationEnum.West , ["goup"])),
        0x0b: new TerrainTile("Graphics/terrain/0x0b.png", 0, 0, new Objects(1, 1, OrientationEnum.North, ["gouo"])),
        0x0c: new TerrainTile("Graphics/terrain/0x0c.png", 0, 0, new Objects(1, 1, OrientationEnum.East, ["gouo"])),
        0x0d: new TerrainTile("Graphics/terrain/0x0d.png", 0, 0, new Objects(1, 1, OrientationEnum.South, ["gouo"])),
        0x0e: new TerrainTile("Graphics/terrain/0x0e.png", 0, 0, new Objects(1, 1, OrientationEnum.West ,  ["gouo"])),
        0x0f: new TerrainTile("Graphics/terrain/0x0f.png", 0, 131, new Objects(1, 1, OrientationEnum.North, ["goui"])),
        0x10: new TerrainTile("Graphics/terrain/0x10.png", 0, 131, new Objects(1, 1, OrientationEnum.East, ["goui"])),
        0x11: new TerrainTile("Graphics/terrain/0x11.png", 0, 131, new Objects(1, 1, OrientationEnum.South, ["goui"])),
        0x12: new TerrainTile("Graphics/terrain/0x12.png", 0, 131, new Objects(1, 1, OrientationEnum.West ,  ["goui"]))
    }

    export var TrackTiles = {
        0x01: new Tile("Graphics/track/0x01.png", new Objects(1, 1, OrientationEnum.South, ["road", "fini"], ["zroa", "zfin"])),
        0x04: new Tile("Graphics/track/0x04.png", new Objects(1, 1, OrientationEnum.South, ["road"], ["zroa"])),
        0x05: new Tile("Graphics/track/0x05.png", new Objects(1, 1, OrientationEnum.West,  ["road"], ["zroa"])),
        0x06: new Tile("Graphics/track/0x06.png", new Objects(1, 1, OrientationEnum.East,  ["turn"], ["ztur"])),
        0x07: new Tile("Graphics/track/0x07.png", new Objects(1, 1, OrientationEnum.North, ["turn"], ["ztur"])),
        0x08: new Tile("Graphics/track/0x08.png", new Objects(1, 1, OrientationEnum.South, ["turn"], ["ztur"])),
        0x09: new Tile("Graphics/track/0x09.png", new Objects(1, 1, OrientationEnum.West,  ["turn"], ["ztur"])),
        0x0a: new Tile("Graphics/track/0x0a.png", new Objects(2, 2, OrientationEnum.East,  ["stur"], ["zstu"])),
        0x0b: new Tile("Graphics/track/0x0b.png", new Objects(2, 2, OrientationEnum.North, ["stur"], ["zstu"])),
        0x0c: new Tile("Graphics/track/0x0c.png", new Objects(2, 2, OrientationEnum.South, ["stur"], ["zstu"])),
        0x0d: new Tile("Graphics/track/0x0d.png", new Objects(2, 2, OrientationEnum.West,  ["stur"], ["zstu"])),
        0x0e: new Tile("Graphics/track/0x0e.png", new Objects(1, 1, OrientationEnum.South, ["road"], ["zroa"], [1])),
        0x0f: new Tile("Graphics/track/0x0f.png", new Objects(1, 1, OrientationEnum.West, ["road"], ["zroa"], [1])),
        0x10: new Tile("Graphics/track/0x10.png", new Objects(1, 1, OrientationEnum.East, ["turn"], ["ztur"], [1])),
        0x11: new Tile("Graphics/track/0x11.png", new Objects(1, 1, OrientationEnum.North, ["turn"], ["ztur"], [1])),
        0x12: new Tile("Graphics/track/0x12.png", new Objects(1, 1, OrientationEnum.South, ["turn"], ["ztur"], [1])),
        0x13: new Tile("Graphics/track/0x13.png", new Objects(1, 1, OrientationEnum.West, ["turn"], ["ztur"], [1])),
        0x14: new Tile("Graphics/track/0x14.png", new Objects(2, 2, OrientationEnum.East, ["stur"], ["zstu"], [1])),
        0x15: new Tile("Graphics/track/0x15.png", new Objects(2, 2, OrientationEnum.North, ["stur"], ["zstu"], [1])),
        0x16: new Tile("Graphics/track/0x16.png", new Objects(2, 2, OrientationEnum.South, ["stur"], ["zstu"], [1])),
        0x17: new Tile("Graphics/track/0x17.png", new Objects(2, 2, OrientationEnum.West,  ["stur"], ["zstu"], [1])),
        0x18: new Tile("Graphics/track/0x18.png", new Objects(1, 1, OrientationEnum.South, ["road"], ["zroa"], [2])),
        0x19: new Tile("Graphics/track/0x19.png", new Objects(1, 1, OrientationEnum.West, ["road"], ["zroa"], [2])),
        0x1a: new Tile("Graphics/track/0x1a.png", new Objects(1, 1, OrientationEnum.East, ["turn"], ["ztur"], [2])),
        0x1b: new Tile("Graphics/track/0x1b.png", new Objects(1, 1, OrientationEnum.North, ["turn"], ["ztur"], [2])),
        0x1c: new Tile("Graphics/track/0x1c.png", new Objects(1, 1, OrientationEnum.South, ["turn"], ["ztur"], [2])),
        0x1d: new Tile("Graphics/track/0x1d.png", new Objects(1, 1, OrientationEnum.West, ["turn"], ["ztur"], [2])),
        0x1e: new Tile("Graphics/track/0x1e.png", new Objects(2, 2, OrientationEnum.East, ["stur"], ["zstu"], [2])),
        0x1f: new Tile("Graphics/track/0x1f.png", new Objects(2, 2, OrientationEnum.North, ["stur"], ["zstu"], [2])),
        0x20: new Tile("Graphics/track/0x20.png", new Objects(2, 2, OrientationEnum.South, ["stur"], ["zstu"], [2])),
        0x21: new Tile("Graphics/track/0x21.png", new Objects(2, 2, OrientationEnum.West,  ["stur"], ["zstu"], [2])),
        0x22: new Tile("Graphics/track/0x22.png", new Objects(1, 1, OrientationEnum.South, ["elrd"], ["zelr"])),
        0x23: new Tile("Graphics/track/0x23.png", new Objects(1, 1, OrientationEnum.West, ["elrd"], ["zelr"])),
        0x24: new Tile("Graphics/track/0x24.png", new Objects(1, 1, OrientationEnum.West, ["ramp"], ["zram"]), new ReplacementObjects(0x07, 1, 1, OrientationEnum.West, ["elsp"], ["zesp"])),
        0x25: new Tile("Graphics/track/0x25.png", new Objects(1, 1, OrientationEnum.East, ["ramp"], ["zram"]), new ReplacementObjects(0x07, 1, 1, OrientationEnum.East, ["elsp"], ["zesp"])),
        0x26: new Tile("Graphics/track/0x26.png", new Objects(1, 1, OrientationEnum.North, ["ramp"], ["zram"]), new ReplacementObjects(0x07, 1, 1, OrientationEnum.North, ["elsp"], ["zesp"])),
        0x27: new Tile("Graphics/track/0x27.png", new Objects(1, 1, OrientationEnum.South, ["ramp"], ["zram"]), new ReplacementObjects(0x07, 1, 1, OrientationEnum.South, ["elsp"], ["zesp"])),
        0x28: new Tile("Graphics/track/0x28.png", new Objects(1, 1, OrientationEnum.North, ["rban"], ["zrba"])),
        0x29: new Tile("Graphics/track/0x29.png", new Objects(1, 1, OrientationEnum.West, ["rban"], ["zrba"])),
        0x2a: new Tile("Graphics/track/0x2a.png", new Objects(1, 1, OrientationEnum.South, ["rban"], ["zrba"])),
        0x2b: new Tile("Graphics/track/0x2b.png", new Objects(1, 1, OrientationEnum.East,  ["rban"], ["zrba"])),
        0x2c: new Tile("Graphics/track/0x2c.png", new Objects(1, 1, OrientationEnum.North, ["lban"], ["zlba"])),
        0x2d: new Tile("Graphics/track/0x2d.png", new Objects(1, 1, OrientationEnum.West, ["lban"], ["zlba"])),
        0x2e: new Tile("Graphics/track/0x2e.png", new Objects(1, 1, OrientationEnum.South, ["lban"], ["zlba"])),
        0x2f: new Tile("Graphics/track/0x2f.png", new Objects(1, 1, OrientationEnum.East, ["lban"], ["zlba"])),
        0x30: new Tile("Graphics/track/0x30.png", new Objects(1, 1, OrientationEnum.South, ["bank"], ["zban"])),
        0x31: new Tile("Graphics/track/0x31.png", new Objects(1, 1, OrientationEnum.North, ["bank"], ["zban"])),
        0x32: new Tile("Graphics/track/0x32.png", new Objects(1, 1, OrientationEnum.East, ["bank"], ["zban"])),
        0x33: new Tile("Graphics/track/0x33.png", new Objects(1, 1, OrientationEnum.West, ["bank"], ["zban"])),
        0x34: new Tile("Graphics/track/0x34.png", new Objects(2, 2, OrientationEnum.East, ["btur"], ["zbtu"])),
        0x35: new Tile("Graphics/track/0x35.png", new Objects(2, 2, OrientationEnum.North, ["btur"], ["zbtu"])),
        0x36: new Tile("Graphics/track/0x36.png", new Objects(2, 2, OrientationEnum.South, ["btur"], ["zbtu"])),
        0x37: new Tile("Graphics/track/0x37.png", new Objects(2, 2, OrientationEnum.West, ["btur"], ["zbtu"])),
        0x38: new Tile("Graphics/track/0x38.png", new Objects(1, 1, OrientationEnum.West, ["brid"], ["zbri"]), new ReplacementObjects(0x07, 1, 1, OrientationEnum.West, ["elsp"], ["zesp"])),
        0x39: new Tile("Graphics/track/0x39.png", new Objects(1, 1, OrientationEnum.East, ["brid"], ["zbri"]),  new ReplacementObjects(0x07, 1, 1, OrientationEnum.East, ["elsp"], ["zesp"])),
        0x3a: new Tile("Graphics/track/0x3a.png", new Objects(1, 1, OrientationEnum.North, ["brid"], ["zbri"]), new ReplacementObjects(0x07, 1, 1, OrientationEnum.North, ["elsp"], ["zesp"])),
        0x3b: new Tile("Graphics/track/0x3b.png", new Objects(1, 1, OrientationEnum.South, ["brid"], ["zbri"]), new ReplacementObjects(0x07, 1, 1, OrientationEnum.South, ["elsp"], ["zesp"])),
        0x3c: new Tile("Graphics/track/0x3c.png", new Objects(2, 2, OrientationEnum.South, ["chi2"], ["zch2"])),
        0x3d: new Tile("Graphics/track/0x3d.png", new Objects(2, 2, OrientationEnum.East, ["chi2"], ["zch2"])),
        0x3e: new Tile("Graphics/track/0x3e.png", new Objects(2, 2, OrientationEnum.South, ["chi1"], ["zch1"])),
        0x3f: new Tile("Graphics/track/0x3f.png", new Objects(2, 2, OrientationEnum.East, ["chi1"], ["zch1"])),
        0x40: new Tile("Graphics/track/0x40.png", new Objects(1, 2, OrientationEnum.South, ["loo1", "loop"], ["zloo"])),
        0x41: new Tile("Graphics/track/0x41.png", new Objects(1, 2, OrientationEnum.East, ["loo1", "loop"], ["zloo"])),
        0x42: new Tile("Graphics/track/0x42.png", new Objects(1, 1, OrientationEnum.South, ["tunn", "tun2"], ["ztun"])),
        0x43: new Tile("Graphics/track/0x43.png", new Objects(1, 1, OrientationEnum.East, ["tunn"], ["tun2"])),
        0x44: new Tile("Graphics/track/0x44.png", new Objects(1, 1, OrientationEnum.South, ["pipe", "pip2"], ["zpip"])),
        0x45: new Tile("Graphics/track/0x45.png", new Objects(1, 1, OrientationEnum.East, ["pipe", "pip2"], ["zpip"])),
        0x46: new Tile("Graphics/track/0x46.png", new Objects(1, 1, OrientationEnum.North, ["spip"], ["zspi"])),
        0x47: new Tile("Graphics/track/0x47.png", new Objects(1, 1, OrientationEnum.South, ["spip"], ["zspi"])),
        0x48: new Tile("Graphics/track/0x48.png", new Objects(1, 1, OrientationEnum.East, ["spip"], ["zspi"])),
        0x49: new Tile("Graphics/track/0x49.png", new Objects(1, 1, OrientationEnum.West, ["spip"], ["zspi"])),
        0x4a: new Tile("Graphics/track/0x4a.png", new Objects(1, 1, OrientationEnum.South, ["inte"], ["zint"])),
        0x4b: new Tile("Graphics/track/0x4b.png", new Objects(1, 1, OrientationEnum.North, ["offl"], ["zofl"])),
        0x4c: new Tile("Graphics/track/0x4c.png", new Objects(1, 1, OrientationEnum.East, ["offl"], ["zofl"])),
        0x4d: new Tile("Graphics/track/0x4d.png", new Objects(1, 1, OrientationEnum.South, ["offl"], ["zofl"])),
        0x4e: new Tile("Graphics/track/0x4e.png", new Objects(1, 1, OrientationEnum.West, ["offl"], ["zofl"])),
        0x4f: new Tile("Graphics/track/0x4f.png", new Objects(1, 1, OrientationEnum.North, ["offr"], ["zofr"])),
        0x50: new Tile("Graphics/track/0x50.png", new Objects(1, 1, OrientationEnum.South, ["offr"], ["zofr"])),
        0x51: new Tile("Graphics/track/0x51.png", new Objects(1, 1, OrientationEnum.East, ["offr"], ["zofr"])),
        0x52: new Tile("Graphics/track/0x52.png", new Objects(1, 1, OrientationEnum.West, ["offr"], ["zofr"])),
        0x53: new Tile("Graphics/track/0x53.png", new Objects(1, 1, OrientationEnum.South, ["hpip", "pip2"], ["zhpi"])),
        0x54: new Tile("Graphics/track/0x54.png", new Objects(1, 1, OrientationEnum.East, ["hpip", "pip2"], ["zhpi"])),
        0x55: new Tile("Graphics/track/0x55.png", new Objects(1, 2, OrientationEnum.South, ["vcor"], ["zvcor"])),
        0x56: new Tile("Graphics/track/0x56.png", new Objects(1, 2, OrientationEnum.East, ["vcor"], ["zvcor"])),
        0x57: new Tile("Graphics/track/0x57.png", new Objects(2, 2, OrientationEnum.North, ["sofl"], ["zsol"])),
        0x58: new Tile("Graphics/track/0x58.png", new Objects(2, 2, OrientationEnum.South, ["sofl"], ["zsol"])),
        0x59: new Tile("Graphics/track/0x59.png", new Objects(2, 2, OrientationEnum.East, ["sofl"], ["zsol"])),
        0x5a: new Tile("Graphics/track/0x5a.png", new Objects(2, 2, OrientationEnum.West, ["sofl"], ["zsol"])),
        0x5b: new Tile("Graphics/track/0x5b.png", new Objects(2, 2, OrientationEnum.North, ["sofr"], ["zsor"])),
        0x5c: new Tile("Graphics/track/0x5c.png", new Objects(2, 2, OrientationEnum.East, ["sofr"], ["zsor"])),
        0x5d: new Tile("Graphics/track/0x5d.png", new Objects(2, 2, OrientationEnum.South, ["sofr"], ["zsor"])),
        0x5e: new Tile("Graphics/track/0x5e.png", new Objects(2, 2, OrientationEnum.West,  ["sofr"], ["zsor"])),
        0x5f: new Tile("Graphics/track/0x5f.png", new Objects(1, 1, OrientationEnum.West, ["sram"], ["zsra"]), new ReplacementObjects(0x07, 1, 1, OrientationEnum.West, ["elsp"], ["zesp"])),
        0x60: new Tile("Graphics/track/0x60.png", new Objects(1, 1, OrientationEnum.East, ["sram"], ["zsra"]), new ReplacementObjects(0x07, 1, 1, OrientationEnum.East, ["elsp"], ["zesp"])),
        0x61: new Tile("Graphics/track/0x61.png", new Objects(1, 1, OrientationEnum.North,  ["sram"], ["zsra"]), new ReplacementObjects(0x07, 1, 1, OrientationEnum.North, ["elsp"], ["zesp"])),
        0x62: new Tile("Graphics/track/0x62.png", new Objects(1, 1, OrientationEnum.South, ["sram"], ["zsra"]), new ReplacementObjects(0x07, 1, 1, OrientationEnum.South, ["elsp"], ["zesp"])),
        0x63: new Tile("Graphics/track/0x63.png", new Objects(1, 1, OrientationEnum.South, ["elrd"], ["zelr"])),
        0x64: new Tile("Graphics/track/0x64.png", new Objects(1, 1, OrientationEnum.West,  ["elrd"], ["zelr"])),
        0x65: new Tile("Graphics/track/0x65.png", new Objects(1, 1, OrientationEnum.South, ["elrd"], ["zelr"]), new Objects(1, 1, OrientationEnum.West, ["road"], ["zroa"])),
        0x66: new Tile("Graphics/track/0x66.png", new Objects(1, 1, OrientationEnum.West, ["elrd"], ["zelr"]), new Objects(1, 1, OrientationEnum.South, ["road"], ["zroa"])),
        0x67: new Tile("Graphics/track/0x67.png", new Objects(1, 1, OrientationEnum.South, ["selr"], ["zser"])),
        0x68: new Tile("Graphics/track/0x68.png", new Objects(1, 1, OrientationEnum.West, ["selr"], ["zser"])),
        0x69: new Tile("Graphics/track/0x69.png", new Objects(2, 2, OrientationEnum.East, ["sest"], ["zses"])),
        0x6a: new Tile("Graphics/track/0x6a.png", new Objects(2, 2, OrientationEnum.North, ["sest"], ["zses"])),
        0x6b: new Tile("Graphics/track/0x6b.png", new Objects(2, 2, OrientationEnum.South,  ["sest"], ["zses"])),
        0x6c: new Tile("Graphics/track/0x6c.png", new Objects(2, 2, OrientationEnum.West,  ["sest"], ["zses"])),
        0x6d: new Tile("Graphics/track/0x6d.png", new Objects(1, 1, OrientationEnum.South, ["wroa"], ["zwro"])),
        0x6e: new Tile("Graphics/track/0x6e.png", new Objects(1, 1, OrientationEnum.East, ["wroa"], ["zwro"])),
        0x6f: new Tile("Graphics/track/0x6f.png", new Objects(1, 1, OrientationEnum.North, ["gwro"], ["zgwr"])),
        0x70: new Tile("Graphics/track/0x70.png", new Objects(1, 1, OrientationEnum.West, ["gwro"], ["zgwr"])),
        0x71: new Tile("Graphics/track/0x71.png", new Objects(1, 1, OrientationEnum.South, ["gwro"], ["zgwr"])),
        0x72: new Tile("Graphics/track/0x72.png", new Objects(1, 1, OrientationEnum.East, ["gwro"], ["zgwr"])),
        0x73: new Tile("Graphics/track/0x73.png", new Objects(1, 1, OrientationEnum.South, ["barr", "road"], ["zbar"])),
        0x74: new Tile("Graphics/track/0x74.png", new Objects(1, 1, OrientationEnum.West, ["barr", "road"], ["zbar"])),
        0x75: new Tile("Graphics/track/0x75.png", new Objects(2, 2, OrientationEnum.North, ["lco0", "lco1"], ["zlco"])),
        0x76: new Tile("Graphics/track/0x76.png", new Objects(2, 2, OrientationEnum.East, ["lco0", "lco1"], ["zlco"])),
        0x77: new Tile("Graphics/track/0x77.png", new Objects(2, 2, OrientationEnum.South, ["lco0", "lco1"], ["zlco"])),
        0x78: new Tile("Graphics/track/0x78.png", new Objects(2, 2, OrientationEnum.West, ["lco0", "lco1"], ["zlco"])),
        0x79: new Tile("Graphics/track/0x79.png", new Objects(2, 2, OrientationEnum.North, ["rco0", "rco1"], ["zrco"])),
        0x7a: new Tile("Graphics/track/0x7a.png", new Objects(2, 2, OrientationEnum.East, ["rco0", "rco1"], ["zrco"])),
        0x7b: new Tile("Graphics/track/0x7b.png", new Objects(2, 2, OrientationEnum.South,  ["rco0", "rco1"], ["zrco"])),
        0x7c: new Tile("Graphics/track/0x7c.png", new Objects(2, 2, OrientationEnum.West,  ["rco0", "rco1"], ["zrco"])),
        0x7d: new Tile("Graphics/track/0x7d.png", new Objects(1, 1, OrientationEnum.South, ["inte"], ["zint"], [1])),
        0x7e: new Tile("Graphics/track/0x7e.png", new Objects(1, 1, OrientationEnum.North, ["offl"], ["zofl"], [1])),
        0x7f: new Tile("Graphics/track/0x7f.png", new Objects(1, 1, OrientationEnum.East, ["offl"], ["zofl"], [1])),
        0x80: new Tile("Graphics/track/0x80.png", new Objects(1, 1, OrientationEnum.South, ["offl"], ["zofl"], [1])),
        0x81: new Tile("Graphics/track/0x81.png", new Objects(1, 1, OrientationEnum.West, ["offl"], ["zofl"], [1])),
        0x82: new Tile("Graphics/track/0x82.png", new Objects(1, 1, OrientationEnum.North, ["offr"], ["zofr"], [1])),
        0x83: new Tile("Graphics/track/0x83.png", new Objects(1, 1, OrientationEnum.East, ["offr"], ["zofr"], [1])),
        0x84: new Tile("Graphics/track/0x84.png", new Objects(1, 1, OrientationEnum.South, ["offr"], ["zofr"], [1])),
        0x85: new Tile("Graphics/track/0x85.png", new Objects(1, 1, OrientationEnum.West, ["offr"], ["zofr"], [1])),
        0x86: new Tile("Graphics/track/0x86.png", new Objects(1, 1, OrientationEnum.North, ["road", "fini"], ["zroa", "zfin"], [1])),
        0x87: new Tile("Graphics/track/0x87.png", new Objects(1, 1, OrientationEnum.East, ["road", "fini"], ["zroa", "zfin"], [1])),
        0x88: new Tile("Graphics/track/0x88.png", new Objects(1, 1, OrientationEnum.South, ["road", "fini"], ["zroa", "zfin"], [1])),
        0x89: new Tile("Graphics/track/0x89.png", new Objects(1, 1, OrientationEnum.West, ["road", "fini"], ["zroa", "zfin"], [1])),
        0x8a: new Tile("Graphics/track/0x8a.png", new Objects(1, 1, OrientationEnum.South, ["inte"], ["zint"], [2])),
        0x8b: new Tile("Graphics/track/0x8b.png", new Objects(1, 1, OrientationEnum.North, ["offl"], ["zofl"], [2])),
        0x8c: new Tile("Graphics/track/0x8c.png", new Objects(1, 1, OrientationEnum.East, ["offl"], ["zofl"], [2])),
        0x8d: new Tile("Graphics/track/0x8d.png", new Objects(1, 1, OrientationEnum.South, ["offl"], ["zofl"], [2])),
        0x8e: new Tile("Graphics/track/0x8e.png", new Objects(1, 1, OrientationEnum.West, ["offl"], ["zofl"], [2])),
        0x8f: new Tile("Graphics/track/0x8f.png", new Objects(1, 1, OrientationEnum.North, ["offr"], ["zofr"], [2])),
        0x90: new Tile("Graphics/track/0x90.png", new Objects(1, 1, OrientationEnum.East,  ["offr"], ["zofr"], [2])),
        0x91: new Tile("Graphics/track/0x91.png", new Objects(1, 1, OrientationEnum.South, ["offr"], ["zofr"], [2])),
        0x92: new Tile("Graphics/track/0x92.png", new Objects(1, 1, OrientationEnum.West,  ["offr"], ["zofr"], [2])),
        0x93: new Tile("Graphics/track/0x93.png", new Objects(1, 1, OrientationEnum.North, ["road", "fini"], ["zroa", "zfin"], [2])),
        0x94: new Tile("Graphics/track/0x94.png", new Objects(1, 1, OrientationEnum.East,  ["road", "fini"], ["zroa", "zfin"], [2])),
        0x95: new Tile("Graphics/track/0x95.png", new Objects(1, 1, OrientationEnum.South, ["road", "fini"], ["zroa", "zfin"], [2])),
        0x96: new Tile("Graphics/track/0x96.png", new Objects(1, 1, OrientationEnum.West,  ["road", "fini"], ["zroa", "zfin"], [2])),
        0x97: new Tile("Graphics/track/0x97.png", new Objects(1, 1, OrientationEnum.South, ["palm"])),
        0x98: new Tile("Graphics/track/0x98.png", new Objects(1, 1, OrientationEnum.South, ["cact"])),
        0x99: new Tile("Graphics/track/0x99.png", new Objects(1, 1, OrientationEnum.South, ["tenn"])),
        0x9a: new Tile("Graphics/track/0x9a.png", new Objects(1, 1, OrientationEnum.South, ["tree"])),
        0x9b: new Tile("Graphics/track/0x9b.png", new Objects(1, 1, OrientationEnum.North, ["gass"], ["zgas"])),
        0x9c: new Tile("Graphics/track/0x9c.png", new Objects(1, 1, OrientationEnum.East, ["gass"], ["zgas"])),
        0x9d: new Tile("Graphics/track/0x9d.png", new Objects(1, 1, OrientationEnum.South, ["gass"], ["zgas"])),
        0x9e: new Tile("Graphics/track/0x9e.png", new Objects(1, 1, OrientationEnum.West,  ["gass"], ["zgas"])),
        0x9F: new Tile("Graphics/track/0x9F.png", new Objects(1, 1, OrientationEnum.North, ["barn"], ["zban"])),
        0xA0: new Tile("Graphics/track/0xA0.png", new Objects(1, 1, OrientationEnum.East, ["barn"], ["zban"])),
        0xA1: new Tile("Graphics/track/0xA1.png", new Objects(1, 1, OrientationEnum.South, ["barn"], ["zban"])),
        0xA2: new Tile("Graphics/track/0xA2.png", new Objects(1, 1, OrientationEnum.West,  ["barn"], ["zban"])),
        0xa3: new Tile("Graphics/track/0xa3.png", new Objects(1, 1, OrientationEnum.North, ["offi"], ["zoff"])),
        0xa4: new Tile("Graphics/track/0xa4.png", new Objects(1, 1, OrientationEnum.East, ["offi"], ["zoff"])),
        0xa5: new Tile("Graphics/track/0xa5.png", new Objects(1, 1, OrientationEnum.South, ["offi"], ["zoff"])),
        0xa6: new Tile("Graphics/track/0xa6.png", new Objects(1, 1, OrientationEnum.West,  ["offi"], ["zoff"])),
        0xa7: new Tile("Graphics/track/0xa7.png", new Objects(1, 1, OrientationEnum.North, ["wind"], ["zwin"], [0, 1, 2, 3])),
        0xa8: new Tile("Graphics/track/0xa8.png", new Objects(1, 1, OrientationEnum.East, ["wind"], ["zwin"], [0, 1, 2, 3])),
        0xa9: new Tile("Graphics/track/0xa9.png", new Objects(1, 1, OrientationEnum.South, ["wind"], ["zwin"], [0, 1, 2, 3])),
        0xaa: new Tile("Graphics/track/0xaa.png", new Objects(1, 1, OrientationEnum.West,  ["wind"], ["zwin"], [0, 1, 2, 3])),
        0xab: new Tile("Graphics/track/0xab.png", new Objects(1, 1, OrientationEnum.North, ["boat"], ["zboa"])),
        0xac: new Tile("Graphics/track/0xac.png", new Objects(1, 1, OrientationEnum.East, ["boat"], ["zboa"])),
        0xad: new Tile("Graphics/track/0xad.png", new Objects(1, 1, OrientationEnum.South, ["boat"], ["zboa"])),
        0xae: new Tile("Graphics/track/0xae.png", new Objects(1, 1, OrientationEnum.West,  ["boat"], ["zboa"])),
        0xaf: new Tile("Graphics/track/0xaf.png", new Objects(1, 1, OrientationEnum.North, ["rest"], ["zres"], [0, 1, 2, 3])),
        0xb0: new Tile("Graphics/track/0xb0.png", new Objects(1, 1, OrientationEnum.East, ["rest"], ["zres"], [0, 1, 2, 3])),
        0xb1: new Tile("Graphics/track/0xb1.png", new Objects(1, 1, OrientationEnum.South, ["rest"], ["zres"], [0, 1, 2, 3])),
        0xb2: new Tile("Graphics/track/0xb2.png", new Objects(1, 1, OrientationEnum.West,  ["rest"], ["zres"], [0, 1, 2, 3])),
        0xb3: new Tile("Graphics/track/0xb3.png", new Objects(1, 1, OrientationEnum.North, ["road", "fini"], ["zroa", "zfin"])),
        0xb4: new Tile("Graphics/track/0xb4.png", new Objects(1, 1, OrientationEnum.East,  ["road", "fini"], ["zroa", "zfin"])),
        0xb5: new Tile("Graphics/track/0xb5.png", new Objects(1, 1, OrientationEnum.West,  ["road", "fini"], ["zroa", "zfin"]))
    }


}