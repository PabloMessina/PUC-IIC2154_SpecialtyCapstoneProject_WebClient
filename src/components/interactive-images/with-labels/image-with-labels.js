/* eslint no-param-reassign:0, react/sort-comp:0, no-cond-assign:0, no-console:0 */
import React, { Component } from 'react';
import Utils2D from '../../../utils/utils2D';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import DOMUtils from '../../../utils/dom-utils';

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

const DEFAULT_LABEL_TEXT = 'write something ...';
const TEMPORARY_LABEL_TEXT = 'temporary label';
const TEMPORARY_LABEL_REF = 'temporaryLabelRef';

const REG_STRING_HEIGHT = 30;

const DELETE_ICON_WIDTH = 12;
const DELETE_ICON_HEIGHT = 12;

// modes
const MODES = {
  EDITION: 'EDITION',
  READONLY: 'READONLY',
};

// componente id
let componentId = 0;

export default class ImageWithLabels extends Component {

  static propTypes = {
    /* ===========================*/
    /* 1) props for for ALL modes */
    /* ===========================*/

    /* --- props to read from (INPUT) ---- */
    // mode options: EDITION, READONLY
    mode: React.PropTypes.string.isRequired, // <------------ REQUIRED
    // style for root div
    style: React.PropTypes.object,
    // props to load an image with its labels
    source: React.PropTypes.object.isRequired, // { file } or { url } <-- REQUIRED
    labels: React.PropTypes.array, // json array
    circleRadius: React.PropTypes.number, // float
    // dimension ranges for image's width and height
    maxWidth: React.PropTypes.number,
    maxHeight: React.PropTypes.number,
    // resolution limits for image
    maxResolutionX: React.PropTypes.number,
    maxResolutionY: React.PropTypes.number,

    // different colors used for drawing
    lineHighlightColor: React.PropTypes.string,
    lineNormalColor: React.PropTypes.string,
    regionHighlightColor: React.PropTypes.string,
    regionNormalColor: React.PropTypes.string,
    stringFocusColor: React.PropTypes.string,
    stringHighlightColor: React.PropTypes.string,
    stringNormalColor: React.PropTypes.string,
    // should show labels or not (if false, no label is shown and
    // any interactivity with labels is frozen / disabled)
    showLabels: React.PropTypes.bool,

    /* --- callback props to notify parent about changes (OUTPUT) --- */
    errorDetectedCallback: React.PropTypes.func.isRequired, // <------- REQUIRED

    /* ===============================*/
    /* EDITION mode only */
    /* ===============================*/

    labelsChangedCallback: React.PropTypes.func,

    /* ===================================*/
    /* READONLY mode only */
    /* ===================================*/

    selectedLabelIds: React.PropTypes.array,
    fillRegions: React.PropTypes.bool,

    /* =============================================*/
    /* props for multiple modes at the same time */
    /* =============================================*/

    /* EDITION */
    renderLabel: React.PropTypes.func,

    /* ALL EXCEPT EDITION */
    showRegionStrings: React.PropTypes.bool,
  }

  static defaultProps = {
    mode: MODES.EDITION,
    source: { url: 'http://www.humpath.com/IMG/jpg_brain_front_cut_01_10.jpg' },
    circleRadius: 4,
    labels: [],
    maxWidth: 500,
    maxHeight: 400,
    maxResolutionX: 600,
    maxResolutionY: 800,
    showLabels: true,
    lineHighlightColor: 'rgb(255,0,0)',
    lineNormalColor: 'rgb(0,0,0)',
    regionHighlightColor: 'rgba(255,255,0,0.2)',
    regionNormalColor: 'rgba(0,255,0,0.2)',
    stringFocusColor: 'rgb(255,255,0)',
    stringHighlightColor: 'rgb(236,150,13)',
    stringNormalColor: 'rgb(255,255,255)',
    selectedLabelIds: [],
    errorDetectedCallback: err => console.error(err),
  }

