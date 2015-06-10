using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ResourceConverter
{
	class Image : Resource
	{
		public int Width { get { return Bitmap.Width; } }
		public int Height { get { return Bitmap.Height; } }
		public int Left { get; set; }
		public int Top { get; set; }
		public Bitmap Bitmap { get; set; }


		#region IResource Membres

		public override void Read ( FileUtils.Reader source, int size )
		{
			int width = source.ReadInt();
			int height = source.ReadInt();

			var unknow = source.ReadIntArray(2);

			this.Left = source.ReadInt();
			this.Top = source.ReadInt();

			this.Bitmap = new Bitmap(width, height);

			for (int x = 0; x < width; x++) {
				for (int y = 0; y < height; y++) {
					this.Bitmap.SetPixel(x, y, ResourcesUtils.Palette[source.ReadByte()]);
				}
			}
		}

		#endregion
	}
}
