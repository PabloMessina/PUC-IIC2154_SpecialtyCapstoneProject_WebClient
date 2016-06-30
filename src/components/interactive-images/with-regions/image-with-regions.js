/* eslint react/sort-comp:0, no-alert:0, no-console:0, no-param-reassign:0, no-cond-assign:0 */
import React, { Component, PropTypes } from 'react';
import Utils2D from '../../../utils/utils2D';
import DOMUtils from '../../../utils/dom-utils';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';

const LEFT_BUTTON = 0;

const GREEN = 'rgba(0,255,0,0.2)';
const BLACK = 'rgb(0,0,0)';

const TEMP_CIRCLE_STYLE = {
  fillColor: GREEN,
  strokeColor: BLACK,
  lineWidth: 1,
};

const TMP_CIRCLE_RADIUS = 3;
const AREA_THRESHOLD = 50;
const POLYGON_TYPE = 'P';
const CIRCLE_TYPE = 'C';

const REG_STRING_HEIGHT = 30;

const DELETE_ICON_WIDTH = 12;
const DELETE_ICON_HEIGHT = 12;

// modes
const MODES = {
  EDITION: 'EDITION',
  MULTISELECT: 'MULTISELECT',
  READONLY: 'READONLY',
};

export default class ImageWithRegions extends Component {

  static propTypes = {
    style: PropTypes.object, // root style
    mode: PropTypes.string.isRequired,
    source: PropTypes.object.isRequired, // { file } or { url }
    regions: PropTypes.array, // json array
    selectedRegionIds: PropTypes.array, // array of ints, ex: [1, 2, 3]
    circleRadius: PropTypes.number, // float
    // dimension ranges for image's width and height
    maxWidth: PropTypes.number,
    maxHeight: PropTypes.number,
    // resolution limits for image
    maxResolutionX: PropTypes.number,
    maxResolutionY: PropTypes.number,
    // different colors used for drawing
    lineHighlightColor: PropTypes.string,
    lineNormalColor: PropTypes.string,
    regionHighlightColor: PropTypes.string,
    regionNormalColor: PropTypes.string,
    stringFocusColor: PropTypes.string,
    stringHighlightColor: PropTypes.string,
    stringNormalColor: PropTypes.string,
    // boolean props
    fillRegions: PropTypes.bool,
    showRegions: PropTypes.bool,
    disabled: PropTypes.bool,
    // callbacks
    onError: PropTypes.func.isRequired,

    /* MODE: EDITION */
    onRegionsChange: PropTypes.func,
    onRegionsAndSelectedChange: PropTypes.func,

    /* MODE: EDITION & MULTISELECT */
    onSelectedRegionsChange: PropTypes.func,
  }

  static defaultProps = {
    mode: MODES.EDITION,
    source: { url: 'http://www.humpath.com/IMG/jpg_brain_front_cut_01_10.jpg' },
    maxWidth: 500,
    maxHeight: 400,
    maxResolutionX: 600,
    maxResolutionY: 800,
    showRegions: true,
    fillRegions: true,
    disabled: false,
    circleRadius: 4,
    lineHighlightColor: 'rgb(255,0,0)',
    lineNormalColor: 'rgb(0,0,0)',
    regionHighlightColor: 'rgba(255,255,0,0.2)',
    regionNormalColor: 'rgba(0,255,0,0.2)',
    stringFocusColor: 'rgb(255,255,0)',
    stringHighlightColor: 'rgb(236,150,13)',
    stringNormalColor: 'rgb(255,255,255)',
    onError: err => { alert(err); console.error(err); },
  }

  constructor(props) {
    super(props);

    /* we use '_' instead of 'state' to keep all variables that do not require a call
    to React's render outside of 'state' */
    this._ = {
      // copy mode
      mode: props.mode,
      // variables for rendering
      renderingTimerRunning: false,
      canvasAux: document.createElement('canvas'),
      regionSet: new Set(),
      id2regionMap: {},
      // variables for adding new polygonal regions
      tmpPoints: [],
      draggingFirstTempPoint: false,
      draggingNextTempPoint: false,
      // variables for dragging regions
      draggedRegion: null,
      draggingRegion: false,
      draggedRegionPositionDirty: false,
      // other variables
      regionId: 0,
      regionWithSelectedString: null,
      componentFocused: false,
      componentUnmounted: false,
      sourceLoaded: false,
      selectedRegionStringDirty: false,
    };

    this.renderForAWhile = this.renderForAWhile.bind(this);
    this.loadImage = this.loadImage.bind(this);
    this.loadRemoteImage = this.loadRemoteImage.bind(this);
    this.loadLocalImage = this.loadLocalImage.bind(this);
    this.selectRegion = this.selectRegion.bind(this);
    this.removeRegion = this.removeRegion.bind(this);
    this.removeAllRegions = this.removeAllRegions.bind(this);
    this.getNextRegionString = this.getNextRegionString.bind(this);
    this.getRegionStringPosition = this.getRegionStringPosition.bind(this);
    this.intersectRegionStrings = this.intersectRegionStrings.bind(this);
    this.onHiddenInputTextChanged = this.onHiddenInputTextChanged.bind(this);
    this.checkStringIntersection = this.checkStringIntersection.bind(this);
    this.refreshDeleteRegionIconPosition = this.refreshDeleteRegionIconPosition.bind(this);
    this.refreshAllDeleteRegionIcons = this.refreshAllDeleteRegionIcons.bind(this);
    this.intersectRegionDeleteBtns = this.intersectRegionDeleteBtns.bind(this);
    this.onHiddenInputKeyDown = this.onHiddenInputKeyDown.bind(this);
    this.unselectSelectedRegionString = this.unselectSelectedRegionString.bind(this);
    this.selectRegionString = this.selectRegionString.bind(this);
    this.loadImageAndRegions = this.loadImageAndRegions.bind(this);
    this.loadRegions = this.loadRegions.bind(this);
    this.drawRegions = this.drawRegions.bind(this);
    this.drawRegionStrings = this.drawRegionStrings.bind(this);
    this.drawDeleteIcons = this.drawDeleteIcons.bind(this);
    this.drawTemporaryPolygon = this.drawTemporaryPolygon.bind(this);

    // specific settings for each mode
    switch (props.mode) {
      case MODES.EDITION:
        this.onMouseDownEditionMode = this.onMouseDownEditionMode.bind(this);
        this.onMouseMoveEditionMode = this.onMouseMoveEditionMode.bind(this);
        this.onMouseUpEditionMode = this.onMouseUpEditionMode.bind(this);
        this.renderScene = this.renderSceneEditionMode.bind(this);
        break;
      case MODES.MULTISELECT:
        this.onMouseDownMultiSelectMode = this.onMouseDownMultiSelectMode.bind(this);
        this.renderScene = this.renderSceneReadOnlyMode.bind(this);
        break;
      case MODES.READONLY:
        this.renderScene = this.renderSceneReadOnlyMode.bind(this);
        break;
      default:
        throw new Error(`Unexpected mode = ${props.mode}`);
    }
  }

