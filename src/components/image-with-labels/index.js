import React, { Component } from 'react';
import Utils2D from '../../_2Dlibrary/Utils2D';
import _ from 'lodash';

const LEFT_BUTTON = 0;
const RIGHT_BUTTON = 1;

const GREEN = 'rgba(0,255,0,0.2)';
const BLACK = '#000000';
const YELLOW = 'rgba(255,255,0,0.35)';
const RED = 'rgb(255,0,0)';

const TEMP_CIRCLE_STYLE = {
  fillColor: GREEN,
  strokeColor: BLACK,
  lineWidth: 1,
};

const TMP_CIRCLE_RADIUS = 3;
const AREA_THRESHOLD = 50;
const POLYGON_TYPE = 'POLYGON';
const ELLIPSE_TYPE = 'ELLIPSE';

const DEFAULT_LABEL_TEXT = 'write something ...';
const TEMPORARY_LABEL_TEXT = 'temporary label';
const TEMPORARY_LABEL_REF = 'temporaryLabelRef';

const REG_STRING_HEIGHT = 26;

const DELETE_ICON_WIDTH = 12;
const DELETE_ICON_HEIGHT = 12;

export default class ImageWithLabels extends Component {

  static get defaultProps() {
    return {
      maxWidth: 500,
      maxHeight: 400,
      minWidth: 300,
      minHeight: 300,
      maxResolutionX: 600,
      maxResolutionY: 800,
      labelsChangedCallback: (labels) => console.log(labels),
      gotFocusCallback: () => console.log('gotFocusCallback()'),
      lostFocusCallback: () => console.log('lostFocusCallback()'),
      hideLabels: false,
      mode: 'EDITION',
      circleRadius: 4,
    };
  }

  constructor(props) {
    super(props);

    this.mystate = {
      // variables for rendering
      renderingTimerRunning: false,
      canvasMouseCoords: null,
      backgroundImg: null,
      canvasAux: document.createElement('canvas'),
      labelSet: new Set(),
      // variables for dragging existing labels
      draggingExistingLabel: false,
      draggedLabel: null,
      // variables for adding new polygonal regions
      tmpPoints: [],
      draggingFirstTempPoint: false,
      draggingNextTempPoint: false,
      temporaryLabel: null,
      draggingTempLabel: false,
      // variables for dragging regions
      draggingRegion: false,
      draggedRegion: null,
      // other variables
      labelId: 0,
      regionId: 0,
      selectedLabel: null,
      selectedLabelTextDirty: false,
      selectedLabelPositionDirty: false,
      regionWithSelectedString: null,
      componentFocused: false,
    };

    this.renderForAWhile = this.renderForAWhile.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.loadImage = this.loadImage.bind(this);
    this.loadRemoteImage = this.loadRemoteImage.bind(this);
    this.loadLocalImage = this.loadLocalImage.bind(this);
    this.selectLabel = this.selectLabel.bind(this);
    this.unselectSelectedLabel = this.unselectSelectedLabel.bind(this);
    this.refreshLabelPosition = this.refreshLabelPosition.bind(this);
    this.removeLabel = this.removeLabel.bind(this);
    this.removeAllLabels = this.removeAllLabels.bind(this);
    this.getNextRegionString = this.getNextRegionString.bind(this);
    this.getRegionStringPosition = this.getRegionStringPosition.bind(this);
    this.intersectRegionStrings = this.intersectRegionStrings.bind(this);
    this.updateSelectedString = this.updateSelectedString.bind(this);
    this.checkStringIntersection = this.checkStringIntersection.bind(this);
    this.refreshDeleteRegionBtnPosition = this.refreshDeleteRegionBtnPosition.bind(this);
    this.refreshAllDeleteRegionBtns = this.refreshAllDeleteRegionBtns.bind(this);
    this.intersectRegionDeleteBtns = this.intersectRegionDeleteBtns.bind(this);

    // set event handlers according to mode
    if (this.props.mode === 'EDITION') {
      this.onMouseDown = this.onMouseDown_EditMode.bind(this);
      this.onMouseMove = this.onMouseMove_EditMode.bind(this);
      this.onMouseUp = this.onMouseUp_EditMode.bind(this);
    }
    // general case event handlers
    this.onMouseDownGeneral = this.onMouseDownGeneral.bind(this);

    // check if an image was provided
    const source = this.props.source;
    if (source) {
      if (source.file) {
        this.loadLocalImage(source.file);
      } else if (source.url) {
        this.loadRemoteImage(source.url);
      }
    }
  }

  componentDidMount() {
    // add event listeners
    window.addEventListener('mousedown', this.onMouseDownGeneral);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
  }

