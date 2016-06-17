/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */

/**
 * Shared class for Web and mobile
 */

export default class Coordinates {

  constructor(rowMarginBottom) {
    this._rowMarginBottom = rowMarginBottom;
  }

  onAllHeights(heightCols) {
    this._heightCols = heightCols;
    const extraRowSpace = [0, 0];

    this._heightCols[0].total = this._totalHeight(this._heightCols[0]);
    this._heightCols[1].total = this._totalHeight(this._heightCols[1]);

    const { indexSmall, indexLarge } = this._getIndexes('total');
    const remainingSpace = this._heightCols[indexLarge].total - this._heightCols[indexSmall].total;
    extraRowSpace[indexSmall] = remainingSpace / ((this._heightCols[indexSmall].others.length + 2) - 1);

    const elementCenters = this._calculateElementCenters(extraRowSpace);
    const height =
      Math.max(this._heightCols[0].total, this._heightCols[1].total) +
      this._rowMarginBottom;

    return { extraRowSpace, elementCenters, height };
  }

  /**
   * Gets { indexSmall, indexLarge } according to which heightCols."property" is larger
   */
  _getIndexes(property) {
    if (this._heightCols[0][property] > this._heightCols[1][property]) {
      return {
        indexSmall: 1,
        indexLarge: 0,
      };
    } else {
      return {
        indexSmall: 0,
        indexLarge: 1,
      };
    }
  }

  _totalHeight(heightCol) {
    return heightCol.first +
      heightCol.others.reduce((a, b) => a + b, 0) +
      this._rowMarginBottom * ((heightCol.others.length - 1) + 2) +
      heightCol.last;
  }

  _calculateElementCenters(extraRowSpace) {
    const elementCenters = [];
    for (let i = 0; i < 2; i++) {
      const centers = [];
      const { first, others, last } = this._heightCols[i];
      const row = extraRowSpace[i];

      centers.push(first / 2);
      let offset = first + this._rowMarginBottom + row;

      const remaining = [...others, last];
      remaining.forEach(h => {
        centers.push(offset + h / 2);
        offset += h + this._rowMarginBottom + row;
      });

      elementCenters.push(centers);
    }
    return elementCenters;
  }
}
