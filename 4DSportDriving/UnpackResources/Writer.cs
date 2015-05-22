using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UnpackResources
{
	class Writer
	{
		public Stream Stream
		{
			get;
			private set;
		}

		public bool IsExtensible {
			get; 
			private set;
		}

		public Writer ()
		{
			this.Stream = new MemoryStream();
			this.IsExtensible = true;
		}

		public Writer (int capacity, bool isExtensible = false)
		{
			this.Stream = new MemoryStream((byte[])Array.CreateInstance(typeof(byte), capacity));
			this.Stream.Position = 0;
			this.IsExtensible = isExtensible;
		}

		public Writer ( Stream stream, bool isExtensible = true )
		{
			this.Stream = stream;
			this.IsExtensible = IsExtensible;
		}

		public long Position
		{
			get { return this.Stream.Position; }
			set { this.Stream.Seek(value, SeekOrigin.Begin); }
		}

		public long Length
		{
			get { return this.Stream.Length; }
		}

		public bool AtEndOfStream
		{
			get
			{
				return this.Stream.Position == this.Stream.Length;
			}
		}

		public void Seek ( long offset, SeekOrigin origin = SeekOrigin.Current )
		{
			this.Stream.Seek(offset, origin);
		}

		public void Write (byte value)
		{
			if (!IsExtensible && AtEndOfStream) {
				throw new EndOfStreamException();
			}
			this.Stream.WriteByte(value);
		}

		public void Write ( short value, bool littleIndian = true )
		{
			var bytes = BitConverter.GetBytes(value);
			if (BitConverter.IsLittleEndian ^ littleIndian) {
				bytes = bytes.Reverse().ToArray();
			}
			Write(bytes);
		}

		public void Write ( ushort value, bool littleIndian = true )
		{
			var bytes = BitConverter.GetBytes(value);
			if (BitConverter.IsLittleEndian ^ littleIndian) {
				bytes = bytes.Reverse().ToArray();
			}
			Write(bytes);
		}
		public void Write ( int value, bool littleIndian = true )
		{
			var bytes = BitConverter.GetBytes(value);
			if (BitConverter.IsLittleEndian ^ littleIndian) {
				bytes = bytes.Reverse().ToArray();
			}
			Write(bytes);
		}
		public void Write ( uint value, bool littleIndian = true )
		{
			var bytes = BitConverter.GetBytes(value);
			if (BitConverter.IsLittleEndian ^ littleIndian) {
				bytes = bytes.Reverse().ToArray();
			}
			Write(bytes);
		}
		public void Write ( long value, bool littleIndian = true )
		{
			var bytes = BitConverter.GetBytes(value);
			if (BitConverter.IsLittleEndian ^ littleIndian) {
				bytes = bytes.Reverse().ToArray();
			}
			Write(bytes);
		}
		public void Write ( ulong value, bool littleIndian = true )
		{
			var bytes = BitConverter.GetBytes(value);
			if (BitConverter.IsLittleEndian ^ littleIndian) {
				bytes = bytes.Reverse().ToArray();
			}
			Write(bytes);
		}

		public void Write ( byte[] value )
		{
			if (!this.IsExtensible && this.Stream.Position + value.LongLength > this.Stream.Length) {
				throw new EndOfStreamException();
			}
			this.Stream.Write(value, 0, value.Length);
		}

		public void Write ( short[] value, bool littleIndian = true )
		{
			if (!this.IsExtensible && this.Stream.Position + value.LongLength * 2 > this.Stream.Length) {
				throw new EndOfStreamException();
			}
			foreach (var e in value) {
				Write(e, littleIndian);
			}
		}

		public void Write ( ushort[] value, bool littleIndian = true )
		{
			if (!this.IsExtensible && this.Stream.Position + value.LongLength * 2 > this.Stream.Length) {
				throw new EndOfStreamException();
			}
			foreach (var e in value) {
				Write(e, littleIndian);
			}
		}
		public void Write ( int[] value, bool littleIndian = true )
		{
			if (!this.IsExtensible && this.Stream.Position + value.LongLength * 2 > this.Stream.Length) {
				throw new EndOfStreamException();
			}
			foreach (var e in value) {
				Write(e, littleIndian);
			}
		}
		public void Write ( uint[] value, bool littleIndian = true )
		{
			if (!this.IsExtensible && this.Stream.Position + value.LongLength * 2 > this.Stream.Length) {
				throw new EndOfStreamException();
			}
			foreach (var e in value) {
				Write(e, littleIndian);
			}
		}
		public void Write ( long[] value, bool littleIndian = true )
		{
			if (!this.IsExtensible && this.Stream.Position + value.LongLength * 2 > this.Stream.Length) {
				throw new EndOfStreamException();
			}
			foreach (var e in value) {
				Write(e, littleIndian);
			}
		}
		public void Write ( ulong[] value, bool littleIndian = true )
		{
			if (!this.IsExtensible && this.Stream.Position + value.LongLength * 2 > this.Stream.Length) {
				throw new EndOfStreamException();
			}
			foreach (var e in value) {
				Write(e, littleIndian);
			}
		}
	}
}
