using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FileUtils;

namespace ResourceConverter
{
	class ReadResources	: IEnumerable<KeyValuePair<string, byte[]>>
	{
		private Dictionary<string, byte[]> ResourcesDatas;

		public ReadResources ( FileInfo fileInfo )
		{
			using (Stream s = fileInfo.OpenRead()) {
				Reader reader = new Reader(s);
				TextReader textReader = reader.GetTextReader(Encoding.Default);

				var fileLength = reader.ReadUInt();
				if (fileLength > reader.Length) {
					throw new ArgumentException("ce fichier est compressé");
				}

				var numResources = reader.ReadUShort();

				ResourcesDesriptor[] rds = new ResourcesDesriptor[numResources];
				for (int i = 0; i < numResources; i++) {
					var text = reader.ReadString(4);
					rds[i] = new ResourcesDesriptor() { Name = text };
				}
				
				for (int i = 0; i < numResources; i++) {
					var position = reader.ReadInt();
					rds[i].Position = position;
					if (i > 0) rds[i - 1].Size = (int)(position - rds[i - 1].Position);
				}
				var pos = reader.Position;
				rds[numResources - 1].Size = (int)(fileLength - rds[numResources - 1].Position) - (int)pos;

				ResourcesDatas = new Dictionary<string,byte[]>();
				for (int i = 0; i < numResources; i++) {
					reader.Position = rds[i].Position + pos;
					var datas = reader.ReadByteArray (rds[i].Size);
					this.ResourcesDatas.Add(rds[i].Name, datas);
				}				
			}
		}

		public static SortedSet<Shape> ReadGameShapes (DirectoryInfo directory) {
			SortedSet<Shape> shapes = new SortedSet<Shape>();
			foreach (var file in directory.GetFiles("GAME*.3sh")) {
				ReadResources rs = new ReadResources(file);
				foreach (var resourceDatas in rs) {
					Shape shape = new Shape();
					shape.Name = resourceDatas.Key;
					Reader reader = new Reader(resourceDatas.Value);
					shape.Read(reader, resourceDatas.Value.Length);
					shapes.Add(shape);
				}
			}
			return shapes;
		}

		private class ResourcesDesriptor
		{
			public string Name { get; set; }
			public int Position { get; set; }
			public int Size { get; set; }

			public override string ToString ()
			{
				return string.Format("Name = {0}, Position = {1}, Size = {2}", Name, Position, Size);
			}
		}

		#region IEnumerable<KeyValuePair<string,byte[]>> Membres

		public IEnumerator<KeyValuePair<string, byte[]>> GetEnumerator ()
		{
			return this.ResourcesDatas.GetEnumerator();
		}

		#endregion

		#region IEnumerable Membres

		System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator ()
		{
			return this.ResourcesDatas.GetEnumerator();
		}

		#endregion
	}
}