  componentDidMount() {
    // add event listeners
    switch (this._.mode) {
      case MODES.EDITION:
        window.addEventListener('mousedown', this.onMouseDownEditionMode);
        window.addEventListener('mousemove', this.onMouseMoveEditionMode);
        window.addEventListener('mouseup', this.onMouseUpEditionMode);
        break;
      case MODES.MULTISELECT:
        window.addEventListener('mousedown', this.onMouseDownMultiSelectMode);
        break;
      default: break;
    }
    // load image and regions provided (if any)
    this.loadImageAndRegions(this.props.source, this.props.regions, this.props.selectedRegionIds);
  }

  componentWillReceiveProps(nextProps) {
    const { mode, sourceLoaded } = this._;
    if (mode === MODES.EDITION && sourceLoaded) {
      /* check if different source was provided */
      if (!isEqual(nextProps.source, this.props.source)) {
        this.loadImageAndRegions(this.props.source, this.props.regions, this.props.selectedRegionIds);
      /* check if different regions were provided */
      } else if (!isEqual(this._.regionsJSONScreenshot, nextProps.regions)) {
        this.removeAllRegions();
        this.loadRegions(nextProps.regions);
        this.setSelectedRegions(nextProps.selectedRegionIds);
      /* check if different selected region ids were provided */
      } else if (!isEqual(this._.selectedRegionIds, nextProps.selectedRegionIds)) {
        this.setSelectedRegions(nextProps.selectedRegionIds);
      }
      /* check if a new circle radius was provided */
      if (nextProps.circleRadius !== this.props.circleRadius) {
        // update radius of all ellipses
        const canvas = this.refs.regionCanvas;
        for (const reg of this._.regionSet) {
          if (reg.type === CIRCLE_TYPE) {
            reg.rx = nextProps.circleRadius / canvas.width;
            reg.ry = nextProps.circleRadius / canvas.height;
          }
        }
        this.renderForAWhile();
      }
    } else if (mode === MODES.MULTISELECT) {
      if (!isEqual(this._.selectedRegionIds, nextProps.selectedRegionIds)) {
        this.setSelectedRegions(nextProps.selectedRegionIds);
      }
    }
    // refresh scene if change in fillRegions
    if (nextProps.fillRegions !== this.props.fillRegions) this.renderForAWhile();
  }

