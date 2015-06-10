using System;
using System.Collections.Generic;
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
			Vector vector = new Vector(1, 1);
			Vector vector1 = new Vector(1, 0, 0);
			Vector vector2 = new Vector(0, 1, 0);
			Vector vector3 = new Vector(2, 2, 0);

			Vector vector4 = new Vector(50, 12, 3);
			Vector vector5 = new Vector(82, 18, 14);

			Matrix matrix1 = new Matrix(new double[][] { new[] {1.0, 2.0}, new[] {3.0, 1.0}});

			Matrix matrix2 = new Matrix(new double[][] { new[] { 1.0, 2.0, 3.0 }, new[] { 1.0 } , new[] { 1.0, 0.0, 2.0 }});
			Matrix matrix3 = new Matrix(new double[][] { new[] { 1.0, 2.0, 3.0 }, new[] { 0.0, 1.0, 2.0 }, new[] { 0.0, 0.0, 1.0 } });
			Matrix matrix4 = new Matrix(new double[][] { new[] { 1.0, 2.0, 3.0 }, new[] { 2.0, 3.0, 1.0 }, new[] { 3.0, 1.0, 2.0 } });
			Matrix matrix5 = matrix4.Invert();

			Point point1 = new Point(10, 0, 0);
			Matrix translation = Matrix.TranslationInNormalSpace(1, 1, 1);
			Matrix rotation = Matrix.RotationInNormalSpace(0.5, 1, 1.5);
			Matrix transformation = translation * rotation;
			Point point2 = translation * point1;

			Console.WriteLine(point1);
			Console.WriteLine(point2);

			Console.WriteLine(matrix4.Determinant);
			Console.WriteLine(matrix1.ToString("S"));
			Console.WriteLine(matrix3.IsDiagonalized);
			Console.WriteLine(matrix3.IsTriangularised);
			Console.WriteLine(matrix5);
			Console.WriteLine(matrix4 * matrix5);

			Console.WriteLine(Vector.Product(vector));
			Console.WriteLine(Vector.Product(vector1, vector2));
			Console.WriteLine(Vector.Product(vector2, vector1));
			Console.WriteLine(Vector.Product(vector4, vector5));
			Console.WriteLine(vector3.Normalize());

			var shapes = ReadResources.ReadGameShapes(new System.IO.DirectoryInfo(@"H:\projets\perso\4DSportDriving\resources"));
			foreach (var shape in shapes) {
				Console.WriteLine(shape.Name);
			}
		}
	}
}
