const Utils2D = {
  /** returns coordinates (x,y) of mouse relative to the element */
  getElementMouseCoords: (elem, event) => {
    const bcr = elem.getBoundingClientRect();
    return {
      x: event.clientX - bcr.left,
      y: event.clientY - bcr.top,
    };
  },

  /** returns coordinates normalized according to the
  element's dimensions */
  getNormalizedCoords: (coords, elem) => ({
    x: coords.x / elem.width,
    y: coords.y / elem.height,
  }),

  /** returns coordinates clipped by the boundaries of the element */
  getClippedCoords: (coords, elem) => ({
    x: coords.x < 0 ? 0 : (coords.x > elem.width) ? elem.width : coords.x,
    y: coords.y < 0 ? 0 : (coords.y > elem.height) ? elem.height : coords.y,
  }),

  /** a combination of clipping and normalization */
  getClippedAndNormalizedCoords: (coords, elem) => ({
    x: (coords.x < 0 ? 0 :
      (coords.x > elem.width) ? elem.width : coords.x) / elem.width,
    y: (coords.y < 0 ? 0 :
      (coords.y > elem.height) ? elem.height : coords.y) / elem.height,
  }),

  /** check if (x,y) is within circle (cx,cy,r) */
  coordsInCircle: (x, y, cx, cy, r) => ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r),

  /** check if (x,y) is within rectangle */
  coordsInRectangle: (x, y, rx, ry, rw, rh) => (
    rx <= x && x <= rx + rw && ry <= y && y <= ry + rh
  ),

  /** check if (x,y) is within the element, assuming that both
  have their coordinates calculated from the same reference point */
  coordsInElement: (x, y, el) => {
    const ex = parseFloat(el.style.left);
    const ey = parseFloat(el.style.top);
    const ew = el.offsetWidth;
    const eh = el.offsetHeight;
    return Utils2D.coordsInRectangle(x, y, ex, ey, ew, eh);
  },

  /** check if point is inside a convex polygon */
  coordsInConvexPolygon: (x, y, points) => {
    let sign = null;
    let j = points.length - 1;
    for (let i = 0; i < points.length; ++i) {
      if (x === points[i].x && y === points[i].y) return true;
      const cprod = (points[j].x - x) * (points[i].y - y)
        - (points[i].x - x) * (points[j].y - y);
      if (sign) {
        if ((sign > 0 && cprod < 0) || (sign < 0 && cprod > 0)) return false;
      } else if (cprod > 0) {
        sign = 1;
      } else if (cprod < 0) {
        sign = -1;
      }
      j = i;
    }
    return true;
  },

  /** check if point is inside an ellipse */
  coordsInEllipse: (x, y, cx, cy, rx, ry) => {
    const xx = x - cx;
    const yy = y - cy;
    return (xx * xx) / (rx * rx) + (yy * yy) / (ry * ry) <= 1;
  },

  /** check if circles intersect */
  circlesIntersect: (cx1, cy1, r1, cx2, cy2, r2) => {
    const dx12 = cx1 - cx2;
    const dy12 = cy1 - cy2;
    const r12 = r1 + r2;
    return dx12 * dx12 + dy12 * dy12 <= r12 * r12;
  },

  /** check if 2 rectangles intersect */
  rectanglesIntersect: (x1, y1, w1, h1, x2, y2, w2, h2) => {
    return (x1 <= x2 + w2) && (x2 <= x1 + w1) && (y1 <= y2 + h2) && (y2 <= y1 + h1);
  },

  /** check if 2 dom elements intersect */
  domElementsIntersect: (elem1, elem2) => {
    const x1 = parseFloat(elem1.style.left);
    const y1 = parseFloat(elem1.style.top);
    const w1 = elem1.offsetWidth;
    const h1 = elem1.offsetHeight;
    const x2 = parseFloat(elem2.style.left);
    const y2 = parseFloat(elem2.style.top);
    const w2 = elem2.offsetWidth;
    const h2 = elem2.offsetHeight;
    return Utils2D.rectanglesIntersect(x1, y1, w1, h1, x2, y2, h2, w2);
  },

  /** creates a new line */
  createLine: (x1, y1, x2, y2) => ({ x1, y1, x2, y2 }),

  /** draw a line */
  drawLine: (ctx, x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  },

  /** draw a circle */
  drawCircle: (ctx, cx, cy, r, styleParams) => {
    const fillColor = styleParams.fillColor || '#00ff00';
    const strokeColor = styleParams.strokeColor || '#000000';
    const lineWidth = styleParams.lineWidth || 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
  },

  /** draw an ellipse */
  drawEllipse: (ctx, x, y, rx, ry) => {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  },

  /** draw a polygon */
  drawPolygon: (ctx, points, scaleX, scaleY) => {
    ctx.beginPath();
    ctx.moveTo(points[0].x * scaleX, points[0].y * scaleY);
    for (let i = 1; i < points.length; ++i) {
      ctx.lineTo(points[i].x * scaleX, points[i].y * scaleY);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  },

  /** get the convex hull of the given points */
  getConvexHull: (points) => {
    // sort by x and y
    points.sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
    // compute lower hull
    const lower = [];
    for (let i = 0; i < points.length; ++i) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], points[i]) <= 0) {
        lower.pop();
      }
      lower.push(points[i]);
    }
    // compute upper hull
    const upper = [];
    for (let i = points.length - 1; i >= 0; --i) {
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], points[i]) <= 0) {
        upper.pop();
      }
      upper.push(points[i]);
    }
    // join lower and upper hulls
    upper.pop();
    lower.pop();
    return lower.concat(upper);
  },

  /**
   * get the area of a polygon assuming that:
   * 1) it's a simple polygon
   * 2) the points are sorted as they appear in the polygon's perimeter
   * 	either clockwise or counterclockwise
   */
  getAreaOfPolygon: (points) => {
    let area = 0.0;
    let j = points.length - 1;
    for (let i = 0; i < points.length; ++i) {
      area += (points[j].x + points[i].x) * (points[j].y - points[i].y);
      j = i;
    }
    return Math.abs(area * 0.5);
  },

  /** get centroid of a polygon */
  getCentroidOfPolygon: (points) => {
    if (points.length === 0) {
      return null;
    } else if (points.length < 3) {
      let x = 0;
      let y = 0;
      for (let i = 0; i < points.length; ++i) {
        x += points[i].x;
        y += points[i].y;
      }
      x /= points.length;
      y /= points.length;
      return { x, y };
    } else {
      let area = 0.0;
      let x = 0.0;
      let y = 0.0;
      let j = points.length - 1;
      for (let i = 0; i < points.length; ++i) {
        const delta = points[j].x * points[i].y - points[i].x * points[j].y;
        x += (points[j].x + points[i].x) * delta;
        y += (points[j].y + points[i].y) * delta;
        area += delta;
        j = i;
      }
      area *= 3;
      x /= area;
      y /= area;
      return { x, y };
    }
  },
};

export default Utils2D;

/** get the value of the 3rd component of the cross product between
  the vectors (o -> a) and (o -> b) */
function cross(o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}