  componentWillReceiveProps(nextProps) {
    /* check if a new source was provided */
    const newSource = nextProps.source;
    if (nextProps.source && !_.isEqual(this.props.source, newSource)) {
      if (newSource.file) {
        this.loadLocalImage(newSource.file);
      } else if (newSource.url) {
        this.loadRemoteImage(newSource.url);
      }
    }
    /* check if a new circle radius was provided */
    if (nextProps.circleRadius && nextProps.circleRadius !== this.props.circleRadius) {
      // update radius of all ellipses
      const canvas = this.refs.labelCanvas;
      for (const label of this.mystate.labelSet) {
        for (const reg of label.regions) {
          if (reg.type === ELLIPSE_TYPE) {
            reg.rx = nextProps.circleRadius / canvas.width;
            reg.ry = nextProps.circleRadius / canvas.height;
          }
        }
      }
      this.renderForAWhile();
    }
  }

  componentWillUnmount() {
    // remove event listeners
    window.removeEventListener('mousedown', this.onMouseDownGeneral);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  onMouseDownGeneral(e) {
    const cwpr = this.refs.canvasWrapper;
    const { x, y } = Utils2D.getElementMouseCoords(cwpr, e);
    // click inside img
    const inside = (x >= 0 && x <= cwpr.offsetWidth && y >= 0 && y <= cwpr.offsetHeight);
    if (inside && !this.mystate.componentFocused) {
      this.mystate.componentFocused = true;
      this.props.gotFocusCallback();
    } else if (!inside && this.mystate.componentFocused) {
      this.mystate.componentFocused = false;
      this.props.lostFocusCallback();
    }
  }

  /** handle mouse down event */
  onMouseDown_EditMode(event) {
    const canvas = this.refs.labelCanvas;
    const canvCoords = Utils2D.getElementMouseCoords(canvas, event);
    const mouseCanvasX = canvCoords.x;
    const mouseCanvasY = canvCoords.y;

    /** left button click */
    if (event.button === LEFT_BUTTON) {
      /** if left click within canvas */
      if (Utils2D.coordsInRectangle(mouseCanvasX, mouseCanvasY,
        0, 0, canvas.width, canvas.height)) {
        const nccoords = Utils2D.getClippedAndNormalizedCoords(canvCoords, canvas);

         /** Case 1) dragging a temporary label */
         // label is either dropped as a new one or merged into another one
        if (this.mystate.draggingTempLabel) {
          const tmpLabel = this.mystate.temporaryLabel;
          const label = this.getIntersectedLabel(mouseCanvasX, mouseCanvasY);
          // end dragging
          this.mystate.draggingTempLabel = false;
          this.mystate.temporaryLabel = null;
          /** case 1.1) intersection with label */
          if (label) {
            label.regions.add(tmpLabel.region); // add region into existing label
            this.forceUpdate(() => this.selectLabel(label)); // select label
          /** case 1.2) no intersection with other labels */
          } else {
            // create a brand new label
            const regions = new Set();
            regions.add(tmpLabel.region);
            const newLabel = {
              x: tmpLabel.x,
              y: tmpLabel.y,
              regions,
              text: DEFAULT_LABEL_TEXT,
              id: this.mystate.labelId++ };
            this.mystate.labelSet.add(newLabel); // add label to set
            // select the new label
            this.selectLabel(newLabel, true);
          }
          // notify parent of changes in labels
          if (this.props.labelsChangedCallback) {
            this.props.labelsChangedCallback(this.exportLabelsToJSON());
          }

        /** case 2) dragging a temporary point */
        } else if (this.mystate.draggingNextTempPoint) {
          // check intersection against dropped points
          let intersected = false;
          const tmpPts = this.mystate.tmpPoints;
          for (let i = 0; i < tmpPts.length - 1; ++i) {
            const p = tmpPts[i];
            if (Utils2D.circlesIntersect(p.x * canvas.width, p.y * canvas.height,
              TMP_CIRCLE_RADIUS, nccoords.x * canvas.width, nccoords.y * canvas.height,
              TMP_CIRCLE_RADIUS)) {
              /** case 2.1) previous point intersected */
              const points = tmpPts.slice(i, -1);
              // get convex hull
              const convexPts = Utils2D.getConvexHull(points);
              // get its area
              const area = Utils2D.getAreaOfPolygon(convexPts) * canvas.width * canvas.height;
              // get its centroid
              const centroid = Utils2D.getCentroidOfPolygon(convexPts);

              let newRegion;
              /** if area above threshold, we create the polygon */
              if (area > AREA_THRESHOLD) {
                const innerPoint = Utils2D.getPointWithinComplexPolygon(points, centroid.x, centroid.y);
                newRegion = {
                  type: POLYGON_TYPE,
                  points,
                  x: innerPoint.x,
                  y: innerPoint.y,
                  id: this.mystate.regionId++,
                };
              /** otherwise, it's too small so we create an ellipse instead */
              } else {
                const { x, y } = centroid || nccoords;
                newRegion = {
                  type: ELLIPSE_TYPE, x, y,
                  rx: this.props.circleRadius / canvas.width,
                  ry: this.props.circleRadius / canvas.height,
                  id: this.mystate.regionId++,
                };
              }
              /** define region's string */
              newRegion.string = this.getNextRegionString();
              newRegion.stringPosition = this.getRegionStringPosition(newRegion);

              /** create temporary label */
              this.mystate.temporaryLabel = {
                text: TEMPORARY_LABEL_TEXT,
                x: nccoords.x,
                y: nccoords.y,
                region: newRegion,
              };

              /**  stop dragging temporary points */
              tmpPts.length = 0; // clear array
              this.mystate.draggingNextTempPoint = false;

              // re-render
              this.forceUpdate(() => {
                // start dragging temp label
                this.mystate.draggingTempLabel = true;
                // place temp label in its initial position
                const tmpLabelDiv = this.refs[TEMPORARY_LABEL_REF];
                tmpLabelDiv.style.left = `${nccoords.x * canvas.width - tmpLabelDiv.offsetWidth * 0.5}px`;
                tmpLabelDiv.style.top = `${nccoords.y * canvas.height - tmpLabelDiv.offsetHeight * 0.5}px`;
              });

              // end loop
              intersected = true;
              break;
            }
          }
          /** case 2.2) no intersection -> add a new point */
          if (!intersected) {
            this.mystate.tmpPoints.push({ x: nccoords.x, y: nccoords.y, id: this.mystate.tmpPoints.length });
          }

        /** case 3) Nothing being dragged */
        } else {
          let stringClicked = false;
          /** a little Hack to simulate GOTO in javascript */
          let hack = 0;
          while (hack++ < 1) {
            /** case 3.1) check if click on label  (text input) */
            const label = this.getIntersectedLabel(mouseCanvasX, mouseCanvasY);
            if (label) {
              /** intersection with label's text input detected */
              this.mystate.draggingExistingLabel = true; // start dragging the label
              this.mystate.draggedLabel = label;
              this.selectLabel(label); // label gets selected
              break; // pseudo GOTO
            }

            /** case 3.2) check if click on region's delete button */
            ans = this.intersectRegionDeleteBtns(mouseCanvasX, mouseCanvasY);
            if (ans) {
              ans.label.regions.delete(ans.region);
              if (ans.label.regions.size === 0) {
                this.mystate.labelSet.delete(ans.label);
                if (ans.label === this.mystate.selectedLabel) {
                  this.mystate.selectedLabel = null;
                }
              }
              this.renderForAWhile(0);
              this.forceUpdate();
              break;
            }

            /** case 3.3) check if click on a region's string */
            let ans = this.intersectRegionStrings(mouseCanvasX, mouseCanvasY);
            if (ans) {
              this.mystate.regionWithSelectedString = ans.region;
              this.selectLabel(ans.label);
              const input = this.refs.hiddenInput;
              input.value = ans.region.string;
              setTimeout(() => input.focus(), 0);
              stringClicked = true;
              break;
            }

            /** case 3.4) check if click on region */
            ans = this.getIntersectedRegionAndLabel(nccoords.x, nccoords.y);
            if (ans) {
              // reveal the label again if it was minimized
              if (ans.label.minimized) {
                ans.label.minimized = false;
                this.renderForAWhile(0);
                this.forceUpdate(() => this.refreshLabelPosition(ans.label));
              }
              // select the label
              this.selectLabel(ans.label);
              // start dragging the region
              this.mystate.draggingRegion = true;
              this.mystate.draggedRegion = ans.region;
              this.mystate.regionLastPos = { x: nccoords.x, y: nccoords.y };
              if (ans.region.type === POLYGON_TYPE) {
                const bb = Utils2D.getBoundingBox(ans.region.points);
                this.mystate.regionBBox = {
                  minX: bb.minX - ans.region.x,
                  minY: bb.minY - ans.region.y,
                  maxX: bb.maxX - ans.region.x,
                  maxY: bb.maxY - ans.region.y,
                };
              }
              break; // pseudo GOTO
            }

            /** case 3.5)  DEFAULT: click on canvas */
            // we drop the first 2 points of the temporary polygon
            this.mystate.tmpPoints.push({ x: nccoords.x, y: nccoords.y, id: this.mystate.tmpPoints.length });
            this.mystate.tmpPoints.push({ x: nccoords.x, y: nccoords.y, id: this.mystate.tmpPoints.length });
            // start dragging the last point
            this.mystate.draggingFirstTempPoint = true;
            break; // pseudo GOTO
          }

          if (this.mystate.regionWithSelectedString && !stringClicked) {
            this.mystate.regionWithSelectedString = null;
          }
        }

        // refresh scene
        this.renderForAWhile(0);
      } else {
        if (this.mystate.regionWithSelectedString) {
          this.mystate.regionWithSelectedString = null;
          this.renderForAWhile(0);
        }
      }
    }
  }

  intersectRegionStrings(mouseCanvasX, mouseCanvasY) {
    if (this.mystate.labelSet.size > 0) {
      const canvas = this.refs.labelCanvas;
      const ctx = canvas.getContext('2d');
      for (const label of this.mystate.labelSet) {
        for (const reg of label.regions) {
          const w = ctx.measureText(reg.string).width;
          const pos = reg.stringPosition;
          if (Utils2D.coordsInRectangle(mouseCanvasX, mouseCanvasY,
            pos.x * canvas.width, pos.y * canvas.height, w, REG_STRING_HEIGHT)) {
            return { region: reg, label };
          }
        }
      }
    }
    return null;
  }

  intersectRegionDeleteBtns(mouseCanvasX, mouseCanvasY) {
    const label = this.mystate.selectedLabel;
    if (label) {
      const canvas = this.refs.labelCanvas;
      for (const reg of label.regions) {
        const pos = reg.deleteIconPosition;
        if (Utils2D.coordsInEllipse(mouseCanvasX, mouseCanvasY,
          pos.x * canvas.width, pos.y * canvas.height, DELETE_ICON_WIDTH * 0.5, DELETE_ICON_HEIGHT * 0.5)) {
          return { region: reg, label };
        }
      }
    }
    return null;
  }

  getRegionStringPosition(region) {
    const canvas = this.refs.labelCanvas;
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
    const canvas = this.refs.labelCanvas;
    const ctx = canvas.getContext('2d');
    for (const label of this.mystate.labelSet) {
      for (const reg of label.regions) {
        if (reg === region) continue;
        const width = ctx.measureText(reg.string).width;
        const pos = reg.stringPosition;
        if (Utils2D.rectanglesIntersect(x, y, w, h,
        pos.x * canvas.width, pos.y * canvas.height,
        width, REG_STRING_HEIGHT)) return true;
      }
    }
    return false;
  }

  getNextRegionString() {
    const auxset = new Set();
    for (const label of this.mystate.labelSet) {
      for (const reg of label.regions) {
        if (reg.string.length < 5 && /^\d+$/.test(reg.string)) {
          auxset.add(parseInt(reg.string, 10));
        }
      }
    }
    let n = 1;
    while (auxset.has(n)) n++;
    return n.toString();
  }

  onMouseMove_EditMode(e) {
    // get mouse coordinates relative to canvas
    const canvas = this.refs.labelCanvas;
    const mcoords = Utils2D.getElementMouseCoords(canvas, e);
    this.mystate.canvasMouseCoords = mcoords; // save into mystate

    if (this.mystate.draggingFirstTempPoint || this.mystate.draggingNextTempPoint) {
      // clip and normalize coords
      const ncmcoords = Utils2D.getClippedAndNormalizedCoords(mcoords, canvas);
      // update last point
      const tmpPoints = this.mystate.tmpPoints;
      const lastPoint = tmpPoints[tmpPoints.length - 1];
      lastPoint.x = ncmcoords.x;
      lastPoint.y = ncmcoords.y;
      // refresh scene
      this.renderForAWhile();
    } else if (this.mystate.draggingTempLabel) {
      // update label position
      const ncmcoords = Utils2D.getClippedAndNormalizedCoords(mcoords, canvas);
      const cmcoords = Utils2D.getClippedCoords(mcoords, canvas);
      const tmpLabel = this.mystate.temporaryLabel;
      tmpLabel.x = ncmcoords.x;
      tmpLabel.y = ncmcoords.y;
      const tmpLabelDiv = this.refs[TEMPORARY_LABEL_REF];
      tmpLabelDiv.style.left = `${cmcoords.x - tmpLabelDiv.offsetWidth * 0.5}px`;
      tmpLabelDiv.style.top = `${cmcoords.y - tmpLabelDiv.offsetHeight * 0.5}px`;
      // refresh scene
      this.renderForAWhile();
    } else if (this.mystate.draggingExistingLabel) {
      // update label position
      const ncmcoords = Utils2D.getClippedAndNormalizedCoords(mcoords, canvas);
      const label = this.mystate.draggedLabel;
      label.x = ncmcoords.x;
      label.y = ncmcoords.y;
      this.refreshLabelPosition(label);
      // refresh scene
      this.renderForAWhile();
      // remember label position is dirty
      this.mystate.selectedLabelPositionDirty = true;
    } else if (this.mystate.draggingRegion) {
      const ncmcoords = Utils2D.getClippedAndNormalizedCoords(mcoords, canvas);
      const reg = this.mystate.draggedRegion;
      const lp = this.mystate.regionLastPos;
      let dx = ncmcoords.x - lp.x;
      let dy = ncmcoords.y - lp.y;
      if (reg.type === POLYGON_TYPE) { // Polygon
        const bb = this.mystate.regionBBox;
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
      this.refreshDeleteRegionBtnPosition(reg);
      this.renderForAWhile();
      this.mystate.regionLastPos = ncmcoords;
    }
  }

  onMouseUp_EditMode(e) {
    if (this.mystate.draggingExistingLabel) {
      this.mystate.draggingExistingLabel = false;
      this.mystate.draggedLabel = null;
      // notify parent of changes in labels (if label's position has changed)
      if (this.mystate.selectedLabelPositionDirty) {
        if (this.props.labelsChangedCallback) {
          this.props.labelsChangedCallback(this.exportLabelsToJSON());
        }
        this.mystate.selectedLabelPositionDirty = false;
      }
    } else if (this.mystate.draggingFirstTempPoint) {
      // get mouse coordinates relative to canvas
      const canvas = this.refs.labelCanvas;
      const mcoords = Utils2D.getElementMouseCoords(canvas, e);
      const ncmcoords = Utils2D.getClippedAndNormalizedCoords(mcoords, canvas);
      // check intersection against dropped points
      const p = this.mystate.tmpPoints[0];
      if (Utils2D.circlesIntersect(p.x * canvas.width, p.y * canvas.height,
        TMP_CIRCLE_RADIUS, ncmcoords.x * canvas.width, ncmcoords.y * canvas.height,
        TMP_CIRCLE_RADIUS)) {
        const { x, y } = ncmcoords;
        const newRegion = {
          type: ELLIPSE_TYPE, x, y,
          rx: this.props.circleRadius / canvas.width,
          ry: this.props.circleRadius / canvas.height,
          id: this.mystate.regionId++,
        };
        /** define region's string */
        newRegion.string = this.getNextRegionString();
        newRegion.stringPosition = this.getRegionStringPosition(newRegion);

        /**  stop dragging first temporary point */
        this.mystate.tmpPoints.length = 0; // clear array
        this.mystate.draggingFirstTempPoint = false;

        /** create temporary label */
        this.mystate.temporaryLabel = {
          text: TEMPORARY_LABEL_TEXT,
          x: ncmcoords.x,
          y: ncmcoords.y,
          region: newRegion,
        };

        // re-render
        this.forceUpdate(() => {
          // start dragging temp label
          this.mystate.draggingTempLabel = true;
          // place temp label in its initial position
          const tmpLabelDiv = this.refs[TEMPORARY_LABEL_REF];
          tmpLabelDiv.style.left = `${ncmcoords.x * canvas.width - tmpLabelDiv.offsetWidth * 0.5}px`;
          tmpLabelDiv.style.top = `${ncmcoords.y * canvas.height - tmpLabelDiv.offsetHeight * 0.5}px`;
        });

      /** no intersection -> add a new point */
      } else {
        this.mystate.tmpPoints.push({ x: ncmcoords.x, y: ncmcoords.y, id: this.mystate.tmpPoints.length });
        /**  stop dragging first temporary point but start dragging next ones */
        this.mystate.draggingFirstTempPoint = false;
        this.mystate.draggingNextTempPoint = true;
      }
      this.renderForAWhile();
    } else if (this.mystate.draggingRegion) {
      this.mystate.draggingRegion = false;
      this.mystate.draggedRegion = null;
    }
  }

  /**
   * synchronize the label and its matching div's positions making sure
   * that the child div does not overflow the canvas
   */
  refreshLabelPosition(label) {
    const labelDiv = this.refs[getLabelRef(label.id)];
    const canvas = this.refs.labelCanvas;
    const w = labelDiv.offsetWidth;
    const h = labelDiv.offsetHeight;
    // left
    let left = label.x * canvas.width - w * 0.5;
    if (left <= 0) left = 1;
    else if (left + w >= canvas.width) left = canvas.width - w - 1;
    labelDiv.style.left = `${left}px`;
    // top
    let top = label.y * canvas.height - h * 0.5;
    if (top <= 0) top = 1;
    else if (top + h >= canvas.height) top = canvas.height - h - 1;
    labelDiv.style.top = `${top}px`;
    // reset label's coords
    label.x = (left + 0.5 * w) / canvas.width;
    label.y = (top + 0.5 * h) / canvas.height;
  }

  /**
   * get region and its label that intersect the point (x,y)
   * which must be in normalized coordinates
   */
  getIntersectedRegionAndLabel(x, y) {
    for (const label of this.mystate.labelSet) {
      for (const reg of label.regions) {
        if (reg.type === POLYGON_TYPE ?
            (Utils2D.isPointInPolygonBoundingBox(x, y, reg.points) &&
            Utils2D.isPointInPolygon(x, y, reg.points))
           : Utils2D.coordsInEllipse(x, y, reg.x, reg.y, reg.rx, reg.ry)) {
          return { region: reg, label };
        }
      }
    }
    return null;
  }

  /**
   * get label intersected by point (x,y)  which must be in canvas coordinates
   * (relative to canvas)
   */
  getIntersectedLabel(x, y) {
    for (const label of this.mystate.labelSet) {
      if (label.minimized) continue;
      if (Utils2D.coordsInElement(x, y, this.refs[getLabelRef(label.id)])) {
        return label;
      }
    }
    return null;
  }

  /** unselect the current selected label */
  unselectSelectedLabel() {
    const label = this.mystate.selectedLabel;
    if (label) {
      document.getElementById(getLabelFocusId(label.id)).blur();
      this.mystate.selectedLabel = null;
      this.renderForAWhile(0);
      this.forceUpdate();
      // if text has changed, notify the parent of changes
      if (this.mystate.selectedLabelTextDirty) {
        if (this.props.labelsChangedCallback) {
          this.props.labelsChangedCallback(this.exportLabelsToJSON());
        }
        this.mystate.selectedLabelTextDirty = false;
      }
    }
  }

  /** select a label, and unselect the previous one */
  selectLabel(label, selectText) {
    if (label === this.mystate.selectLabel) return;
    label.minimized = false;
    this.unselectSelectedLabel();
    this.mystate.selectedLabel = label;
    this.refreshAllDeleteRegionBtns();
    this.renderForAWhile();
    this.forceUpdate(() => {
      this.refreshLabelPosition(label);
      setTimeout(() => {
        const elem = document.getElementById(getLabelFocusId(label.id));
        elem.focus();
        if (selectText) {
          if (typeof elem.select === 'function') elem.select();
          else if (typeof elem.setSelectionRange === 'function') {
            elem.setSelectionRange(0, elem.value.length);
          }
        }
      }, 0);
    });
  }

  removeLabel(label) {
    if (label === this.mystate.selectedLabel) {
      this.mystate.selectedLabel = null;
    }
    this.mystate.labelSet.delete(label);
    this.renderForAWhile(0);
    this.forceUpdate();
    // notify parent of changes in labels
    if (this.props.labelsChangedCallback) {
      this.props.labelsChangedCallback(this.exportLabelsToJSON());
    }
  }

  exportLabelsToJSON() {
    const labelJSONArray = [];
    for (const label of this.mystate.labelSet) {
      const regions = [];
      for (const reg of label.regions) {
        if (reg.type === POLYGON_TYPE) {
          regions.push({ type: POLYGON_TYPE, points: reg.points, cx: reg.x, cy: reg.y });
        } else {
          regions.push({ type: ELLIPSE_TYPE, x: reg.x, y: reg.y, rx: reg.rx, ry: reg.ry });
        }
      }
      labelJSONArray.push({ regions, x: label.x, y: label.y, text: label.text });
    }
    return labelJSONArray;
  }

  /** load image from local file */
  loadLocalImage(file) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      this.loadImage(img);
      URL.revokeObjectURL(url);
      this.renderForAWhile(0);
    };
    img.src = url;
  }

