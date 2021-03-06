﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mathematics.LinearAlgebra
{
	/// <summary>
	/// Point
	/// <remarks>
	/// Un point de dimension n est multipliable par une matrice d'espace normal de dimension n+1
	/// </remarks>
	/// </summary>
	public partial class Point: IEquatable<Point>
	{
		/// <summary>
		/// composantes du vecteur
		/// </summary>
		internal double[] components;

		private Point ()
		{
		}

		/// <summary>
		/// constructeur par dimensions
		/// </summary>
		/// <param name="dimensions"></param>
		public Point(int dimensions) {
			this.components = new double[dimensions + 1];
			this.components[this.components.Length - 1] = 1;
		}

		/// <summary>
		/// constructeur par valeurs
		/// </summary>
		/// <param name="components"></param>
		public Point ( params double[] components )
		{
			this.components = new double[components.Length + 1];
			Array.Copy(components, this.components,components.Length);
			this.components[this.components.Length - 1] = 1;
		}

		/// <summary>
		/// Constructeur de copie
		/// </summary>
		/// <param name="point"></param>
		public Point ( Point point )
		{
			this.components = new Double[point.components.Length];
			Array.Copy(point.components, this.components, point.components.Length); 
		}

		/// <summary>
		/// Retourne ou définie la valeur à la dimension indiquée
		/// </summary>
		/// <param name="dimension"></param>
		/// <returns></returns>
		public double this[int dimension]
		{
			get { return this.components[dimension]; }
			set
			{
				this.components[dimension] = value;
			}
		}

		/// <summary>
		/// dimension du vecteur
		/// </summary>
		public int Dimension
		{
			get { return this.components.Length - 1; }
		}

		public override bool Equals ( object obj )
		{
			if (obj is Point) {
				return Equals((Point)obj);
			} else if (obj is double[]) {
				return Equals(new Point((double)obj));
			}
			return false;
		}

		public bool Equals ( Point other )
		{
			if (Object.ReferenceEquals(this, other)) return true;
			if (!this.components.Length.Equals(other)) return false;

			for (int i = 0; i < this.components.Length; i++) {
				if (this.components[i] != other.components[i]) return false;
			}
			return true;
		}

		public override int GetHashCode ()
		{
			unchecked {
				var temp = this.components.Length.GetHashCode();
				foreach (var el in this.components) {
					temp = ((temp * 23) << 1) + el.GetHashCode();
				}
				return temp;
			}
		}

		public static double Distance ( Point point1, Point point2 )
		{
			if (point1.components.Length != point2.components.Length) {
				throw new ArgumentException("Les deux points n'ont pas la même dimension");
			}
			double temp = 0D;
			for (int i = 0; i < point1.components.Length - 1; i++ ) {
				temp += Math.Pow(point1.components[i] - point2.components[i], 2D);
			}

			return Math.Sqrt(temp);
		}

		public override string ToString ()
		{
			return string.Format("({0})", string.Join(";", this.components.Select(c => c.ToString()).ToArray(), 0, this.Dimension));
		}

	}
}
