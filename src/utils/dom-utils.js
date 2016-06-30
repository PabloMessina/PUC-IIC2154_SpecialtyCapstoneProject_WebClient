const DOMUtils = {
  /** returns coordinates (x,y) of mouse relative to the element */
  getElementMouseCoords: (elem, event) => {
    const bcr = elem.getBoundingClientRect();
    return {
      x: event.clientX - bcr.left,
      y: event.clientY - bcr.top,
    };
  },
  /* check if elem1 is ancestor of elem2 */
  isAncestorOf(elem1, elem2) {
    let el = elem2;
    while (el) {
      if (elem1 === el) return true;
      el = el.parentElement;
    }
    return false;
  },
};

export default DOMUtils;