  /** load image from a remote url */
  loadRemoteImage(url) {
    const img = new Image();
    img.onload = () => {
      this.loadImage(img);
      this.renderForAWhile(0);
    };
    img.src = url;
  }

  /** load an image into an auxiliar canvas for rendering performance */
  loadImage(img) {
    // determine scale ratio
    let ratio = 1;
    if (img.width > this.props.maxWidth) {
      ratio = this.props.maxWidth / img.width;
    }
    if (img.height > this.props.maxHeight) {
      ratio = Math.min(this.props.maxWidth / img.width, ratio);
    }
    // resize canvas and canvasAux
    const canvasAux = this.mystate.canvasAux;
    const lblcanvas = this.refs.labelCanvas;
    const imgcanvas = this.refs.imgCanvas;
    const cw = this.refs.canvasWrapper;
    const w = Math.max(img.width * ratio, this.props.minWidth);
    const h = Math.max(img.height * ratio, this.props.minHeight);
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
    // set as background image
    this.mystate.backgroundImg = img;
    // clear all previous labels
    this.removeAllLabels();
  }

  removeAllLabels() {
    this.mystate.labelSet.clear();
    this.mystate.selectedLabel = false;
    this.mystate.temporaryLabel = null;
    this.mystate.draggingTempLabel = false;
    this.mystate.draggingFirstTempPoint = false;
    this.mystate.draggingNextTempPoint = false;
    this.mystate.draggingExistingLabel = false;
    this.mystate.draggingRegion = false;
    this.mystate.draggedRegion = null;
    this.renderForAWhile();
    this.forceUpdate();
    // notify parent of changes in labels
    if (this.props.labelsChangedCallback) {
      this.props.labelsChangedCallback(this.exportLabelsToJSON());
    }
  }

