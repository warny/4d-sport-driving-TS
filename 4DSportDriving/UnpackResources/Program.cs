using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UnpackResources
{
	class Program
	{
		static void Main ( string[] args )
		{
			DirectoryInfo dir = new DirectoryInfo(args[0]);
			StuntUnpack unpack = new StuntUnpack();

			foreach (var f in dir.EnumerateFiles()) {
				string target;
				switch (f.Extension.ToLower()) {

					case ".pre":
						target = ".res";
						break;
					case ".pvs":
						target = ".vsh";
						break;
					case ".pes":
						target = ".esh";
						break;
					case ".p3s":
						target = ".3sh";
						break;
					case ".pkm":
						target = ".kms";
						break;
					case ".pvc":
						target = ".vce";
						break;
					case ".psf":
						target = ".sfx";
						break;
					default:
						continue;
				}

				using (var fs = f.OpenRead())
				using (var tw = File.Open(f.FullName.Substring(0, f.FullName.Length - f.Extension.Length) + target, FileMode.Create, FileAccess.Write)) {
					var src = new Reader(fs);
					var trg = new Writer(tw);

					unpack.Unpack(src, trg);

				}

			}

		}
	}
}


