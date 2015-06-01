using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ResourceConverter
{
	class Text : IResource 
	{
		String Value { get; set; }

		#region IResource Membres

		public void Read ( FileUtils.Reader source, int size )
		{
			var reader = source.GetTextReader(Encoding.ASCII);
			char[] text = new char[size];
			reader.ReadBlock(text, 0, size);
			Value = new string(text);
		}

		#endregion
	}
}