  drawRegion(ctx, reg, cvwidth, cvheight) {
    if (reg.type === POLYGON_TYPE) {
      Utils2D.drawPolygon(ctx, reg.points, cvwidth, cvheight);
    } else { // ELLIPSE_TYPE
      Utils2D.drawEllipse(ctx, reg.x * cvwidth, reg.y * cvheight,
        reg.rx * cvwidth, reg.ry * cvheight);
    }
  }

  /** render the scene onto the canvas */
  renderScene() {
    if (this.mystate.renderingTimerRunning) {
      requestAnimationFrame(this.renderScene);
      // -------------
      const canvas = this.refs.labelCanvas;
      const cvwidth = canvas.width;
      const cvheight = canvas.height;
      const ctx = canvas.getContext('2d');

      /** 1) clear label canvas */
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /** 2) draw regions */
      // normal regions
      ctx.fillStyle = GREEN;
      ctx.strokeStyle = BLACK;
      ctx.lineWidth = 1.2;
      for (const label of this.mystate.labelSet) {
        if (label === this.mystate.selectedLabel) continue;
        for (const reg of label.regions) {
          this.drawRegion(ctx, reg, cvwidth, cvheight);
        }
      }
      // temporary label's region
      if (this.mystate.draggingTempLabel) {
        this.drawRegion(ctx, this.mystate.temporaryLabel.region, cvwidth, cvheight);
      }
      // selected label's regions
      if (this.mystate.selectedLabel) {
        ctx.fillStyle = YELLOW;
        ctx.strokeStyle = RED;
        for (const reg of this.mystate.selectedLabel.regions) {
          this.drawRegion(ctx, reg, cvwidth, cvheight);
        }
      }

      /** 3) draw lines */
      // normal lines
      ctx.strokeStyle = BLACK;
      for (const label of this.mystate.labelSet) {
        if (label === this.mystate.selectedLabel) continue;
        if (label.minimized) continue;
        for (const reg of label.regions) {
          Utils2D.drawLine(ctx, reg.x * cvwidth, reg.y * cvheight,
            label.x * cvwidth, label.y * cvheight);
        }
      }
      // temporary label's line
      if (this.mystate.draggingTempLabel) {
        const label = this.mystate.temporaryLabel;
        const reg = label.region;
        Utils2D.drawLine(ctx, reg.x * cvwidth, reg.y * cvheight,
          label.x * cvwidth, label.y * cvheight);
      }
      // selected label's lines
      if (this.mystate.selectedLabel) {
        ctx.strokeStyle = RED;
        const label = this.mystate.selectedLabel;
        for (const reg of label.regions) {
          Utils2D.drawLine(ctx, reg.x * cvwidth, reg.y * cvheight,
            label.x * cvwidth, label.y * cvheight);
        }
      }

      /** 4) draw temporary points (polygon), if any */
      if (this.mystate.draggingFirstTempPoint || this.mystate.draggingNextTempPoint) {
        ctx.fillStyle = GREEN;
        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 2;
        // draw temporary lines between points
        const tmpPts = this.mystate.tmpPoints;
        for (let i = 1; i < tmpPts.length; ++i) {
          Utils2D.drawLine(ctx,
            tmpPts[i - 1].x * cvwidth, tmpPts[i - 1].y * cvheight,
            tmpPts[i].x * cvwidth, tmpPts[i].y * cvheight);
        }
        // draw temporary points
        for (let i = 0; i < tmpPts.length; ++i) {
          Utils2D.drawCircle(ctx, tmpPts[i].x * cvwidth, tmpPts[i].y * cvheight,
            TMP_CIRCLE_RADIUS, TEMP_CIRCLE_STYLE);
        }
      }

      /** 5) draw region's strings */
      if (this.mystate.labelSet.size > 0) {
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.lineWidth = 1.5;
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.strokeStyle = 'rgb(0,0,0)';
        ctx.font = `${REG_STRING_HEIGHT}px sans-serif`;
        for (const label of this.mystate.labelSet) {
          for (const reg of label.regions) {
            const pos = reg.stringPosition;
            if (reg === this.mystate.regionWithSelectedString) {
              ctx.fillStyle = 'rgb(255,255,0)';
              ctx.fillText(reg.string, pos.x * canvas.width, pos.y * canvas.height);
              ctx.strokeText(reg.string, pos.x * canvas.width, pos.y * canvas.height);
              ctx.fillStyle = 'rgb(255,255,255)';
              continue;
            } else if (label === this.mystate.selectedLabel) {
              ctx.fillStyle = 'rgb(255,165,0)';
              ctx.fillText(reg.string, pos.x * canvas.width, pos.y * canvas.height);
              ctx.strokeText(reg.string, pos.x * canvas.width, pos.y * canvas.height);
              ctx.fillStyle = 'rgb(255,255,255)';
              continue;
            }
            ctx.fillText(reg.string, pos.x * canvas.width, pos.y * canvas.height);
            ctx.strokeText(reg.string, pos.x * canvas.width, pos.y * canvas.height);
          }
        }
      }

      /* 6) Draw delete icons */
      if (this.mystate.selectedLabel) {
        // debugger
        for (const reg of this.mystate.selectedLabel.regions) {
          const pos = reg.deleteIconPosition;
          Utils2D.drawDeleteIcon(ctx, pos.x * canvas.width, pos.y * canvas.height,
            DELETE_ICON_WIDTH, DELETE_ICON_HEIGHT);
        }
      }
    }
  }

