using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mathematics.LinearAlgebra;

namespace ResourceConverter
{
	class Program
	{
		static void Main ( string[] args )
		{
			var shapes = ReadResources.ReadGameShapes(new System.IO.DirectoryInfo(@"H:\projets\perso\4DSportDriving\resources"));
			StringBuilder content = new StringBuilder();
			using (var function = new StringWriter(content, System.Globalization.CultureInfo.InvariantCulture)) {
				function.WriteLine("var shapesBuilders = [];");
				foreach (var shape in shapes) {
					function.WriteLine("shapesBuilders.{0} = function() {{", shape.Name);
					function.WriteLine("");
					function.WriteLine("    var shapes = new BABYLON.Mesh(\"{0}\", scene);", shape.Name);

					int primitiveIndex = 0;
					foreach (var primitive in shape.Primitives) {
						switch (primitive.Type) {
							case PrimitiveTypeEnum.Particule:
								break;
							case PrimitiveTypeEnum.Line:
								{
									var p1 = shape.Vertices[primitive.Indices[0]];
									var p2 = shape.Vertices[primitive.Indices[1]];
								function.WriteLine("	shape = BABYLON.Mesh.CreateLines(\"{0}-{1:00}\",[");
								function.WriteLine("		 new BABYLON.Vector3({0}, {1}, {2}),", p1.X, p1.Y, p1.Z);
								function.WriteLine("		 new BABYLON.Vector3({0}, {1}, {2})", p2.X, p2.Y, p2.Z);
								function.WriteLine("	], scene);");
								}
								break;						  
							case PrimitiveTypeEnum.Polygone3:
							case PrimitiveTypeEnum.Polygone4:
							case PrimitiveTypeEnum.Polygone5:
							case PrimitiveTypeEnum.Polygone6:
							case PrimitiveTypeEnum.Polygone7:
							case PrimitiveTypeEnum.Polygone8:
							case PrimitiveTypeEnum.Polygone9:
							case PrimitiveTypeEnum.Polygone10: {
								function.WriteLine("    shape = new BABYLON.Mesh(\"{0}-{1:00}\", scene);", shape.Name, primitiveIndex);
									function.WriteLine("    ");
									function.WriteLine("    var indices = [];");
									function.WriteLine("    var positions = [];");
									function.WriteLine("    var normals = [];");
									function.WriteLine("    var uvs = [];");

									var p1 = shape.Vertices[primitive.Indices[0]];
									Point point1 = new Point(p1.X, p1.Y, p1.Z);

									var p2 = shape.Vertices[primitive.Indices[1]];
									Point point2 = new Point(p2.X, p2.Y, p2.Z);

									Vector v2 = point2 - point1;

									var p3 = shape.Vertices[primitive.Indices[2]];
									Point point3 = new Point(p3.X, p3.Y, p3.Z);
									Vector v3 = point3 - point1;

									Vector normal = Vector.Product(v3, v2).Normalize();

									function.WriteLine("    positions.push({0:0.00}, {1:0.00}, {2:0.00});", point1[0], point1[1], point1[2]);
									function.WriteLine("    normals.push({0:0.00}, {1:0.00}, {2:0.00});", normal[0], normal[1], normal[2]);
									//function.WriteLine("     uvs.push({0:0.00}, {1:0.00})", x, y);
									function.WriteLine("    positions.push({0:0.00}, {1:0.00}, {2:0.00});", point2[0], point2[1], point2[2]);
									function.WriteLine("    normals.push({0:0.00}, {1:0.00}, {2:0.00});", normal[0], normal[1], normal[2]);
									//function.WriteLine("     uvs.push({0:0.00}, {1:0.00})", x, y);

									for (int i = 2; i < primitive.Indices.Length; i++) {
										p3 = shape.Vertices[primitive.Indices[i]];
										point3 = new Point(p3.X, p3.Y, p3.Z);

										function.WriteLine("    positions.push({0:0.00}, {1:0.00}, {2:0.00});", point3[0], point3[1], point3[2]);
										function.WriteLine("    normals.push({0:0.00}, {1:0.00}, {2:0.00});", normal[0], normal[1], normal[2]);

										function.WriteLine("    indices.push({0})", 0);
										function.WriteLine("    indices.push({0})", i - 1);
										function.WriteLine("    indices.push({0})", i);
									}
									function.WriteLine("    shape.setVerticesData(positions, BABYLON.VertexBuffer.PositionKind);");
									function.WriteLine("    shape.setVerticesData(normals, BABYLON.VertexBuffer.NormalKind);");
									//function.WriteLine("    shape.setVerticesData(uvs, BABYLON.VertexBuffer.UVKind);");
									function.WriteLine("    shape.setIndices(indices);");

								}
								break;
							case PrimitiveTypeEnum.Sphere: {
									var p1 = shape.Vertices[primitive.Indices[0]];
									var p2 = shape.Vertices[primitive.Indices[2]];
									Point P1 = new Point(p1.X, p1.Y, p1.Z);
									Point P2 = new Point(p1.X, p1.Y, p1.Z);
									double radius = Point.Distance(P1, P2);

									function.WriteLine("    shape = new BABYLON.Mesh.CreateSphere(\"{0}-{1:00}\", 10.0, {2:00}, scene);", shape.Name, primitiveIndex, radius);
								}
								break;
							case PrimitiveTypeEnum.Wheel:
								break;
							default:
								break;
						}
						function.WriteLine("	shape.material = materials[{0}];", primitive.Materials[0]);
						function.WriteLine("	shape.parent = shapes;");
					}

					function.WriteLine("    return shapes;");
					function.WriteLine("}");
				}
			}
			using (var output = new StreamWriter("objects.js", false)) {
				output.WriteLine(content.ToString());
				output.Flush();
			}
		}
	}
}
