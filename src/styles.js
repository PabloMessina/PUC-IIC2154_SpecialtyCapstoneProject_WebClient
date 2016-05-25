
/**
 * Usage:
 * import design, { Colors } from '../styles';
 */

export const Colors = {
  MAIN: '#16a085',
  WHITE: '#ecf0f1',
  DISABLED: '#96A5A6',
  RED: '#E24E35',
  GRAY: '#BDC3C7',
  LIGHTGRAY: '#f1f1f1',

  /**
   * Get one of this colors with an alpha value
   * @param  {[string]} color
   * @param  {[number]} alpha [(0.0 - 1.0)]
   */
  withAlpha(color, alpha) {
    const hex = this[color];
    if (!hex) {
      throw new Error(`Color ${color} does not exist`);
    }

    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },
};

const design = ({

});

export default design;