  /** render the scene just for a while */
  renderForAWhile(milliseconds = 200) {
    if (this.renderingTimerRunning) return; // already running? ignore
    this.mystate.renderingTimerRunning = true;
    this.renderScene();
    setTimeout(() => {
      this.mystate.renderingTimerRunning = false;
    }, milliseconds);
  }

  getOnTextChangeCallback(label) {
    return (text) => {
      console.log("label ",label.id," onTextChanged()");
      label.text = text;
    };
  }

  getOnKeyDownCallback(label) {
    return (e) => {
      if (e.keyCode === 13) this.unselectSelectedLabel();
    };
  }

  getOnCloseCallback(label) {
    return () => {
      console.log("label ",label.id," onClose()");
      this.removeLabel(label);
    };
  }

  getOnMinimizeCallback(label) {
    return () => {
      console.log("label ",label.id," onMinimize()");
      if (label === this.mystate.selectedLabel) {
        this.unselectSelectedLabel();
      }
      label.minimized = true;
      this.renderForAWhile();
      this.forceUpdate();
    };
  }

  updateSelectedString() {
    const reg = this.mystate.regionWithSelectedString;
    if (reg) {
      const val = this.refs.hiddenInput.value;
      reg.string = val;
      if (!reg.string) {
        reg.string = this.getNextRegionString();
        this.refs.hiddenInput.value = reg.string;
      }
      reg.stringPosition = this.getRegionStringPosition(reg);
      this.renderForAWhile();
    }
  }