  constructor(props) {
    super(props);

    /* we use '_' instead of 'state' to keep all variables that do not require a call
    to React's render outside of 'state' */
    this._ = {
      // define an id for this component
      componentId: componentId++,
      // copy mode
      mode: props.mode,
      // variables for rendering
      renderingTimerRunning: false,
      backgroundImg: null,
      canvasAux: document.createElement('canvas'),
      labelSet: new Set(),
      id2labelMap: {},
      // variables for dragging existing labels
      draggingExistingLabel: false,
      draggedLabel: null,
      // variables for adding new polygonal regions
      tmpPoints: [],
      draggingFirstTempPoint: false,
      draggingNextTempPoint: false,
      temporaryLabel: null,
      draggingTemporaryLabel: false,
      // variables for dragging regions
      draggedRegion: null,
      draggingRegion: false,
      draggedRegionPositionDirty: false,
      // other variables
      labelId: 0,
      regionId: 0,
      selectedLabel: null,
      selectedLabelTextDirty: false,
      selectedLabelPositionDirty: false,
      regionWithSelectedString: null,
      componentUnmounted: false,
      showLabels: props.showLabels,
      sourceLoaded: false,
    };

    this.renderForAWhile = this.renderForAWhile.bind(this);
    this.loadImage = this.loadImage.bind(this);
    this.loadRemoteImage = this.loadRemoteImage.bind(this);
    this.loadLocalImage = this.loadLocalImage.bind(this);
    this.selectLabel = this.selectLabel.bind(this);
    this.unselectSelectedLabel = this.unselectSelectedLabel.bind(this);
    this.refreshLabelPosition = this.refreshLabelPosition.bind(this);
    this.refreshAllLabelsPositions = this.refreshAllLabelsPositions.bind(this);
    this.removeLabel = this.removeLabel.bind(this);
    this.removeAllLabels = this.removeAllLabels.bind(this);
    this.getNextRegionString = this.getNextRegionString.bind(this);
    this.getRegionStringPosition = this.getRegionStringPosition.bind(this);
    this.intersectRegionStrings = this.intersectRegionStrings.bind(this);
    this.onHiddenInputTextChanged = this.onHiddenInputTextChanged.bind(this);
    this.checkStringIntersection = this.checkStringIntersection.bind(this);
    this.refreshDeleteRegionIconPosition = this.refreshDeleteRegionIconPosition.bind(this);
    this.refreshAllDeleteRegionIcons = this.refreshAllDeleteRegionIcons.bind(this);
    this.intersectRegionDeleteBtns = this.intersectRegionDeleteBtns.bind(this);
    this.onSelectedLabelTextChanged = this.onSelectedLabelTextChanged.bind(this);
    this.onSelectedLabelKeyDown = this.onSelectedLabelKeyDown.bind(this);
    this.onSelectedLabelBlur = this.onSelectedLabelBlur.bind(this);
    this.onHiddenInputKeyDown = this.onHiddenInputKeyDown.bind(this);
    this.unselectSelectedRegionString = this.unselectSelectedRegionString.bind(this);
    this.selectRegionString = this.selectRegionString.bind(this);
    this.loadImageAndLabels = this.loadImageAndLabels.bind(this);
    this.loadLabels = this.loadLabels.bind(this);
    this.drawLines = this.drawLines.bind(this);
    this.drawRegions = this.drawRegions.bind(this);
    this.drawRegionStrings = this.drawRegionStrings.bind(this);
    this.drawDeleteIcons = this.drawDeleteIcons.bind(this);
    this.drawTemporaryPolygon = this.drawTemporaryPolygon.bind(this);
    this.startRegionAnimationForLabel = this.startRegionAnimationForLabel.bind(this);
    this.refreshCanvases = this.refreshCanvases.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.refreshAllCirclesRadius = this.refreshAllCirclesRadius.bind(this);
    this.refreshAllRegionStringPositions = this.refreshAllRegionStringPositions.bind(this);

    // specific settings for each mode
    switch (props.mode) {
      case MODES.EDITION:
        this.onMouseDownEditionMode = this.onMouseDownEditionMode.bind(this);
        this.onMouseMoveEditionMode = this.onMouseMoveEditionMode.bind(this);
        this.onMouseUpEditionMode = this.onMouseUpEditionMode.bind(this);
        this.renderScene = this.renderSceneEditionMode.bind(this);
        this.notifyLabelsChanged = this.notifyLabelsChanged.bind(this);
        break;
      case MODES.READONLY:
        this.renderScene = this.renderSceneReadOnlyMode.bind(this);
        break;
      default:
        throw new Error(`Unexpected mode = ${props.mode}`);
    }
  }

  componentDidMount() {
    // mode specific settings
    switch (this._.mode) {
      case MODES.EDITION:
        window.addEventListener('mousedown', this.onMouseDownEditionMode);
        window.addEventListener('mousemove', this.onMouseMoveEditionMode);
        window.addEventListener('mouseup', this.onMouseUpEditionMode);
        break;
      default: break;
    }
    // common settings
    window.addEventListener('resize', this.onWindowResize);
    // load image and labels provided (if any)
    this.loadImageAndLabels(this.props.source, this.props.labels);
  }

  componentWillReceiveProps(nextProps) {
    const { mode } = this._;
    if (mode === MODES.EDITION && this._.sourceLoaded) {
      /* check if different labels were provided */
      if (!isEqual(this._.lastLabelsJSONScreenshot, nextProps.labels)) {
        this.removeAllLabels();
        this.loadLabels(nextProps.labels);
      }
      /* check if a new circle radius was provided */
      if (nextProps.circleRadius !== this.props.circleRadius) {
        // update radius of all ellipses
        this.refreshAllCirclesRadius(nextProps.circleRadius);
        this.renderForAWhile();
      }
    }

    /* check if showLabels has changed */
    if (mode !== MODES.READONLY && nextProps.showLabels !== this.props.showLabels) {
      if (nextProps.showLabels) {
        setTimeout(() => {
          this._.showLabels = true;
          this.renderForAWhile();
          this.forceUpdate(this.refreshAllLabelsPositions);
        }, 0);
      } else {
        this._.showLabels = false;
        const canvas = this.refs.labelCanvas;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      }
    }

    if (mode !== MODES.EDITION && nextProps.showRegionStrings !== this.props.showRegionStrings) {
      this.renderForAWhile();
    }

    if (mode === MODES.READONLY && !isEqual(nextProps.selectedLabelIds, this.props.selectedLabelIds)) {
      // determine labels that were selected and labels that were unselected
      const prevIds = this.props.selectedLabelIds;
      const currIds = nextProps.selectedLabelIds;
      const selected = currIds.filter(id => prevIds.indexOf(id) < 0);
      const unselected = prevIds.filter(id => currIds.indexOf(id) < 0);
      // for labels that got unselected, make them invisible and stop their animations (if any)
      unselected.forEach(id => {
        const label = this._.id2labelMap[id];
        if (label) {
          label.visible = false;
          if (label.animationRunning) {
            label.animationRunning = false;
            clearInterval(label.animationId);
          }
          this.renderForAWhile();
        } else console.warn('WARNING: id = ', id, ' not found in id2labelMap');
      });
      // for labels that got selected, start their animations
      selected.forEach(id => {
        const label = this._.id2labelMap[id];
        if (label) this.startRegionAnimationForLabel(label);
        else console.warn('WARNING: id = ', id, ' not found in id2labelMap');
      });
    }
  }

  /**
   * makes the label's regions switch between visible and invisible
   * a couple times before staying definitely visible
   */
  startRegionAnimationForLabel(label) {
    if (label.animationRunning) return;
    const makeVisible = () => { label.visible = true; this.renderForAWhile(); };
    const makeInvisible = () => { label.visible = false; this.renderForAWhile(); };
    label.visible = true;
    label.animationRunning = true;
    let count = 0;
    makeVisible();
    label.animationId = setInterval(() => {
      if (this._.componentUnmounted) {
        clearInterval(label.animationId);
        label.animationRunning = false;
        return;
      }
      if (count === 4 || !label.animationRunning) {
        clearInterval(label.animationId);
        label.animationRunning = false;
        makeVisible();
        return;
      }
      if (count++ % 2 === 0) makeInvisible();
      else makeVisible();
    }, 310);
  }

