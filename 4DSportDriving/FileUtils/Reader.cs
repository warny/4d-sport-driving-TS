using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace FileUtils
{
	public class Reader
	{
		private Stream stream;

		public Reader ( Stream stream )
		{
			this.stream = stream;
		}

		public Reader ( byte[] buffer )
		{
			this.stream = new MemoryStream(buffer);
		}

		public long Position
		{
			get { return this.stream.Position; }
			set { this.stream.Seek(value, SeekOrigin.Begin); }
		}

		public long Length
		{
			get { return this.stream.Length; }
		}

		public bool AtEndOfStream
		{
			get
			{
				return this.stream.Position == this.stream.Length;
			}
		}

		public TextReader GetTextReader (Encoding encoding = null)
		{
			encoding = encoding ?? Encoding.Default;
			return new StreamReader(this.stream, encoding);
		}

		public void Seek ( long offset, SeekOrigin origin = SeekOrigin.Current )
		{
			this.stream.Seek(offset, origin);
		}

		public byte ReadByte() {
			var value = this.stream.ReadByte();
			if (value == -1) throw new EndOfStreamException();

			return (byte)(value & 0xFF);
		}

		public ushort ReadUShort (bool littleIndian = true) 
		{
			var bytes = ReadByteArray(2);
			if (BitConverter.IsLittleEndian ^ littleIndian) {
				bytes = bytes.Reverse().ToArray();
			}
			return BitConverter.ToUInt16(bytes, 0);
		}

		public short ReadShort ( bool littleIndian = true )
		{
			var bytes = ReadByteArray(2);
			if (BitConverter.IsLittleEndian ^ littleIndian) {
				bytes = bytes.Reverse().ToArray();
			}
			return BitConverter.ToInt16(bytes, 0);
		}

		public uint ReadUInt ( bool littleIndian = true )
		{
			var bytes = ReadByteArray(4);
			if (BitConverter.IsLittleEndian ^ littleIndian) {
				bytes = bytes.Reverse().ToArray();
			}
			return BitConverter.ToUInt32(bytes, 0);
		}

		public int ReadInt ( bool littleIndian = true )
		{
			var bytes = ReadByteArray(4);
			if (BitConverter.IsLittleEndian ^ littleIndian) {
				bytes = bytes.Reverse().ToArray();
			}
			return BitConverter.ToInt32(bytes, 0);
		}

		public ulong ReadULong ( bool littleIndian = true )
		{
			var bytes = ReadByteArray(8);
			if (BitConverter.IsLittleEndian ^ littleIndian) {
				bytes = bytes.Reverse().ToArray();
			}
			return BitConverter.ToUInt64(bytes, 0);
		}

		public long ReadLong ( bool littleIndian = true )
		{
			var bytes = ReadByteArray(8);
			if (BitConverter.IsLittleEndian ^ littleIndian) {
				bytes = bytes.Reverse().ToArray();
			}
			return BitConverter.ToInt64(bytes, 0);
		}

		public byte[] ReadByteArray (int length)
		{
			byte[] array = new byte[length];
			if (this.stream.Read(array, 0, length) != length) {
				throw new EndOfStreamException();
			}
			return array;
		}

		public ushort[] ReadUShortArray ( int length, bool littleIndian = true  )
		{
			ushort[] array = new ushort[length];
			for (int i = 0; i < length; i++) {
				array[i] = ReadUShort(littleIndian);
			}
			return array;
		}

		public short[] ReadShortArray ( int length, bool littleIndian = true )
		{
			short[] array = new short[length];
			for (int i = 0; i < length; i++) {
				array[i] = ReadShort(littleIndian);
			}
			return array;
		}

		public uint[] ReadUIntArray ( int length, bool littleIndian = true )
		{
			uint[] array = new uint[length];
			for (int i = 0; i < length; i++) {
				array[i] = ReadUInt(littleIndian);
			}
			return array;
		}

		public int[] ReadIntArray ( int length, bool littleIndian = true )
		{
			int[] array = new int[length];
			for (int i = 0; i < length; i++) {
				array[i] = ReadInt(littleIndian);
			}
			return array;
		}

		public ulong[] ReadULongArray ( int length, bool littleIndian = true )
		{
			ulong[] array = new ulong[length];
			for (int i = 0; i < length; i++) {
				array[i] = ReadULong(littleIndian);
			}
			return array;
		}

		public long[] ReadLongArray ( int length, bool littleIndian = true )
		{
			long[] array = new long[length];
			for (int i = 0; i < length; i++) {
				array[i] = ReadLong(littleIndian);
			}
			return array;
		}

	}
}