  refreshAllDeleteRegionBtns() {
    // debugger
    const label = this.mystate.selectedLabel;
    if (label) {
      for (const reg of label.regions) this.refreshDeleteRegionBtnPosition(reg);
    }
  }

  refreshDeleteRegionBtnPosition(reg) {
    const canvas = this.refs.labelCanvas;
    const rx = DELETE_ICON_WIDTH * 0.5;
    const ry = DELETE_ICON_HEIGHT * 0.5;
    // try different directions
    const d = 8;
    const xys = [
      reg.x * canvas.width + d, reg.y * canvas.height - d, // top right
      reg.x * canvas.width,     reg.y * canvas.height - d, // top
      reg.x * canvas.width + d, reg.y * canvas.height, // right
      reg.x * canvas.width,     reg.y * canvas.height - d, // bottom
      reg.x * canvas.width - d, reg.y * canvas.height, // left
      reg.x * canvas.width - d, reg.y * canvas.height + d, // bottom left
      reg.x * canvas.width + d, reg.y * canvas.height + d, // bottom right
    ];
    for (let i = 0; i < xys.length; i += 2) {
      const x = xys[i];
      const y = xys[i + 1];
      if (x >= rx && x + rx <= canvas.width && y >= ry && y + ry <= canvas.height) {
        reg.deleteIconPosition = { x:  x / canvas.width, y: y / canvas.height };
        return;
      }
    }
    // default
    reg.deleteIconPosition = { x: reg.x , y: reg.y };
  }

