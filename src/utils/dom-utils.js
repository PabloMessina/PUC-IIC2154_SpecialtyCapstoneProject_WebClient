const DOMUtils = {
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
