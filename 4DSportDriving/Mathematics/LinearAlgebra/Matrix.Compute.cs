﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mathematics.LinearAlgebra
{
	public partial class Matrix
	{
		private static void LinearTransformation ( IEnumerable<Matrix> matrices, int row1, double[] transformations )
		{
			if (transformations[row1] == 0) {
				throw new ArgumentOutOfRangeException(string.Format("La transformation de la ligne {0} ne peut pas annuler sa valeur", row1, transformations));
			}
			foreach (Matrix matrix in matrices) {
				int dimensionX = matrix.Rows;
				int dimensionY = matrix.Rows;
				for (int col = 0; col < dimensionX; col++) {
					double temp = 0;
					for (int row = 0; row < dimensionY; row++) {
						temp += matrix[row, col] * transformations[row];
					}
					matrix[row1, col] = temp;
				}
			}
		}

		private static void PermuteTransformation ( IEnumerable<Matrix> matrices, int row1, int row2 )
		{
			if (row1 == row2) return;
			foreach (Matrix matrix in matrices) {
				int dimensionX = matrix.Rows;
				int dimensionY = matrix.Rows;
				for (int col = 0; col < dimensionX; col++) {
					double temp = matrix[row1, col];
					matrix[row1, col] = matrix[row2, col];
					matrix[row2, col] = temp;
				}
			}
		}

		/// <summary>
		/// Calcule le déterminant partiel de la matrice
		/// </summary>
		/// <param name="recurence"></param>
		/// <param name="columns"></param>
		/// <returns></returns>
		private double ComputeDeterminant ( int recurence, IEnumerable<int> columns )
		{
			double sign = 1;
			double result = 0;
			foreach (int column in columns) {
				double temp = sign * this.components[recurence, column];
				var nextColumns = columns.Where(c => c != column);
				if (temp != 0 && nextColumns.Any()) {
					temp *= ComputeDeterminant(recurence + 1, nextColumns);
				}
				result += temp;
				sign = -sign;
			}
			return result;
		}

		public Matrix[] Diagonalize ()
		{
			if (!this.IsSquare) {
				throw new Exception("la matrice n'est pas une matrice carrée");
			}
			if (this.IsDiagonalized) {
				return new Matrix[] { new Matrix(this), Matrix.Identity(this.Rows) };
			}

			Matrix start = new Matrix(this);
			Matrix result = Matrix.Identity(this.Rows);
			Matrix[] matrices = new Matrix[] { start, result };

			for (int column = 0; column < this.Rows; column++) {
				//vérifie qu'à la ligne correspondant à la colonne considérée, on ait une valeur non nulle, sinon, on inverse avec une ligne suivante qui soit dans ce cas
				double max = 0;
				int maxLine = 0;
				for (int j = column; j < this.Rows; j++) {
					double value = Math.Abs(this[j, column]);
					if (max < value) {
						max = value;
						maxLine = j;
					}
				}
				if (max == 0) {
					throw new Exception("La matrice n'est pas diagonalisable");
				}
				PermuteTransformation(matrices, column, maxLine);
				
				//ensuite, on essaye d'annuler les colonnes diférentes de la colonne considérée
				double[] transformations = Enumerable.Repeat(0.0, this.Rows).ToArray();
				for (int row = column + 1; row < this.Rows; row++) {
					transformations[row] = 1;
					transformations[column] = -start[row, column] / start[column, column];
					LinearTransformation(matrices, row, transformations);
					transformations[row] = 0;
				}
			}

			return matrices;
		}

		public Matrix Invert ()
		{
			if (!this.IsSquare) {
				throw new Exception("la matrice n'est pas une matrice carrée");
			}
			if (this.IsIdentity) {
				return new Matrix(this);
			}

			var matrices = this.Diagonalize();
			var start = matrices[0];
			var result = matrices[1];

			double[] transformations = Enumerable.Repeat(0.0, this.Rows).ToArray();
			for (int j = this.Rows - 1; j >= 0; j--) {
				transformations[j] = 1 / start[j , j];
				LinearTransformation(matrices, j, transformations);
				transformations[j] = 1;
				for (int i = j + 1; i < this.Rows; i++) {
					transformations[i] = -start[j, i] / start[i, i];
				}
				LinearTransformation(matrices, j, transformations);
			
			}
			return result;
		}
	}
}