  /** React's render function */
  render() {
    console.log('====> render()');
    let dynamicElements = [];
    switch (this.props.mode) {
      case 'EDITION': {
        // temporary label
        if (this.mystate.temporaryLabel) {
          dynamicElements.push(this.props.renderLabel({
            label: this.mystate.temporaryLabel,
            ref: TEMPORARY_LABEL_REF,
            key: TEMPORARY_LABEL_REF,
            style: { position: 'absolute', opacity: 0.5 },
            isReadOnly: true,
          }));
        }
        // existing labels
        for (const label of this.mystate.labelSet) {
          if (label.minimized) continue; // skip if minimized
          dynamicElements.push(
            this.props.renderLabel({
              label,
              ref: getLabelRef(label.id),
              key: getLabelRef(label.id),
              focusId: getLabelFocusId(label.id),
              style: { position: 'absolute' },
              isReadOnly: false,
              onTextChanged: this.getOnTextChangeCallback(label),
              onKeyDown: this.getOnKeyDownCallback(label),
              onClose: this.getOnCloseCallback(label),
              onMinimize: this.getOnMinimizeCallback(label),
            })
          );
        }
        break;
      }
      default: {
        break;
      }
    }

    return (
      <div style={this.props.style}>
        <div ref="canvasWrapper" style={styles.canvasWrapper}>
          <canvas ref="imgCanvas" style={styles.canvas}></canvas>
          <canvas ref="labelCanvas" style={styles.canvas}></canvas>
          <input
            ref="hiddenInput" style={styles.hiddenInput}
            onChange={this.updateSelectedString}
          />
          {dynamicElements}
        </div>
      </div>
    );
  }
}

ImageWithLabels.propTypes = {
  style: React.PropTypes.object,
  source: React.PropTypes.object,
  maxWidth: React.PropTypes.number,
  maxHeight: React.PropTypes.number,
  minWidth: React.PropTypes.number,
  minHeight: React.PropTypes.number,
  maxResolutionX: React.PropTypes.number,
  maxResolutionY: React.PropTypes.number,
  labelsChangedCallback: React.PropTypes.func,
  labels: React.PropTypes.object,
  renderLabel: React.PropTypes.func.isRequired,
  hideLabels: React.PropTypes.bool,
  mode: React.PropTypes.string.isRequired,
  gotFocusCallback: React.PropTypes.func.isRequired,
  lostFocusCallback: React.PropTypes.func.isRequired,
  circleRadius: React.PropTypes.number,
};

const styles = {
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
  },
  opaqueDiv: {
    opacity: 0.5,
  },
};

function getLabelRef(id) {
  return `_label${id}`;
}

function getLabelFocusId(id) {
  return `_label${id}_focus`;
}