  /* no need for updates */
  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    // remove event listeners
    switch (this._.mode) {
      case MODES.EDITION:
        window.removeEventListener('mousedown', this.onMouseDownEditionMode);
        window.removeEventListener('mousemove', this.onMouseMoveEditionMode);
        window.removeEventListener('mouseup', this.onMouseUpEditionMode);
        break;
      case MODES.MULTISELECT:
        window.removeEventListener('mousedown', this.onMouseDownMultiSelectMode);
        break;
      default: break;
    }
    // remember we have been unmounted
    this._.componentUnmounted = true;
  }

  onMouseDownEditionMode(event) {
    if (!this.props.showRegions || this.props.disabled) return;

    /* get mouse coordinates in canvas space */
    const canvas = this.refs.regionCanvas;
    const canvCoords = DOMUtils.getElementMouseCoords(canvas, event);
    const mouseCanvasX = canvCoords.x;
    const mouseCanvasY = canvCoords.y;

    /* click within canvas boundaries and within canvasWrapper's hierarchy */
    const clickInsideCanvas = Utils2D.coordsInRectangle(mouseCanvasX, mouseCanvasY,
      0, 0, canvas.width, canvas.height) && DOMUtils.isAncestorOf(this.refs.canvasWrapper, event.target);

    /** left button click */
    if (event.button === LEFT_BUTTON) {
      /** if left click within canvas boundaries and within canvasWrapper's hierarchy */
      if (clickInsideCanvas) {
        const nccoords = Utils2D.getClippedAndNormalizedCoords(canvCoords, canvas);

        /** case 1) dragging a temporary point */
        if (this._.draggingNextTempPoint) {
          // check intersection against dropped points
          let intersected = false;
          const tmpPts = this._.tmpPoints;
          if (tmpPts.length >= 2) {
            const p = tmpPts[0];
            if (Utils2D.circlesIntersect(p.x * canvas.width, p.y * canvas.height,
              TMP_CIRCLE_RADIUS, nccoords.x * canvas.width, nccoords.y * canvas.height,
              TMP_CIRCLE_RADIUS)) {
              /** case 1.1) first point intersected */
              const points = tmpPts.slice(0, -1);
              // get convex hull
              const convexPts = Utils2D.getConvexHull(points);
              // get its area
              const area = Utils2D.getAreaOfPolygon(convexPts) * canvas.width * canvas.height;
              // get its centroid
              const centroid = Utils2D.getCentroidOfPolygon(convexPts);

              let newRegion;
              // if area above threshold, we create the polygon
              if (area > AREA_THRESHOLD) {
                const innerPoint = Utils2D.getPointWithinComplexPolygon(points, centroid.x, centroid.y);
                newRegion = {
                  type: POLYGON_TYPE,
                  points,
                  x: innerPoint.x,
                  y: innerPoint.y,
                };
              // otherwise, it's too small so we create an ellipse instead
              } else {
                const { x, y } = centroid || nccoords;
                newRegion = {
                  type: CIRCLE_TYPE, x, y,
                  rx: this.props.circleRadius / canvas.width,
                  ry: this.props.circleRadius / canvas.height,
                };
              }
              // set id
              newRegion.id = this._.regionId++;
              // set string
              newRegion.string = this.getNextRegionString();
              newRegion.stringPosition = this.getRegionStringPosition(newRegion);
              // set delete btn position
              this.refreshDeleteRegionIconPosition(newRegion);
              // add to collection
              this._.regionSet.add(newRegion);
              this._.id2regionMap[newRegion.id] = newRegion;
              // stop dragging temporary points
              tmpPts.length = 0; // clear array
              this._.draggingNextTempPoint = false;
              intersected = true;
              // notify changes
              this.notifyRegionsChange();
            }
          }
          /** case 1.2) no intersection -> add a new point */
          if (!intersected) this._.tmpPoints.push({ x: nccoords.x, y: nccoords.y });

        /** case 2) Nothing being dragged */
        } else {
          let stringClicked = false;

          let reg;
          /* case 2.1) check if click on region's delete button */
          if (reg = this.intersectRegionDeleteBtns(mouseCanvasX, mouseCanvasY)) {
            this.removeRegion(reg);
          /* case 2.2) check if click on a region's string */
          } else if (reg = this.intersectRegionStrings(mouseCanvasX, mouseCanvasY)) {
            this.selectRegionString(reg); stringClicked = true;
          /* case 2.3) check if click on region */
          } else if (reg = this.intersectRegions(nccoords.x, nccoords.y)) {
            // start dragging the region
            this._.draggingRegion = true;
            this._.draggedRegion = reg;
            this._.regionLastPos = { x: nccoords.x, y: nccoords.y };
            if (reg.type === POLYGON_TYPE) {
              const bb = Utils2D.getBoundingBox(reg.points);
              this._.regionBBox = {
                minX: bb.minX - reg.x,
                minY: bb.minY - reg.y,
                maxX: bb.maxX - reg.x,
                maxY: bb.maxY - reg.y,
              };
            }
          /* case 2.4)  DEFAULT: click on canvas */
          } else {
            // we drop the first 2 points of the temporary polygon
            this._.tmpPoints.push({ x: nccoords.x, y: nccoords.y });
            this._.tmpPoints.push({ x: nccoords.x, y: nccoords.y });
            // start dragging the last point
            this._.draggingFirstTempPoint = true;
          }

          if (this._.regionWithSelectedString && !stringClicked) {
            this.unselectSelectedRegionString();
          }
        }

        // refresh scene
        this.renderForAWhile(0);
      } else {
        if (this._.regionWithSelectedString) {
          this._.regionWithSelectedString = null;
          this.renderForAWhile(0);
        }
      }
    }
  }

  onMouseMoveEditionMode(e) {
    if (!this.props.showRegions || this.props.disabled) return;

    // get mouse coordinates relative to canvas
    const canvas = this.refs.regionCanvas;
    const mcoords = DOMUtils.getElementMouseCoords(canvas, e);

    /* dragging a temporal point */
    if (this._.draggingFirstTempPoint || this._.draggingNextTempPoint) {
      // clip and normalize coords
      const ncmcoords = Utils2D.getClippedAndNormalizedCoords(mcoords, canvas);
      // update last point
      const tmpPoints = this._.tmpPoints;
      const lastPoint = tmpPoints[tmpPoints.length - 1];
      lastPoint.x = ncmcoords.x;
      lastPoint.y = ncmcoords.y;
      // refresh scene
      this.renderForAWhile();

    /* dragging a region */
    } else if (this._.draggingRegion) {
      const ncmcoords = Utils2D.getClippedAndNormalizedCoords(mcoords, canvas);
      const reg = this._.draggedRegion;
      const lp = this._.regionLastPos;
      let dx = ncmcoords.x - lp.x;
      let dy = ncmcoords.y - lp.y;
      if (reg.type === POLYGON_TYPE) { // Polygon
        const bb = this._.regionBBox;
        if (dx < 0 && dx + reg.x + bb.minX < 0) {
          dx = - (reg.x + bb.minX);
        } else if (dx > 0 && dx + reg.x + bb.maxX > 1) {
          dx = 1 - (reg.x + bb.maxX);
        }
        if (dy < 0 && dy + reg.y + bb.minY < 0) {
          dy = - (reg.y + bb.minY);
        } else if (dy > 0 && dy + reg.y + bb.maxY > 1) {
          dy = 1 - (reg.y + bb.maxY);
        }
        for (const p of reg.points) {
          p.x += dx; p.y += dy;
        }
      } else { // Ellipse
        if (dx < 0 && dx + reg.x - reg.rx < 0) {
          dx = - (reg.x - reg.rx);
        } else if (dx > 0 && dx + reg.x + reg.rx > 1) {
          dx = 1 - (reg.x + reg.rx);
        }
        if (dy < 0 && dy + reg.y - reg.ry < 0) {
          dy = - (reg.y - reg.ry);
        } else if (dy > 0 && dy + reg.y + reg.ry > 1) {
          dy = 1 - (reg.y + reg.ry);
        }
      }
      reg.x += dx;
      reg.y += dy;
      reg.stringPosition = this.getRegionStringPosition(reg);
      this.refreshDeleteRegionIconPosition(reg);
      this.renderForAWhile();
      this._.regionLastPos = ncmcoords;
      // remember region's position is dirty
      this._.draggedRegionPositionDirty = true;
    }
  }

  onMouseUpEditionMode(e) {
    if (!this.props.showRegions || this.props.disabled) return;

    if (this._.draggingFirstTempPoint) {
      // get mouse coordinates relative to canvas
      const canvas = this.refs.regionCanvas;
      const mcoords = DOMUtils.getElementMouseCoords(canvas, e);
      const ncmcoords = Utils2D.getClippedAndNormalizedCoords(mcoords, canvas);
      // check intersection against dropped points
      const p = this._.tmpPoints[0];
      if (Utils2D.circlesIntersect(p.x * canvas.width, p.y * canvas.height,
        TMP_CIRCLE_RADIUS, ncmcoords.x * canvas.width, ncmcoords.y * canvas.height,
        TMP_CIRCLE_RADIUS)) {
        const { x, y } = ncmcoords;
        const newRegion = {
          type: CIRCLE_TYPE, x, y,
          rx: this.props.circleRadius / canvas.width,
          ry: this.props.circleRadius / canvas.height,
          id: this._.regionId++,
        };
        // set string
        newRegion.string = this.getNextRegionString();
        newRegion.stringPosition = this.getRegionStringPosition(newRegion);
        // set delete btn position
        this.refreshDeleteRegionIconPosition(newRegion);
        // add to collection
        this._.regionSet.add(newRegion);
        this._.id2regionMap[newRegion.id] = newRegion;
        // stop dragging first temporary point
        this._.tmpPoints.length = 0; // clear array
        this._.draggingFirstTempPoint = false;
        // notify changes
        this.notifyRegionsChange();

      /* no intersection -> add a new point */
      } else {
        this._.tmpPoints.push({ x: ncmcoords.x, y: ncmcoords.y });
        /**  stop dragging first temporary point but start dragging next ones */
        this._.draggingFirstTempPoint = false;
        this._.draggingNextTempPoint = true;
      }
      this.renderForAWhile();
    } else if (this._.draggingRegion) {
      const reg = this._.draggedRegion;
      if (this._.draggedRegionPositionDirty) {
        this._.draggedRegionPositionDirty = false;
        this.notifyRegionsChange();
      } else {
        if (reg.selected) this.unselectRegion(reg);
        else this.selectRegion(reg);
      }
      this._.draggingRegion = false;
      this._.draggedRegion = null;
    }
  }

  onMouseDownMultiSelectMode(event) {
    if (!this.props.showRegions || this.props.disabled) return;

    /* get mouse coordinates in canvas space */
    const canvas = this.refs.regionCanvas;
    const canvCoords = DOMUtils.getElementMouseCoords(canvas, event);
    const mouseCanvasX = canvCoords.x;
    const mouseCanvasY = canvCoords.y;

    /* click within canvas boundaries and within canvasWrapper's hierarchy */
    const clickInsideCanvas = Utils2D.coordsInRectangle(mouseCanvasX, mouseCanvasY,
      0, 0, canvas.width, canvas.height) && DOMUtils.isAncestorOf(this.refs.canvasWrapper, event.target);

    /** left button click */
    if (event.button === LEFT_BUTTON) {
      /** if left click within canvas boundaries and within canvasWrapper's hierarchy */
      if (clickInsideCanvas) {
        // check intersection with string or region
        let nccoords;
        const reg =
          this.intersectRegionStrings(mouseCanvasX, mouseCanvasY) ||
          (
            nccoords = Utils2D.getClippedAndNormalizedCoords(canvCoords, canvas),
            this.intersectRegions(nccoords.x, nccoords.y)
          );
        if (reg) {
          // toggle selection
          if (reg.selected) this.unselectRegion(reg);
          else this.selectRegion(reg);
        }
        // refresh scene
        this.renderForAWhile(0);
      } else {
        if (this._.regionWithSelectedString) {
          this._.regionWithSelectedString = null;
          this.renderForAWhile(0);
        }
      }
    }
  }

  unselectSelectedRegionString() {
    const reg = this._.regionWithSelectedString;
    if (reg) {
      if (!reg.string) reg.string = this.getNextRegionString();
      this._.regionWithSelectedString = null;
      this.refs.hiddenInput.blur();
      if (this._.selectedRegionStringDirty) {
        this._.selectedRegionStringDirty = false;
        this.notifyRegionsChange();
      }
    }
  }

  selectRegionString(reg) {
    const input = this.refs.hiddenInput;
    if (reg === this._.regionWithSelectedString) {
      setTimeout(() => input.focus(), 0);
      return;
    }
    this.unselectSelectedRegionString();
    this._.regionWithSelectedString = reg;
    this.selectRegion(reg);
    input.value = reg.string;
    setTimeout(() => input.focus(), 0);
  }

  /* returns the region whose string is intersected */
  intersectRegionStrings(mouseCanvasX, mouseCanvasY) {
    const canvas = this.refs.regionCanvas;
    const ctx = canvas.getContext('2d');
    for (const reg of this._.regionSet) {
      const w = ctx.measureText(reg.string).width;
      const pos = reg.stringPosition;
      if (Utils2D.coordsInRectangle(mouseCanvasX, mouseCanvasY,
        pos.x * canvas.width, pos.y * canvas.height, w, REG_STRING_HEIGHT)) {
        return reg;
      }
    }
    return null;
  }

  /* returns the region whose delete button is intersected */
  intersectRegionDeleteBtns(mouseCanvasX, mouseCanvasY) {
    const canvas = this.refs.regionCanvas;
    for (const reg of this._.regionSet) {
      const pos = reg.deleteIconPosition;
      if (Utils2D.coordsInEllipse(mouseCanvasX, mouseCanvasY,
        pos.x * canvas.width, pos.y * canvas.height, DELETE_ICON_WIDTH * 0.5, DELETE_ICON_HEIGHT * 0.5)) {
        return reg;
      }
    }
    return null;
  }

  getRegionStringPosition(region) {
    const canvas = this.refs.regionCanvas;
    const ctx = canvas.getContext('2d');
    const swidth = Math.ceil(ctx.measureText(region.string).width);
    const rgx = region.x * canvas.width;
    const rgy = region.y * canvas.height;
    let x;
    let y;
    // top
    x = rgx - swidth * 0.5;
    y = rgy - 6 - REG_STRING_HEIGHT;
    if (x >= 0 && x + swidth <= canvas.width && y >= 0 &&
      !this.checkStringIntersection(x, y, swidth, REG_STRING_HEIGHT, region)) {
      return { x: x / canvas.width, y: y / canvas.height };
    }
    // right
    x = rgx + 6;
    y = rgy - REG_STRING_HEIGHT * 0.5;
    if (x + swidth <= canvas.width && y >= 0 && y + REG_STRING_HEIGHT <= canvas.height &&
      !this.checkStringIntersection(x, y, swidth, REG_STRING_HEIGHT, region)) {
      return { x: x / canvas.width, y: y / canvas.height };
    }
    // left
    x = rgx - 6 - swidth;
    y = rgy - REG_STRING_HEIGHT * 0.5;
    if (x >= 0 && y >= 0 && y + REG_STRING_HEIGHT <= canvas.height &&
      !this.checkStringIntersection(x, y, swidth, REG_STRING_HEIGHT, region)) {
      return { x: x / canvas.width, y: y / canvas.height };
    }
    // bottom (default)
    x = rgx - swidth * 0.5;
    y = rgy + 6;
    return { x: x / canvas.width, y: y / canvas.height };
  }

  checkStringIntersection(x, y, w, h, region) {
    const canvas = this.refs.regionCanvas;
    const ctx = canvas.getContext('2d');
    for (const reg of this._.regionSet) {
      if (reg === region) continue;
      const width = ctx.measureText(reg.string).width;
      const pos = reg.stringPosition;
      if (Utils2D.rectanglesIntersect(x, y, w, h,
      pos.x * canvas.width, pos.y * canvas.height,
      width, REG_STRING_HEIGHT)) return true;
    }
    return false;
  }

  getNextRegionString() {
    const auxset = new Set();
    for (const reg of this._.regionSet) {
      if (reg.string.length < 5 && /^\d+$/.test(reg.string)) {
        auxset.add(parseInt(reg.string, 10));
      }
    }
    let n = 1;
    while (auxset.has(n)) n++;
    return n.toString();
  }

  /* get region thet intersects the point (x,y), which must be in normalized coordinates */
  intersectRegions(x, y) {
    for (const reg of this._.regionSet) {
      if (reg.type === POLYGON_TYPE ?
          (Utils2D.isPointInPolygonBoundingBox(x, y, reg.points) &&
          Utils2D.isPointInPolygon(x, y, reg.points))
         : Utils2D.coordsInEllipse(x, y, reg.x, reg.y, reg.rx, reg.ry)) {
        return reg;
      }
    }
    return null;
  }

  selectRegion(region) {
    if (region.selected) return;
    region.selected = true;
    this.renderForAWhile(0);
    this.notifySelectedRegionsChange();
  }

  unselectRegion(region) {
    if (!region.selected) return;
    region.selected = false;
    this.renderForAWhile(0);
    this.notifySelectedRegionsChange();
  }

  removeRegion(region) {
    this._.regionSet.delete(region);
    delete this._.id2regionMap[region.id];
    this.renderForAWhile(0);
    // notify changes
    if (region.selected) this.notifyRegionsAndSelectedChange();
    else this.notifyRegionsChange();
  }

  setSelectedRegions(ids) {
    for (const reg of this._.regionSet) reg.selected = false;
    // debugger
    if (ids) {
      for (const id of ids) {
        const reg = this._.id2regionMap[id];
        if (reg) reg.selected = true;
        else console.warn('id = ', id, ' not found in id2regionMap');
      }
      this._.selectedRegionIds = ids.slice(0); // clone
    } else {
      this._.selectedRegionIds = [];
    }
    this.renderForAWhile(0);
  }

  /**
   * Load regions over the current image. It is assumed that an image has already been loaded
   * and all previous regions (if any) were removed
   */
  loadRegions(regions) {
    if (!regions) return;
    // update last JSON screenshot with new input
    const regionsClone = cloneDeep(regions);
    this._.regionsJSONScreenshot = regionsClone;

    const canvas = this.refs.regionCanvas;
    let rid = 0;
    for (const region of regionsClone) {
      const reg = cloneDeep(region);
      if (rid < reg.id) rid = reg.id;
      if (reg.type === CIRCLE_TYPE) {
        reg.rx = this.props.circleRadius / canvas.width;
        reg.ry = this.props.circleRadius / canvas.height;
      }
      reg.stringPosition = this.getRegionStringPosition(reg);
      this.refreshDeleteRegionIconPosition(reg);
      this._.regionSet.add(reg);
      this._.id2regionMap[reg.id] = reg;
    }
    this._.regionId = rid + 1;

    this.renderForAWhile(0);
  }

  /* load image from local file */
  loadLocalImage(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        this.loadImage(img);
        URL.revokeObjectURL(url);
        res();
      };
      img.onerror = err => rej(err);
      img.src = url;
    });
  }

  /* load image from a remote url */
  loadRemoteImage(url) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        this.loadImage(img);
        res();
      };
      img.onerror = err => rej(err);
      img.src = url;
    });
  }

  /* load an image into an auxiliar canvas for rendering performance */
  loadImage(img) {
    // abort operations if componente was unmounted
    if (this._.componentUnmounted) return;
    // determine scale ratio
    let ratio = 1;
    if (img.width > this.props.maxWidth) {
      ratio = this.props.maxWidth / img.width;
    }
    if (img.height > this.props.maxHeight) {
      ratio = Math.min(this.props.maxHeight / img.height, ratio);
    }
    // resize canvas and canvasAux
    const canvasAux = this._.canvasAux;
    const lblcanvas = this.refs.regionCanvas;
    const imgcanvas = this.refs.imgCanvas;
    const cw = this.refs.canvasWrapper;
    const w = img.width * ratio;
    const h = img.height * ratio;
    lblcanvas.width = w;
    lblcanvas.height = h;
    imgcanvas.width = w;
    imgcanvas.height = h;
    canvasAux.width = Math.min(this.props.maxResolutionX, img.width);
    canvasAux.height = Math.min(this.props.maxResolutionY, img.height);
    cw.style.width = `${w}px`;
    cw.style.height = `${h}px`;
    // draw image into canvasAux
    const auxctx = canvasAux.getContext('2d');
    auxctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvasAux.width, canvasAux.height);
    // draw canvasAux into imgCanvas
    const imgctx = imgcanvas.getContext('2d');
    imgctx.drawImage(canvasAux, 0, 0, canvasAux.width, canvasAux.height, 0, 0, imgcanvas.width, imgcanvas.height);
    // clear all previous regions
    this.removeAllRegions();
    // refresh GUI
    this.renderForAWhile(0);
    this.forceUpdate();
  }

  /* load image from source (file or url) and then load regions and set selected ones */
  loadImageAndRegions(source, regions, selectedRegionIds) {
    if (source) {
      let sourcePromise = null;
      if (source.file) sourcePromise = this.loadLocalImage(source.file);
      else if (source.url) sourcePromise = this.loadRemoteImage(source.url);
      if (sourcePromise) {
        sourcePromise
          .then(() => {
            this._.sourceLoaded = true;
            this.loadRegions(regions);
            this.setSelectedRegions(selectedRegionIds);
          })
          .catch(err => this.props.onError(err));
      } else this.props.onError('No file or url found in source');
    }
  }

  removeAllRegions(notify) {
    if (this._.regionSet.size === 0) return;
    // clear data structures
    this._.regionSet.clear();
    this._.id2regionMap = {};
    this._.regionsJSONScreenshot = [];
    this._.selectedRegionIds = [];
    // falsify/nullify interactivity variables
    this._.draggingFirstTempPoint = false;
    this._.draggingNextTempPoint = false;
    this._.draggingRegion = false;
    this._.draggingRegion = null;
    this._.draggedRegionPositionDirty = false;
    this._.selectedRegionStringDirty = false;
    this._.regionWithSelectedString = null;
    // notify if requested
    if (notify) this.notifyRegionsAndSelectedChange();
  }

  /** render the scene onto the canvas (EDITION MODE)*/
  renderSceneEditionMode() {
    if (!this.props.showRegions || this._.componentUnmounted ||
    !this._.renderingTimerRunning) return;

    requestAnimationFrame(this.renderScene);
    const canvas = this.refs.regionCanvas;
    const cvwidth = canvas.width;
    const cvheight = canvas.height;
    const ctx = canvas.getContext('2d');
    /* clear canvas */
    ctx.clearRect(0, 0, cvwidth, cvheight);
    /* draw regions */
    this.drawRegions(ctx, cvwidth, cvheight);
    /* draw temporary polygon, if any */
    this.drawTemporaryPolygon(ctx, cvwidth, cvheight);
    /* draw region's strings */
    this.drawRegionStrings(ctx, cvwidth, cvheight);
    /* draw delete icons */
    this.drawDeleteIcons(ctx, cvwidth, cvheight);
  }

  /** render the scene onto the canvas (READONLY MODE)*/
  renderSceneReadOnlyMode() {
    if (!this.props.showRegions || this._.componentUnmounted ||
      !this._.renderingTimerRunning) return;

    requestAnimationFrame(this.renderScene);
    const canvas = this.refs.regionCanvas;
    const cvwidth = canvas.width;
    const cvheight = canvas.height;
    const ctx = canvas.getContext('2d');
    /* clear canvas */
    ctx.clearRect(0, 0, cvwidth, cvheight);
    /* draw regions */
    this.drawRegions(ctx, cvwidth, cvheight);
    /* draw region's strings */
    this.drawRegionStrings(ctx, cvwidth, cvheight);
  }


  drawRegions(ctx, cvwidth, cvheight) {
    const nofill = !this.props.fillRegions;
    // normal regions
    ctx.fillStyle = this.props.regionNormalColor;
    ctx.strokeStyle = this.props.lineNormalColor;
    ctx.lineWidth = 1.2;
    for (const reg of this._.regionSet) if (!reg.selected) drawRegion(ctx, reg, cvwidth, cvheight, nofill);
    // selected regions
    ctx.fillStyle = this.props.regionHighlightColor;
    ctx.strokeStyle = this.props.lineHighlightColor;
    for (const reg of this._.regionSet) if (reg.selected) drawRegion(ctx, reg, cvwidth, cvheight, nofill);
  }

  drawTemporaryPolygon(ctx, cvwidth, cvheight) {
    if (this._.draggingFirstTempPoint || this._.draggingNextTempPoint) {
      ctx.fillStyle = this.props.regionNormalColor;
      ctx.strokeStyle = this.props.lineNormalColor;
      ctx.lineWidth = 2;
      // draw temporary lines between points
      const tmpPts = this._.tmpPoints;
      for (let i = 1; i < tmpPts.length; ++i) {
        Utils2D.drawLine(ctx,
          tmpPts[i - 1].x * cvwidth, tmpPts[i - 1].y * cvheight,
          tmpPts[i].x * cvwidth, tmpPts[i].y * cvheight);
      }
      // draw first point
      const p0 = tmpPts[0];
      Utils2D.drawCircle(ctx, p0.x * cvwidth, p0.y * cvheight, TMP_CIRCLE_RADIUS, TEMP_CIRCLE_STYLE);
      // draw last point
      const pN = tmpPts[tmpPts.length - 1];
      Utils2D.drawCircle(ctx, pN.x * cvwidth, pN.y * cvheight, TMP_CIRCLE_RADIUS, TEMP_CIRCLE_STYLE);
    }
  }

  drawDeleteIcons(ctx, cvwidth, cvheight) {
    for (const reg of this._.regionSet) {
      const pos = reg.deleteIconPosition;
      Utils2D.drawDeleteIcon(ctx, pos.x * cvwidth, pos.y * cvheight,
        DELETE_ICON_WIDTH, DELETE_ICON_HEIGHT);
    }
  }

  drawRegionStrings(ctx, cvwidth, cvheight) {
    const { regionSet } = this._;
    if (regionSet.size > 0) {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.lineWidth = 0.8;
      ctx.fillStyle = this.props.stringNormalColor;
      ctx.strokeStyle = this.props.lineNormalColor;
      ctx.font = `${REG_STRING_HEIGHT}px sans-serif`;
      for (const reg of regionSet) {
        const pos = reg.stringPosition;
        if (reg === this._.regionWithSelectedString) {
          ctx.fillStyle = this.props.stringFocusColor;
          ctx.fillText(reg.string, pos.x * cvwidth, pos.y * cvheight);
          ctx.strokeText(reg.string, pos.x * cvwidth, pos.y * cvheight);
          ctx.fillStyle = this.props.stringNormalColor;
        } else if (reg.selected) {
          ctx.fillStyle = this.props.stringHighlightColor;
          ctx.fillText(reg.string, pos.x * cvwidth, pos.y * cvheight);
          ctx.strokeText(reg.string, pos.x * cvwidth, pos.y * cvheight);
          ctx.fillStyle = this.props.stringNormalColor;
        } else {
          ctx.fillText(reg.string, pos.x * cvwidth, pos.y * cvheight);
          ctx.strokeText(reg.string, pos.x * cvwidth, pos.y * cvheight);
        }
      }
    }
  }

  /** render the scene just for a while */
  renderForAWhile(milliseconds = 200) {
    if (this.renderingTimerRunning) return; // already running? ignore
    this._.renderingTimerRunning = true;
    this.renderScene();
    setTimeout(() => {
      this._.renderingTimerRunning = false;
    }, milliseconds);
  }

  onHiddenInputTextChanged() {
    if (!this.props.showRegions || this.props.disabled) return;
    const reg = this._.regionWithSelectedString;
    const hiddenInput = this.refs.hiddenInput;
    if (reg) {
      const val = hiddenInput.value;
      reg.string = val;
      reg.stringPosition = this.getRegionStringPosition(reg);
      this._.selectedRegionStringDirty = true;
      this.renderForAWhile();
    }
  }

  onHiddenInputKeyDown(e) {
    if (!this.props.showRegions || this.props.disabled) return;
    if (e.keyCode === 13) {
      if (this._.selectedRegionStringDirty) {
        this._.selectedRegionStringDirty = false;
        const reg = this._.regionWithSelectedString;
        if (!reg.string) reg.string = this.getNextRegionString();
        this.notifyRegionsChange();
      }
      this._.regionWithSelectedString = null;
      e.target.blur();
      this.renderForAWhile();
    }
  }

  refreshAllDeleteRegionIcons() {
    for (const reg of this._.regionSet) this.refreshDeleteRegionIconPosition(reg);
  }

  refreshDeleteRegionIconPosition(reg) {
    const canvas = this.refs.regionCanvas;
    const rx = DELETE_ICON_WIDTH * 0.5;
    const ry = DELETE_ICON_HEIGHT * 0.5;
    // try different directions
    const d = 8;
    const xys = [
      reg.x * canvas.width + d, reg.y * canvas.height - d, // top right
      reg.x * canvas.width, reg.y * canvas.height - d, // top
      reg.x * canvas.width + d, reg.y * canvas.height, // right
      reg.x * canvas.width, reg.y * canvas.height - d, // bottom
      reg.x * canvas.width - d, reg.y * canvas.height, // left
      reg.x * canvas.width - d, reg.y * canvas.height + d, // bottom left
      reg.x * canvas.width + d, reg.y * canvas.height + d, // bottom right
    ];
    for (let i = 0; i < xys.length; i += 2) {
      const x = xys[i];
      const y = xys[i + 1];
      if (x >= rx && x + rx <= canvas.width && y >= ry && y + ry <= canvas.height) {
        reg.deleteIconPosition = { x: x / canvas.width, y: y / canvas.height };
        return;
      }
    }
    // default
    reg.deleteIconPosition = { x: reg.x, y: reg.y };
  }

  exportRegionsToJSON() {
    const regionJSONArray = [];
    let region;
    for (const reg of this._.regionSet) {
      region = (reg.type === POLYGON_TYPE) ?
        { type: POLYGON_TYPE, points: reg.points, x: reg.x, y: reg.y, id: reg.id, string: reg.string } :
        { type: CIRCLE_TYPE, x: reg.x, y: reg.y, id: reg.id, string: reg.string };
      regionJSONArray.push(region);
    }
    return regionJSONArray;
  }

  getSelectedRegionIds() {
    const ids = [];
    for (const reg of this._.regionSet) if (reg.selected) ids.push(reg.id);
    return ids;
  }

  notifyRegionsChange() {
    const json = this.exportRegionsToJSON();
    this._.regionsJSONScreenshot = json;
    this.props.onRegionsChange(json);
  }

  notifySelectedRegionsChange() {
    const ids = this.getSelectedRegionIds();
    this._.selectedRegionIds = ids;
    this.props.onSelectedRegionsChange(ids);
  }

  notifyRegionsAndSelectedChange() {
    const json = this.exportRegionsToJSON();
    const ids = this.getSelectedRegionIds();
    this._.regionsJSONScreenshot = json;
    this._.selectedRegionIds = ids;
    this.props.onRegionsAndSelectedChange(json, ids);
  }

  /** React's render function */
  render() {
    return (
      <div style={{ ...styles.root, ...this.props.style }}>
        <div ref="canvasWrapper" style={styles.canvasWrapper}>
          <canvas ref="imgCanvas" style={styles.canvas}></canvas>
          <canvas ref="regionCanvas" style={styles.canvas}></canvas>
          {(this._.mode === MODES.EDITION) ?
            <input
              ref="hiddenInput" style={styles.hiddenInput}
              onChange={this.onHiddenInputTextChanged}
              onKeyDown={this.onHiddenInputKeyDown}
            /> : null}
        </div>
      </div>
    );
  }
}

const styles = {
  root: {
    display: 'inline-block',
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  canvasWrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  hiddenInput: {
    position: 'absolute',
    left: -9999,
    top: '50%',
  },
  opaqueDiv: {
    opacity: 0.5,
  },
};

function drawRegion(ctx, reg, cvwidth, cvheight, nofill) {
  if (reg.type === POLYGON_TYPE) {
    Utils2D.drawPolygon(ctx, reg.points, cvwidth, cvheight, nofill);
  } else { // CIRCLE_TYPE
    Utils2D.drawEllipse(ctx, reg.x * cvwidth, reg.y * cvheight,
      reg.rx * cvwidth, reg.ry * cvheight, nofill);
  }
}
