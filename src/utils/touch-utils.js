const TouchUtils = {
  /* get the client coordinates of the center of the touches */
  touchesClientCenter: (touches) => {
    let x = 0;
    let y = 0;
    for (let i = 0; i < touches.length; ++i) {
      const touch = touches[i];
      x += touch.clientX;
      y += touch.clientY;
    }
    x /= touches.length;
    y /= touches.length;
    return { x, y };
  },
  /* get the average square distance of the touches to their center */
  touchesAvgSquareDistanceToCenter: (touches) => {
    /* --- compute the center --- */
    const coef = 1 / touches.length;
    let cx = 0;
    let cy = 0;
    for (let i = 0; i < touches.length; ++i) {
      const touch = touches[i];
      cx += touch.clientX;
      cy += touch.clientY;
    }
    cx *= coef;
    cy *= coef;
    /* --- compute the average square distance --- */
    let d = 0;
    let aux;
    for (let i = 0; i < touches.length; ++i) {
      const touch = touches[i];
      aux = (touch.clientX - cx);
      d += aux * aux;
      aux = (touch.clientY - cy);
      d += aux * aux;
    }
    return d * coef;
  },
};
export default TouchUtils;