  componentWillUnmount() {
    // remove event listeners
    switch (this._.mode) {
      case MODES.EDITION:
        window.removeEventListener('mousedown', this.onMouseDownEditionMode);
        window.removeEventListener('mousemove', this.onMouseMoveEditionMode);
        window.removeEventListener('mouseup', this.onMouseUpEditionMode);
        break;
      default: break;
    }
    window.removeEventListener('resize', this.onWindowResize);
    // remember we have been unmounted
    this._.componentUnmounted = true;
  }

  onMouseDownEditionMode(event) {
    // don't do anything if labels are hidden
    if (!this._.showLabels) return;
    /* get mouse coordinates in canvas space */
    const canvas = this.refs.labelCanvas;
    const cwidth = canvas.offsetWidth;
    const cheight = canvas.offsetHeight;
    const canvCoords = DOMUtils.getElementMouseCoords(canvas, event);
    const mouseCanvasX = canvCoords.x;
    const mouseCanvasY = canvCoords.y;

    /* click within canvas boundaries and within canvasWrapper's hierarchy */
    const clickInsideCanvas = Utils2D.coordsInRectangle(mouseCanvasX, mouseCanvasY,
      0, 0, cwidth, cheight)
      && DOMUtils.isAncestorOf(this.refs.canvasWrapper, event.target);

    /** left button click */
    if (event.button === LEFT_BUTTON) {
      /** if left click within canvas boundaries and within canvasWrapper's hierarchy */
      if (clickInsideCanvas) {
        const nccoords = Utils2D.getClippedAndNormalizedCoords(canvCoords, canvas);

         /** Case 1) dragging a temporary label */
         // label is either dropped as a new one or merged into another one
        if (this._.draggingTemporaryLabel) {
          const tmpLabel = this._.temporaryLabel;
          const label = this.getIntersectedLabel(mouseCanvasX, mouseCanvasY);
          // end dragging
          this._.draggingTemporaryLabel = false;
          this._.temporaryLabel = null;
          /** case 1.1) intersection with label */
          if (label) {
            label.regions.add(tmpLabel.region); // add region into existing label
            this.refreshDeleteRegionIconPosition(tmpLabel.region);
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
              id: this._.labelId++ };
            this._.labelSet.add(newLabel); // add label to set
            this._.id2labelMap[newLabel.id] = newLabel;
            // select the new label
            this.selectLabel(newLabel, true);
          }
          // notify parent of changes in labels
          this.notifyLabelsChanged();

        /** case 2) dragging a temporary point */
        } else if (this._.draggingNextTempPoint) {
          // check intersection against dropped points
          let intersected = false;
          const tmpPts = this._.tmpPoints;
          if (tmpPts.length >= 2) {
            const p = tmpPts[0];
            if (Utils2D.circlesIntersect(p.x * cwidth, p.y * cheight,
              TMP_CIRCLE_RADIUS, nccoords.x * cwidth, nccoords.y * cheight,
              TMP_CIRCLE_RADIUS)) {
              /** case 2.1) previous point intersected */
              const points = tmpPts.slice(0, -1);
              // get convex hull
              const convexPts = Utils2D.getConvexHull(points);
              // get its area
              const area = Utils2D.getAreaOfPolygon(convexPts) * cwidth * cheight;
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
                  id: this._.regionId++,
                };
              /** otherwise, it's too small so we create an ellipse instead */
              } else {
                const { x, y } = centroid || nccoords;
                newRegion = {
                  type: CIRCLE_TYPE, x, y,
                  rx: this.props.circleRadius / cwidth,
                  ry: this.props.circleRadius / cheight,
                  id: this._.regionId++,
                };
              }
              /** define region's string */
              newRegion.string = this.getNextRegionString();
              newRegion.stringPosition = this.getRegionStringPosition(newRegion);

              /** create temporary label */
              this._.temporaryLabel = {
                text: TEMPORARY_LABEL_TEXT,
                x: nccoords.x,
                y: nccoords.y,
                region: newRegion,
              };

              /**  stop dragging temporary points */
              tmpPts.length = 0; // clear array
              this._.draggingNextTempPoint = false;

              // re-render
              this.forceUpdate(() => {
                // start dragging temp label
                this._.draggingTemporaryLabel = true;
                // place temp label in its initial position
                const tmpLabelDiv = this.refs[TEMPORARY_LABEL_REF];
                tmpLabelDiv.style.left = `${nccoords.x * cwidth - tmpLabelDiv.offsetWidth * 0.5}px`;
                tmpLabelDiv.style.top = `${nccoords.y * cheight - tmpLabelDiv.offsetHeight * 0.5}px`;
              });

              // end loop
              intersected = true;
            }
          }
          /** case 2.2) no intersection -> add a new point */
          if (!intersected) this._.tmpPoints.push({ x: nccoords.x, y: nccoords.y });

        /** case 3) Nothing being dragged */
        } else {
          let stringClicked = false;

          let label;
          let ans;
          /* case 3.1) check if click on label  (text input) */
          if (label = this.getIntersectedLabel(mouseCanvasX, mouseCanvasY)) {
            /** intersection with label's text input detected */
            this._.draggingExistingLabel = true; // start dragging the label
            this._.draggedLabel = label;
            this.selectLabel(label); // label gets selected
          /* case 3.2) check if click on region's delete button */
          } else if (ans = this.intersectRegionDeleteBtns(mouseCanvasX, mouseCanvasY)) {
            ans.label.regions.delete(ans.region);
            if (ans.label.regions.size === 0) this.removeLabel(ans.label);
            else {
              this.renderForAWhile();
              this.forceUpdate();
              this.notifyLabelsChanged();
            }
          /* case 3.3) check if click on a region's string */
          } else if (ans = this.intersectRegionStrings(mouseCanvasX, mouseCanvasY)) {
            this.selectRegionString(ans.region, ans.label);
            stringClicked = true;
          /* case 3.4) check if click on region */
          } else if (ans = this.intersectRegions(nccoords.x, nccoords.y)) {
            // select the label
            this.selectLabel(ans.label);
            // start dragging the region
            this._.draggingRegion = true;
            this._.draggedRegion = ans.region;
            this._.regionLastPos = { x: nccoords.x, y: nccoords.y };
            if (ans.region.type === POLYGON_TYPE) {
              const bb = Utils2D.getBoundingBox(ans.region.points);
              this._.regionBBox = {
                minX: bb.minX - ans.region.x,
                minY: bb.minY - ans.region.y,
                maxX: bb.maxX - ans.region.x,
                maxY: bb.maxY - ans.region.y,
              };
            }
          /* case 3.5)  DEFAULT: click on canvas */
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
        this.renderForAWhile();
      } else {
        if (this._.regionWithSelectedString) {
          this._.regionWithSelectedString = null;
          this.renderForAWhile();
        }
      }
    }
  }

  onMouseMoveEditionMode(e) {
    // don't do anything if labels are hidden
    if (!this._.showLabels) return;
    // get mouse coordinates relative to canvas
    const canvas = this.refs.labelCanvas;
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

    /* dragging a temporal label */
    } else if (this._.draggingTemporaryLabel) {
      // update label position
      const ncmcoords = Utils2D.getClippedAndNormalizedCoords(mcoords, canvas);
      const cmcoords = Utils2D.getClippedCoords(mcoords, canvas);
      const tmpLabel = this._.temporaryLabel;
      tmpLabel.x = ncmcoords.x;
      tmpLabel.y = ncmcoords.y;
      const tmpLabelDiv = this.refs[TEMPORARY_LABEL_REF];
      tmpLabelDiv.style.left = `${cmcoords.x - tmpLabelDiv.offsetWidth * 0.5}px`;
      tmpLabelDiv.style.top = `${cmcoords.y - tmpLabelDiv.offsetHeight * 0.5}px`;
      // refresh scene
      this.renderForAWhile();

    /* dragging an existing label */
    } else if (this._.draggingExistingLabel) {
      // update label position
      const ncmcoords = Utils2D.getClippedAndNormalizedCoords(mcoords, canvas);
      const label = this._.draggedLabel;
      label.x = ncmcoords.x;
      label.y = ncmcoords.y;
      this.refreshLabelPosition(label);
      // refresh scene
      this.renderForAWhile();
      // remember label position is dirty
      this._.selectedLabelPositionDirty = true;

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
    if (this._.draggingExistingLabel) {
      this._.draggingExistingLabel = false;
      this._.draggedLabel = null;
      // notify parent of changes in labels (if label's position has changed)
      if (this._.selectedLabelPositionDirty) {
        this.notifyLabelsChanged();
        this._.selectedLabelPositionDirty = false;
      }
    } else if (this._.draggingFirstTempPoint) {
      // get mouse coordinates relative to canvas
      const canvas = this.refs.labelCanvas;
      const cwidth = canvas.offsetWidth;
      const cheight = canvas.offsetHeight;
      const mcoords = DOMUtils.getElementMouseCoords(canvas, e);
      const ncmcoords = Utils2D.getClippedAndNormalizedCoords(mcoords, canvas);
      // check intersection against dropped points
      const p = this._.tmpPoints[0];
      if (Utils2D.circlesIntersect(p.x * cwidth, p.y * cheight,
        TMP_CIRCLE_RADIUS, ncmcoords.x * cwidth, ncmcoords.y * cheight,
        TMP_CIRCLE_RADIUS)) {
        const { x, y } = ncmcoords;
        const newRegion = {
          type: CIRCLE_TYPE, x, y,
          rx: this.props.circleRadius / cwidth,
          ry: this.props.circleRadius / cheight,
          id: this._.regionId++,
        };
        /** define region's string */
        newRegion.string = this.getNextRegionString();
        newRegion.stringPosition = this.getRegionStringPosition(newRegion);

        /**  stop dragging first temporary point */
        this._.tmpPoints.length = 0; // clear array
        this._.draggingFirstTempPoint = false;

        /** create temporary label */
        this._.temporaryLabel = {
          text: TEMPORARY_LABEL_TEXT,
          x: ncmcoords.x,
          y: ncmcoords.y,
          region: newRegion,
        };

        // re-render
        this.forceUpdate(() => {
          // start dragging temp label
          this._.draggingTemporaryLabel = true;
          // place temp label in its initial position
          const tmpLabelDiv = this.refs[TEMPORARY_LABEL_REF];
          tmpLabelDiv.style.left = `${ncmcoords.x * cwidth - tmpLabelDiv.offsetWidth * 0.5}px`;
          tmpLabelDiv.style.top = `${ncmcoords.y * cheight - tmpLabelDiv.offsetHeight * 0.5}px`;
        });

      /** no intersection -> add a new point */
      } else {
        this._.tmpPoints.push({ x: ncmcoords.x, y: ncmcoords.y });
        /**  stop dragging first temporary point but start dragging next ones */
        this._.draggingFirstTempPoint = false;
        this._.draggingNextTempPoint = true;
      }
      this.renderForAWhile();
    } else if (this._.draggingRegion) {
      this._.draggingRegion = false;
      this._.draggedRegion = null;
      if (this._.draggedRegionPositionDirty) {
        this.notifyLabelsChanged();
        this._.draggedRegionPositionDirty = false;
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
        this.notifyLabelsChanged();
        this._.selectedRegionStringDirty = false;
      }
    }
  }

  selectRegionString(reg, label) {
    if (reg === this._.regionWithSelectedString) return;
    this.unselectSelectedRegionString();
    this._.regionWithSelectedString = reg;
    this.selectLabel(label);
    const input = this.refs.hiddenInput;
    input.value = reg.string;
    setTimeout(() => input.focus(), 0);
  }

  intersectRegionStrings(mouseCanvasX, mouseCanvasY) {
    if (this._.labelSet.size > 0) {
      const canvas = this.refs.labelCanvas;
      const ctx = canvas.getContext('2d');
      for (const label of this._.labelSet) {
        for (const reg of label.regions) {
          const w = ctx.measureText(reg.string).width;
          const pos = reg.stringPosition;
          if (Utils2D.coordsInRectangle(mouseCanvasX, mouseCanvasY,
            pos.x * canvas.offsetWidth, pos.y * canvas.offsetHeight, w, REG_STRING_HEIGHT)) {
            return { region: reg, label };
          }
        }
      }
    }
    return null;
  }

  intersectRegionDeleteBtns(mouseCanvasX, mouseCanvasY) {
    const label = this._.selectedLabel;
    if (label) {
      const canvas = this.refs.labelCanvas;
      for (const reg of label.regions) {
        const pos = reg.deleteIconPosition;
        if (Utils2D.coordsInEllipse(mouseCanvasX, mouseCanvasY,
          pos.x * canvas.offsetWidth, pos.y * canvas.offsetHeight, DELETE_ICON_WIDTH * 0.5, DELETE_ICON_HEIGHT * 0.5)) {
          return { region: reg, label };
        }
      }
    }
    return null;
  }

  refreshAllRegionStringPositions() {
    for (const label of this._.labelSet) {
      for (const reg of label.regions) {
        reg.stringPosition = this.getRegionStringPosition(reg);
      }
    }
  }

  getRegionStringPosition(region) {
    const canvas = this.refs.labelCanvas;
    const cwidth = canvas.offsetWidth;
    const cheight = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    const swidth = Math.ceil(ctx.measureText(region.string).width);
    const rgx = region.x * cwidth;
    const rgy = region.y * cheight;
    let x;
    let y;
    // top
    x = rgx - swidth * 0.5;
    y = rgy - 6 - REG_STRING_HEIGHT;
    if (x >= 0 && x + swidth <= cwidth && y >= 0 &&
      !this.checkStringIntersection(x, y, swidth, REG_STRING_HEIGHT, region)) {
      return { x: x / cwidth, y: y / cheight };
    }
    // right
    x = rgx + 6;
    y = rgy - REG_STRING_HEIGHT * 0.5;
    if (x + swidth <= cwidth && y >= 0 && y + REG_STRING_HEIGHT <= cheight &&
      !this.checkStringIntersection(x, y, swidth, REG_STRING_HEIGHT, region)) {
      return { x: x / cwidth, y: y / cheight };
    }
    // left
    x = rgx - 6 - swidth;
    y = rgy - REG_STRING_HEIGHT * 0.5;
    if (x >= 0 && y >= 0 && y + REG_STRING_HEIGHT <= cheight &&
      !this.checkStringIntersection(x, y, swidth, REG_STRING_HEIGHT, region)) {
      return { x: x / cwidth, y: y / cheight };
    }
    // bottom (default)
    x = rgx - swidth * 0.5;
    y = rgy + 6;
    return { x: x / cwidth, y: y / cheight };
  }

  checkStringIntersection(x, y, w, h, region) {
    const canvas = this.refs.labelCanvas;
    const ctx = canvas.getContext('2d');
    for (const label of this._.labelSet) {
      for (const reg of label.regions) {
        if (reg === region) continue;
        const width = ctx.measureText(reg.string).width;
        const pos = reg.stringPosition;
        if (Utils2D.rectanglesIntersect(x, y, w, h,
        pos.x * canvas.offsetWidth, pos.y * canvas.offsetHeight,
        width, REG_STRING_HEIGHT)) return true;
      }
    }
    return false;
  }

  getNextRegionString() {
    const auxset = new Set();
    for (const label of this._.labelSet) {
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
  /**
   * synchronize the label and its matching div's positions making sure
   * that the child div does not overflow the canvas
   */
  refreshLabelPosition(label) {
    const labelDiv = this.refs[getLabelRef(label.id, this._.componentId)];
    const canvas = this.refs.labelCanvas;
    const cwidth = canvas.offsetWidth;
    const cheight = canvas.offsetHeight;
    const w = labelDiv.offsetWidth;
    const h = labelDiv.offsetHeight;
    // left
    let left = label.x * cwidth - w * 0.5;
    if (left <= 0) left = 1;
    else if (left + w >= cwidth) left = cwidth - w - 1;
    labelDiv.style.left = `${left}px`;
    // top
    let top = label.y * cheight - h * 0.5;
    if (top <= 0) top = 1;
    else if (top + h >= cheight) top = cheight - h - 1;
    labelDiv.style.top = `${top}px`;
    // reset label's coords
    label.x = (left + 0.5 * w) / cwidth;
    label.y = (top + 0.5 * h) / cheight;
  }

  refreshAllLabelsPositions() {
    for (const label of this._.labelSet) {
      if (label.minimized) continue;
      this.refreshLabelPosition(label);
    }
    if (this._.draggingTemporaryLabel) {
      const canvas = this.refs.labelCanvas;
      const label = this._.temporaryLabel;
      const div = this.refs[TEMPORARY_LABEL_REF];
      div.style.left = `${label.x * canvas.offsetWidth - div.offsetWidth * 0.5}px`;
      div.style.top = `${label.y * canvas.offsetHeight - div.offsetHeight * 0.5}px`;
    }
  }

  /**
   * get region and its label that intersect the point (x,y)
   * which must be in normalized coordinates
   */
  intersectRegions(x, y) {
    for (const label of this._.labelSet) {
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
    // debugger
    for (const label of this._.labelSet) {
      if (label.minimized) continue;
      if (Utils2D.coordsInElement(x, y, this.refs[getLabelRef(label.id, this._.componentId)])) {
        return label;
      }
    }
    return null;
  }

  /** unselect the current selected label */
  unselectSelectedLabel() {
    const label = this._.selectedLabel;
    if (label) {
      if (this._.mode === MODES.EDITION) {
        if (this._.selectedLabelTextDirty) {
          this.notifyLabelsChanged();
          this._.selectedLabelTextDirty = false;
        }
        document.getElementById(getLabelFocusId(label.id, this._.componentId)).blur();
      }
      this._.selectedLabel = null;
      this.renderForAWhile();
      this.forceUpdate();
    }
  }

  /** select a label, and unselect the previous one */
  selectLabel(label, selectText) {
    // already selected? do nothing
    if (label === this._.selectedLabel) return;
    this.unselectSelectedLabel(); // unselect previous selected label
    label.minimized = false;
    this._.selectedLabel = label;
    if (this._.mode === MODES.EDITION) this.refreshAllDeleteRegionIcons();
    this.renderForAWhile();
    this.forceUpdate(() => {
      this.refreshLabelPosition(label);
      const mode = this._.mode;
      if (mode === MODES.EDITION) {
        setTimeout(() => {
          const id = getLabelFocusId(label.id, this._.componentId);
          const elem = document.getElementById(id);
          elem.focus();
          if (mode === MODES.EDITION && selectText) {
            if (typeof elem.select === 'function') elem.select();
            else if (typeof elem.setSelectionRange === 'function') {
              elem.setSelectionRange(0, elem.value.length);
            }
          }
        }, 0);
      }
    });
  }

  removeLabel(label) {
    if (label === this._.selectedLabel) {
      this._.selectedLabel = null;
    }
    this._.labelSet.delete(label);
    delete this._.id2labelMap[label.id];
    this.renderForAWhile();
    this.forceUpdate();
    // notify parent of changes in labels
    this.notifyLabelsChanged();
  }

  exportLabelsToJSON() {
    const labelJSONArray = [];
    for (const label of this._.labelSet) {
      const regions = [];
      for (const reg of label.regions) {
        if (reg.type === POLYGON_TYPE) {
          regions.push({ type: POLYGON_TYPE, points: reg.points, x: reg.x, y: reg.y, id: reg.id, string: reg.string });
        } else {
          regions.push({ type: CIRCLE_TYPE, x: reg.x, y: reg.y, id: reg.id, string: reg.string });
        }
      }
      labelJSONArray.push({ regions, x: label.x, y: label.y, text: label.text, id: label.id });
    }
    return labelJSONArray;
  }

  /**
   * Load labels over the current image. It is assumed that an image has already been loaded
   * and all previous labels were removed
   */
  loadLabels(labels) {
    if (!labels) return;
    // update last JSON screenshot with new input
    const labelsCopy = cloneDeep(labels);
    this._.lastLabelsJSONScreenshot = labelsCopy;

    const mode = this._.mode;
    const canvas = this.refs.labelCanvas;
    let lid = 0;
    let rid = 0;
    for (const label of labelsCopy) {
      const regions = new Set();
      const text = label.text;
      const newLabel = { id: label.id, regions, x: label.x, y: label.y, text, minimized: true };
      this._.labelSet.add(newLabel);
      this._.id2labelMap[newLabel.id] = newLabel;
      for (const reg of label.regions) {
        if (rid < reg.id) rid = reg.id;
        const region = cloneDeep(reg);
        if (region.type === CIRCLE_TYPE) {
          region.rx = this.props.circleRadius / canvas.offsetWidth;
          region.ry = this.props.circleRadius / canvas.offsetHeight;
        }
        region.stringPosition = this.getRegionStringPosition(region);
        regions.add(region);
      }
      if (lid < label.id) lid = label.id;
    }
    this._.labelId = lid + 1;
    this._.regionId = rid + 1;

    if (mode === MODES.READONLY) {
      /* make sure to make visible labels that are selected */
      const { selectedLabelIds } = this.props;
      if (selectedLabelIds) {
        selectedLabelIds.forEach(id => {
          const label = this._.id2labelMap[id];
          if (label) label.visible = true;
          else console.warn('WARNING: id = ', id, ' not found in id2labelMap');
        });
      }
    }

    this.renderForAWhile();
    if (mode !== MODES.READONLY) this.forceUpdate(this.refreshAllLabelsPositions);
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
    // set as background image
    this._.backgroundImg = img;
    this._.imageLoaded = true;
    // clear all previous labels
    this.removeAllLabels();
    // refresh GUI
    this.refreshCanvases();
  }

  onWindowResize() {
    this.refreshCanvases();
  }

  refreshCanvases() {
    // debugger
    if (this._.imageLoaded) {
      const { labelCanvas, imgCanvas, canvasWrapper } = this.refs;
      const img = this._.backgroundImg;
      const canvasAux = this._.canvasAux;
      // resize canvas and canvasAux
      const w = canvasWrapper.offsetWidth;
      const ratio = w / img.width;
      const h = img.height * ratio;
      canvasWrapper.style.height = `${h}px`;
      labelCanvas.style.height = `${h}px`;
      labelCanvas.width = w;
      labelCanvas.height = h;
      imgCanvas.style.height = `${h}px`;
      // imgCanvas.width = w;
      // imgCanvas.height = h;
      canvasAux.width = Math.min(this.props.maxResolutionX, img.width);
      canvasAux.height = Math.min(this.props.maxResolutionY, img.height);
      // draw image into canvasAux
      const auxctx = canvasAux.getContext('2d');
      auxctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvasAux.width, canvasAux.height);
      // draw canvasAux into imgCanvas
      const imgctx = imgCanvas.getContext('2d');
      imgctx.drawImage(canvasAux, 0, 0, canvasAux.width, canvasAux.height, 0, 0, imgCanvas.width, imgCanvas.height);
      // refresh radius of all circles
      this.refreshAllCirclesRadius(this.props.circleRadius);
      // refresh string positions
      this.refreshAllRegionStringPositions();
      // refresh GUI
      this.renderForAWhile();
      this.forceUpdate(this.refreshAllLabelsPositions);
    }
  }

  refreshAllCirclesRadius(radius) {
    const canvas = this.refs.labelCanvas;
    for (const label of this._.labelSet) {
      for (const reg of label.regions) {
        if (reg.type === CIRCLE_TYPE) {
          reg.rx = radius / canvas.offsetWidth;
          reg.ry = radius / canvas.offsetHeight;
        }
      }
    }
  }

  /* load image from source (file or url) and then load labels */
  loadImageAndLabels(source, labels) {
    if (source) {
      let sourcePromise = null;
      if (source.file) sourcePromise = this.loadLocalImage(source.file);
      else if (source.url) sourcePromise = this.loadRemoteImage(source.url);
      if (sourcePromise) {
        sourcePromise
          .then(() => {
            this._.sourceLoaded = true;
            this.loadLabels(labels);
          })
          .catch(err => this.props.errorDetectedCallback(err));
      } else this.props.errorDetectedCallback('No file or url found in source');
    }
  }

  removeAllLabels() {
    if (this._.labelSet.size === 0) return;
    this._.labelSet.clear();
    this._.id2labelMap = {};
    this._.selectedLabel = false;
    this._.temporaryLabel = null;
    this._.draggingTemporaryLabel = false;
    this._.draggingFirstTempPoint = false;
    this._.draggingNextTempPoint = false;
    this._.draggingExistingLabel = false;
    this._.draggingRegion = false;
    this._.draggedRegion = null;
    this._.draggedRegionPositionDirty = false;
    this._.selectedRegionStringDirty = false;
    this._.selectedLabelPositionDirty = false;
    this._.selectedLabelTextDirty = false;
  }

  /** render the scene onto the canvas (EDITION MODE)*/
  renderSceneEditionMode() {
    if (!this._.showLabels || this._.componentUnmounted ||
    !this._.renderingTimerRunning) return;

    requestAnimationFrame(this.renderScene);
    // debugger
    const canvas = this.refs.labelCanvas;
    const cvwidth = canvas.offsetWidth;
    const cvheight = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    /* 1) clear label canvas */
    ctx.clearRect(0, 0, cvwidth, cvheight);
    /* 2) draw regions */
    this.drawRegions(ctx, cvwidth, cvheight);
    /* 3) draw lines */
    this.drawLines(ctx, cvwidth, cvheight);
    /* 4) draw temporary polygon, if any */
    this.drawTemporaryPolygon(ctx, cvwidth, cvheight);
    /* 5) draw region's strings */
    this.drawRegionStrings(ctx, cvwidth, cvheight);
    /* 6) Draw delete icons */
    this.drawDeleteIcons(ctx, cvwidth, cvheight);
  }

  /** render the scene onto the canvas (READONLY MODE)*/
  renderSceneReadOnlyMode() {
    if (!this._.showLabels || this._.componentUnmounted ||
    !this._.renderingTimerRunning) return;

    requestAnimationFrame(this.renderScene);
    const canvas = this.refs.labelCanvas;
    const cvwidth = canvas.offsetWidth;
    const cvheight = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    /* 1) clear label canvas */
    ctx.clearRect(0, 0, cvwidth, cvheight);
    /* 2) draw selected regions */
    ctx.lineWidth = 1.2;
    ctx.fillStyle = this.props.regionHighlightColor;
    ctx.strokeStyle = this.props.lineHighlightColor;
    this._.labelSet.forEach(label => {
      if (!label.visible) return;
      label.regions.forEach(reg => drawRegion(ctx, reg, cvwidth, cvheight, !this.props.fillRegions));
    });
    /* 3) draw region's strings */
    if (this.props.showRegionStrings) {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = this.props.stringHighlightColor;
      ctx.strokeStyle = this.props.lineHighlightColor;
      ctx.font = `${REG_STRING_HEIGHT}px sans-serif`;
      this._.labelSet.forEach(label => {
        if (!label.visible) return;
        label.regions.forEach(reg => {
          const pos = reg.stringPosition;
          ctx.fillText(reg.string, pos.x * cvwidth, pos.y * cvheight);
          ctx.strokeText(reg.string, pos.x * cvwidth, pos.y * cvheight);
        });
      });
    }
  }


  drawRegions(ctx, cvwidth, cvheight) {
    // debugger
    // normal regions
    ctx.fillStyle = this.props.regionNormalColor;
    ctx.strokeStyle = this.props.lineNormalColor;
    ctx.lineWidth = 1.2;
    for (const label of this._.labelSet) {
      if (label === this._.selectedLabel) continue;
      for (const reg of label.regions) {
        drawRegion(ctx, reg, cvwidth, cvheight);
      }
    }
    // temporary label's region
    if (this._.draggingTemporaryLabel) {
      drawRegion(ctx, this._.temporaryLabel.region, cvwidth, cvheight);
    }
    // selected label's regions
    if (this._.selectedLabel) {
      ctx.fillStyle = this.props.regionHighlightColor;
      ctx.strokeStyle = this.props.lineHighlightColor;
      for (const reg of this._.selectedLabel.regions) {
        drawRegion(ctx, reg, cvwidth, cvheight);
      }
    }
  }

  drawLines(ctx, cvwidth, cvheight) {
    // normal lines
    ctx.strokeStyle = this.props.lineNormalColor;
    for (const label of this._.labelSet) {
      if (label === this._.selectedLabel) continue;
      if (label.minimized) continue;
      for (const reg of label.regions) {
        Utils2D.drawLine(ctx, reg.x * cvwidth, reg.y * cvheight,
          label.x * cvwidth, label.y * cvheight);
      }
    }
    // temporary label's line
    if (this._.draggingTemporaryLabel) {
      const label = this._.temporaryLabel;
      const reg = label.region;
      Utils2D.drawLine(ctx, reg.x * cvwidth, reg.y * cvheight,
        label.x * cvwidth, label.y * cvheight);
    }
    // selected label's lines
    if (this._.selectedLabel) {
      ctx.strokeStyle = this.props.lineHighlightColor;
      const label = this._.selectedLabel;
      for (const reg of label.regions) {
        Utils2D.drawLine(ctx, reg.x * cvwidth, reg.y * cvheight,
          label.x * cvwidth, label.y * cvheight);
      }
    }
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
    if (this._.selectedLabel) {
      // debugger
      for (const reg of this._.selectedLabel.regions) {
        const pos = reg.deleteIconPosition;
        Utils2D.drawDeleteIcon(ctx, pos.x * cvwidth, pos.y * cvheight,
          DELETE_ICON_WIDTH, DELETE_ICON_HEIGHT);
      }
    }
  }

  drawRegionStrings(ctx, cvwidth, cvheight) {
    if (this._.labelSet.size > 0) {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.lineWidth = 0.8;
      ctx.fillStyle = this.props.stringNormalColor;
      ctx.strokeStyle = this.props.lineNormalColor;
      ctx.font = `${REG_STRING_HEIGHT}px sans-serif`;
      for (const label of this._.labelSet) {
        for (const reg of label.regions) {
          const pos = reg.stringPosition;
          if (reg === this._.regionWithSelectedString) {
            ctx.fillStyle = this.props.stringFocusColor;
            ctx.fillText(reg.string, pos.x * cvwidth, pos.y * cvheight);
            ctx.strokeText(reg.string, pos.x * cvwidth, pos.y * cvheight);
            ctx.fillStyle = this.props.stringNormalColor;
          } else if (label === this._.selectedLabel) {
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

  onSelectedLabelTextChanged(e) {
    // debugger
    this._.selectedLabel.text = e.target.value;
    this._.selectedLabelTextDirty = true;
  }

  onSelectedLabelKeyDown(e) {
    if (e.keyCode === 13) this.unselectSelectedLabel();
  }

  onSelectedLabelBlur() {
    if (this._.selectedLabelTextDirty) {
      if (this._.mode === MODES.EDITION) this.notifyLabelsChanged();
      this._.selectedLabelTextDirty = false;
    }
  }

  getOnCloseCallback(label) {
    return () => this.removeLabel(label);
  }

  getOnMinimizeCallback(label) {
    return () => {
      if (label === this._.selectedLabel) this.unselectSelectedLabel();
      label.minimized = true;
      this.renderForAWhile();
      this.forceUpdate();
    };
  }

  onHiddenInputTextChanged() {
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
    if (e.keyCode === 13) {
      if (this._.selectedRegionStringDirty) {
        this._.selectedRegionStringDirty = false;
        const reg = this._.regionWithSelectedString;
        if (!reg.string) reg.string = this.getNextRegionString();
        this.notifyLabelsChanged();
      }
      this._.regionWithSelectedString = null;
      e.target.blur();
      this.renderForAWhile();
    }
  }

  refreshAllDeleteRegionIcons() {
    // debugger
    const label = this._.selectedLabel;
    if (label) {
      for (const reg of label.regions) this.refreshDeleteRegionIconPosition(reg);
    }
  }

  refreshDeleteRegionIconPosition(reg) {
    const canvas = this.refs.labelCanvas;
    const rx = DELETE_ICON_WIDTH * 0.5;
    const ry = DELETE_ICON_HEIGHT * 0.5;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    // try different directions
    const d = 8;
    const xys = [
      reg.x * w + d, reg.y * h - d, // top right
      reg.x * w, reg.y * h - d, // top
      reg.x * w + d, reg.y * h, // right
      reg.x * w, reg.y * h - d, // bottom
      reg.x * w - d, reg.y * h, // left
      reg.x * w - d, reg.y * h + d, // bottom left
      reg.x * w + d, reg.y * h + d, // bottom right
    ];
    for (let i = 0; i < xys.length; i += 2) {
      const x = xys[i];
      const y = xys[i + 1];
      if (x >= rx && x + rx <= w && y >= ry && y + ry <= h) {
        reg.deleteIconPosition = { x: x / w, y: y / h };
        return;
      }
    }
    // default
    reg.deleteIconPosition = { x: reg.x, y: reg.y };
  }

  notifyLabelsChanged() {
    const json = this.exportLabelsToJSON();
    this._.lastLabelsJSONScreenshot = json;
    this.props.labelsChangedCallback(json);
  }

  /* =============== */
  /*  API FUNCTIONS  */
  /* =============== */

  minimizeAllLabels() {
    if (!this._.showLabels) return;
    this.unselectSelectedLabel();
    for (const label of this._.labelSet) label.minimized = true;
    this.renderForAWhile();
    this.forceUpdate();
  }

  maximizeAllLabels() {
    if (!this._.showLabels) return;
    for (const label of this._.labelSet) label.minimized = false;
    this.renderForAWhile();
    this.forceUpdate(this.refreshAllLabelsPositions);
  }

  /** React's render function */
  render() {
    let dynamicElements = [];
    if (this._.showLabels) {
      switch (this._.mode) {
        case MODES.EDITION: {
          // temporary label
          if (this._.temporaryLabel) {
            dynamicElements.push(this.props.renderLabel({
              label: this._.temporaryLabel,
              ref: TEMPORARY_LABEL_REF,
              key: TEMPORARY_LABEL_REF,
              style: { position: 'absolute', opacity: 0.5 },
            }));
          }
          // existing labels
          for (const label of this._.labelSet) {
            if (label.minimized) continue; // skip if minimized
            const ref = getLabelRef(label.id, this._.componentId);
            dynamicElements.push(
              this.props.renderLabel({
                label,
                ref,
                key: ref,
                focusId: getLabelFocusId(label.id, this._.componentId),
                style: { position: 'absolute' },
                onTextChanged: this.onSelectedLabelTextChanged,
                onKeyDown: this.onSelectedLabelKeyDown,
                onClose: this.getOnCloseCallback(label),
                onMinimize: this.getOnMinimizeCallback(label),
                onBlur: this.onSelectedLabelBlur,
              })
            );
          }
          break;
        }
        default: break;
      }
    }

    return (
      <div ref="root" style={{ ...styles.root, ...this.props.style }}>
        <div ref="canvasWrapper" style={styles.canvasWrapper}>
          <canvas ref="imgCanvas" style={styles.canvas}></canvas>
          <canvas ref="labelCanvas" style={styles.canvas}></canvas>
          <input
            ref="hiddenInput" style={styles.hiddenInput}
            onChange={this.onHiddenInputTextChanged}
            onKeyDown={this.onHiddenInputKeyDown}
          />
          {dynamicElements}
        </div>
      </div>
    );
  }
}

const styles = {
  root: {
    display: 'inline-block',
    width: '100%',
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
  },
  canvasWrapper: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
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

function getLabelRef(labelId, compId) {
  return `_img${compId}_lb${labelId}`;
}

function getLabelFocusId(labelId, compId) {
  return `_img${compId}_lb${labelId}_fcs`;
}

function drawRegion(ctx, reg, cvwidth, cvheight, nofill) {
  if (reg.type === POLYGON_TYPE) {
    Utils2D.drawPolygon(ctx, reg.points, cvwidth, cvheight, nofill);
  } else { // CIRCLE_TYPE
    Utils2D.drawEllipse(ctx, reg.x * cvwidth, reg.y * cvheight,
      reg.rx * cvwidth, reg.ry * cvheight, nofill);
  }
}
