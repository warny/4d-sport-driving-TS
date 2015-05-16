/// <reference path="FileUtils.ts"/>
/// <reference path="Resources.ts"/>

module ResourcesFiles {


    class ResourceInfo {
        Id: string;
        Start: number;
        Length: number;
        Datas: FileUtils.Reader;

        constructor(id: string) {
            this.Id = id;
        }
    }

    class ResourceFile {

        public Read(Reader : FileUtils.Reader) {
            var fileLength: number = Reader.ReadUInt(4);
            if (fileLength != Reader.Length) throw new RangeException(); //"declare length is different from file length"

            var numResources: number = Reader.ReadUInt(2);

            var resourcesInfo: Array<ResourceInfo> = new ResourceInfo[numResources];

            for (var i = 0; i < numResources; i++) {
                resourcesInfo[i] = new ResourceInfo(Reader.ReadString(4));
            }

            var lastResource: ResourceInfo = null;
            for (var i = 0; i < numResources; i++) {
                resourcesInfo[i].Start = Reader.ReadUInt(4);
                if (lastResource != null) lastResource.Length = resourcesInfo[i].Start - lastResource.Start;
            }
            lastResource.Length = Reader.Length - lastResource.Start;

            for (var resourceInfo in resourcesInfo) {
                Reader.Seek(resourceInfo.Start);
                resourceInfo.Datas = Reader.GetReader(resourceInfo.Length);
            }
        }
    }

    class ResourceString implements FileUtils.IUseReader {
        public Value: string;

        public Read(Reader: FileUtils.Reader) {
            this.Value = Reader.ReadString();
        }
    }

    class ResourceBitmap implements FileUtils.IUseReader {
        Bitmap: ImageData;
        OffsetX: number;
        OffsetY: number;

        public Read(Reader: FileUtils.Reader) {
            var width: number = Reader.ReadUInt(2);    //uint16 
            var height: number = Reader.ReadUInt(2);    //uint16 
            var unknown1: number[] = Reader.ReadIntArray(2, 2);    //uint16 [2]
            var positionX: number = Reader.ReadUInt(2);    //uint16 
            var positionY: number = Reader.ReadUInt(2);    //uint16 
            var unknown2: Int8Array = Reader.ReadArray(4);    //uint8  [4]

            var image: Int8Array = Reader.ReadArray(width * height); //uint8[width * height]

            this.Bitmap = new ImageData();
            this.Bitmap.width = width;
            this.Bitmap.height = height;

            for (var i: number = 0; i < image.length; i++) {
                var color = Resources.Palette.Colors[image[i]];
                this.Bitmap.data[i * 4 + 0] = color.Red;
                this.Bitmap.data[i * 4 + 1] = color.Green;
                this.Bitmap.data[i * 4 + 2] = color.Blue;
                this.Bitmap.data[i * 4 + 3] = color.Alpha;
            }

            this.OffsetX = positionX;
            this.OffsetY = positionY;
        }

    }

    class Vertex {
        X: number;
        Y: number;
        Z: number;

        constructor(X: number, Y: number, Z: number) {
            this.X = X;
            this.Y = Y;
            this.Z = Z;
        }
    }

    enum PrimitiveFlagEnum {
        TwoSided = 0,
        ZBias = 1
    }

    class Primitive {
        Type: number;
        Flag: PrimitiveFlagEnum;
        FrontCulling: number;
        BackCulling: number;
        Materials: Int8Array;
        Vertices: Vertex[];

        constructor(Type: number, Flag: PrimitiveFlagEnum, FrontCulling: number, BackCulling: number, Materials: Int8Array, numVertices: number) {
            this.Type = Type;
            this.Flag = Flag;
            this.FrontCulling = FrontCulling;
            this.BackCulling = BackCulling;
            this.Materials = Materials;
            this.Vertices = new Array<Vertex>(numVertices);
        }
    }

    class ResourceShape implements FileUtils.IUseReader {

        Primitives: Primitive[];

        public Read(Reader: FileUtils.Reader) {
            var numVertices = Reader.ReadByte();
            var numPrimitives = Reader.ReadByte();
            var numPaintJobs = Reader.ReadByte();
            var reserved = Reader.ReadByte();

            this.Primitives = new Array<Primitive>(numPrimitives);

            var vertices: Vertex[] = new Array<Vertex>(numVertices);
            for (var i: number = 0; i < numVertices; i++) {
                vertices[i] = new Vertex(Reader.ReadByte(), Reader.ReadByte(), Reader.ReadByte());
            }
            var frontCullings: number[] = Reader.ReadIntArray(numPrimitives, 2);
            var backCullings: number[] = Reader.ReadIntArray(numPrimitives, 2);

            for (var i: number = 0; i < numPrimitives; i++) {
                var type: number = Reader.ReadByte();
                var indicesCount = type == 11 ? 2 : type == 12 ? 6 : type;
                var flag: PrimitiveFlagEnum = Reader.ReadByte();
                var materials: Int8Array = Reader.ReadArray(numPaintJobs);
                var indices: Int8Array = Reader.ReadArray(indicesCount);

                var primitive: Primitive = new Primitive(type, flag, frontCullings[i], backCullings[i], materials, indicesCount);
                for (var j: number = 0; j < numVertices; j++) {
                    primitive.Vertices[j] = vertices[indices[j]];
                }
            }
        }
    }
}