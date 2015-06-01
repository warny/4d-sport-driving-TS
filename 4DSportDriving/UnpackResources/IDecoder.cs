using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FileUtils;

namespace UnpackResources
{
	public interface IDecoder
	{
		void Decode (Reader source, Writer destination);
	}
}
