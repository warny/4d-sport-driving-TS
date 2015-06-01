using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FileUtils;

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

				Console.WriteLine("Fichier {0}", f.FullName);
				string targetFileName = f.FullName.Substring(0, f.FullName.Length - f.Extension.Length) + target;
					try {
				using (var fs = f.OpenRead())
				using (var tw = File.Open(targetFileName, FileMode.Create, FileAccess.Write)) {
					var src = new Reader(fs);
					var trg = new Writer(tw);
						unpack.Unpack(src, trg);


				}
					} catch (Exception ex) {
						Console.WriteLine(ex.Message);
						File.Delete(targetFileName);
					}

			}

		}
	}
}


