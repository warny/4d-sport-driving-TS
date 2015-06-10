using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ResourceConverter
{
	public interface IBabylonExportable
	{
		string ExportToBabylon ();
	}

	public static class BabylonExport
	{
		public static void ExportPrimitive (StringBuilder script, Primitive primitive, Vertex[] verticies )
		{
			switch (primitive.Type) {
				case PrimitiveTypeEnum.Particule:
					break;
				case PrimitiveTypeEnum.Line:
					break;
				case PrimitiveTypeEnum.Polygone3:
				case PrimitiveTypeEnum.Polygone4:
				case PrimitiveTypeEnum.Polygone5:
				case PrimitiveTypeEnum.Polygone6:
				case PrimitiveTypeEnum.Polygone7:
				case PrimitiveTypeEnum.Polygone8:
				case PrimitiveTypeEnum.Polygone9:
				case PrimitiveTypeEnum.Polygone10:
					byte vertices = (byte)primitive.Type;

					break;
				case PrimitiveTypeEnum.Sphere:

					break;
				case PrimitiveTypeEnum.Wheel:
					break;
				default:
					break;
			}
		}
	}
}
