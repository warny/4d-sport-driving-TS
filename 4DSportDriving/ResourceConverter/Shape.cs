using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ResourceConverter
{
	public class Shape : IResource
	{
		#region IResource Membres
		byte numVertices { get { return (byte)Vertices.Length; } }
		byte numPrimitives { get { return (byte)Primitives.Length; } }
		byte numPaintJobs	{ get; private set; }

		Vertex[] Vertices { get; set; }
		Primitive[] Primitives { get; set; }

		public void Read ( FileUtils.Reader source, int size )
		{
			this.Vertices = new Vertex[source.ReadByte()];
			this.Primitives = new Primitive[source.ReadByte()];
			this.numPaintJobs = source.ReadByte();

			source.ReadByte();

			for (int i = 0; i < this.Vertices.Length; i++) {
				Vertices[i] = new Vertex(source.ReadByte(), source.ReadByte(), source.ReadByte());
			}

			for (int i = 0; i < this.Primitives.Length; i++) {
				var primitive = this.Primitives[i] = new Primitive();
				primitive.CullFront = source.ReadUInt();
			}

			for (int i = 0; i < this.Primitives.Length; i++) {
				var primitive = this.Primitives[i];
				primitive.CullBack = source.ReadUInt();
			}

			for (int i = 0; i < this.Primitives.Length; i++) {
				var primitive = this.Primitives[i];
				byte type = source.ReadByte();
				primitive.Type = (PrimitiveTypeEnum)type;
				primitive.Flag = (PrimitiveFlagEnum)source.ReadByte();
				primitive.Materials = source.ReadByteArray(this.numPaintJobs);

				if (type <= 10) {
					primitive.Indices = source.ReadByteArray(type);
				} else if (type == 11){
					primitive.Indices = source.ReadByteArray(2);
				} else if (type == 12) {
					primitive.Indices = source.ReadByteArray(6);
				} else {
					throw new ArgumentOutOfRangeException();
				}

			}
		}


		#endregion
	}

	public class Vertex
	{
		public int X { get; set; }
		public int Y { get; set; }
		public int Z { get; set; }

		public Vertex(int x, int y , int z) {
			this.X = x;
			this.Y = y;
			this.Z = z;
		}

		public override string ToString ()
		{
			return string.Format("(X={0}, Y={1}, Z={2})", X, Y, Z);
		}
	}

	public enum PrimitiveTypeEnum : byte
	{
		Particule = 1,
		Line = 2,
		Polygone3 = 3,
		Polygone4 = 3,
		Polygone5 = 3,
		Polygone6 = 3,
		Polygone7 = 3,
		Polygone8 = 3,
		Polygone9 = 3,
		Polygone10 = 10,
		Sphere = 11,
		Wheel = 12
	}

	public enum PrimitiveFlagEnum:byte
	{
		TwoSided = 1,
		ZBias = 2
	}

	public class Primitive
	{
		public PrimitiveTypeEnum Type { get; set; }
		public PrimitiveFlagEnum Flag { get; set; }
		public uint CullFront { get; set; }
		public uint CullBack { get; set; }
		public byte[] Materials {get;set;}
		public byte[] Indices { get; set; }
	}

}
