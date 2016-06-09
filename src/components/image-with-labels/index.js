import React, { Component } from 'react';
import Utils2D from '../../_2Dlibrary/Utils2D';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';

const LEFT_BUTTON = 0;
const RIGHT_BUTTON = 1;

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
const EDITION = 'EDITION';
const READONLY = 'READONLY';
const REGIONSONLY = 'REGIONSONLY';
const MULTISELECT = 'MULTISELECT';
const WRITEANSWER = 'WRITEANSWER';

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
      errorDetectedCallback: err => { alert(err); console.log(err); },
      showLabels: true,
      mode: EDITION,
      circleRadius: 4,
      // colors
      lineHighlightColor: 'rgb(255,0,0)',
      lineNormalColor: 'rgb(0,0,0)',
      regionHighlightColor: 'rgba(255,255,0,0.2)',
      regionNormalColor: 'rgba(0,255,0,0.2)',
      stringFocusColor: 'rgb(255,255,0)',
      stringHighlightColor: 'rgb(236,150,13)',
      stringNormalColor: 'rgb(255,255,255)',
    };
  }

  constructor(props) {
    super(props);

    this.mystate = {
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
      draggingTempLabel: false,
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
      componentFocused: false,
      componentUnmounted: false,
      showLabels: props.showLabels,
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
    this.refreshDeleteRegionBtnPosition = this.refreshDeleteRegionBtnPosition.bind(this);
    this.refreshAllDeleteRegionBtns = this.refreshAllDeleteRegionBtns.bind(this);
    this.intersectRegionDeleteBtns = this.intersectRegionDeleteBtns.bind(this);
    this.onSelectedLabelTextChanged = this.onSelectedLabelTextChanged.bind(this);
    this.onSelectedLabelKeyDown = this.onSelectedLabelKeyDown.bind(this);
    this.onHiddenInputKeyDown = this.onHiddenInputKeyDown.bind(this);
    this.unselectSelectedRegionString = this.unselectSelectedRegionString.bind(this);
    this.selectRegionString = this.selectRegionString.bind(this);
    this.loadImageAndLabels = this.loadImageAndLabels.bind(this);
    this.loadLabels = this.loadLabels.bind(this);
    this.drawLines = this.drawLines.bind(this);
    this.drawRegions = this.drawRegions.bind(this);
    this.drawRegionStrings = this.drawRegionStrings.bind(this);
    this.drawDeleteIcons = this.drawDeleteIcons.bind(this);
    this.drawTemporaryPoints = this.drawTemporaryPoints.bind(this);

    // set event handlers bindings according to mode
    switch (props.mode) {
      case EDITION:
        this.onMouseDown_EditionMode = this.onMouseDown_EditionMode.bind(this);
        this.onMouseMove_EditionMode = this.onMouseMove_EditionMode.bind(this);
        this.onMouseUp_EditionMode = this.onMouseUp_EditionMode.bind(this);
        this.renderScene = this.renderScene_EditionMode.bind(this);
        break;
      case REGIONSONLY:
        this.renderScene = this.renderScene_RegionsOnlyMode.bind(this);
        break;
      case READONLY:
        this.onMouseDown_ReadOnlyMode = this.onMouseDown_ReadOnlyMode.bind(this);
        this.renderScene = this.renderScene_ReadOnlyMode.bind(this);
        break;
      case MULTISELECT:
        this.onMouseDown_MultiSelectMode = this.onMouseDown_MultiSelectMode.bind(this);
        this.unselectLabel_MultiSelectMode = this.unselectLabel_MultiSelectMode.bind(this);
        this.selectLabel_MultiSelectMode = this.selectLabel_MultiSelectMode.bind(this);
        this.renderScene = this.renderScene_MultiSelectMode.bind(this);
        break;
      case WRITEANSWER:
        this.onMouseDown_WriteAnswerMode = this.onMouseDown_WriteAnswerMode.bind(this);
        this.renderScene = this.renderScene_WriteAnswerMode.bind(this);
        break;
      default:
        this.props.errorDetectedCallback(`Unexpected mode = ${props.mode}`);
        break;
    }
  }

  componentDidMount() {
    // add event listeners
    switch (this.mystate.mode) {
      case EDITION:
        window.addEventListener('mousedown', this.onMouseDown_EditionMode);
        window.addEventListener('mousemove', this.onMouseMove_EditionMode);
        window.addEventListener('mouseup', this.onMouseUp_EditionMode);
        break;
      case READONLY:
        window.addEventListener('mousedown', this.onMouseDown_ReadOnlyMode);
        break;
      case MULTISELECT:
        window.addEventListener('mousedown', this.onMouseDown_MultiSelectMode);
        break;
      case WRITEANSWER:
        window.addEventListener('mousedown', this.onMouseDown_WriteAnswerMode);
        break;
      default: break;
    }
    // load image and labels provided (if any)
    this.loadImageAndLabels(this.props.source, this.props.labels);
  }

  componentWillReceiveProps(nextProps) {
    if (this.mystate.mode === EDITION) {
      /* check if a new source was provided */
      if (nextProps.source && !isEqual(this.props.source, nextProps.source)) {
        this.loadImageAndLabels(nextProps.source, nextProps.labels);
      }
      /* check if a new circle radius was provided */
      if (nextProps.circleRadius !== this.props.circleRadius) {
        // update radius of all ellipses
        const canvas = this.refs.labelCanvas;
        for (const label of this.mystate.labelSet) {
          for (const reg of label.regions) {
            if (reg.type === CIRCLE_TYPE) {
              reg.rx = nextProps.circleRadius / canvas.width;
              reg.ry = nextProps.circleRadius / canvas.height;
            }
          }
        }
        this.renderForAWhile();
      }
    }

    /* check if showLabels has changed */
    if (nextProps.showLabels !== this.props.showLabels) {
      if (nextProps.showLabels) {
        setTimeout(() => {
          this.mystate.showLabels = true;
          this.renderForAWhile(0);
          if (this.mystate.mode !== REGIONSONLY &&
            this.mystate.mode !== MULTISELECT) this.forceUpdate(this.refreshAllLabelsPositions);
        }, 0);
      } else {
        this.mystate.showLabels = false;
        const canvas = this.refs.labelCanvas;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        /* if in edition mode, notify parent that we lost focus */
        if (this.mystate.mode === EDITION && this.mystate.componentFocused) {
          this.mystate.componentFocused = false;
          this.props.lostFocusCallback();
        }
      }
    }
  }

  componentWillUnmount() {
    // remove event listeners
    switch (this.mystate.mode) {
      case EDITION:
        window.removeEventListener('mousedown', this.onMouseDown_EditionMode);
        window.removeEventListener('mousemove', this.onMouseMove_EditionMode);
        window.removeEventListener('mouseup', this.onMouseUp_EditionMode);
        break;
      case READONLY:
        window.removeEventListener('mousedown', this.onMouseDown_ReadOnlyMode);
        break;
      case MULTISELECT:
        window.removeEventListener('mousedown', this.onMouseDown_MultiSelectMode);
        break;
      case WRITEANSWER:
        window.removeEventListener('mousedown', this.onMouseDown_WriteAnswerMode);
        break;
      default: break;
    }
    // remember we have been unmounted
    this.mystate.componentUnmounted = true;
  }

  onMouseDown_EditionMode(event) {
    /* get mouse coordinates in canvas space */
    const canvas = this.refs.labelCanvas;
    const canvCoords = Utils2D.getElementMouseCoords(canvas, event);
    const mouseCanvasX = canvCoords.x;
    const mouseCanvasY = canvCoords.y;

    /* click within canvas boundaries and within canvasWrapper's hierarchy */
    const clickInsideCanvas = Utils2D.coordsInRectangle(mouseCanvasX, mouseCanvasY,
      0, 0, canvas.width, canvas.height) && isAncestorOf(this.refs.canvasWrapper, event.target);

    /* notify about gain or loss of focus to parent */
    if (clickInsideCanvas && !this.mystate.componentFocused) {
      this.mystate.componentFocused = true;
      this.props.gotFocusCallback();
    } else if (!clickInsideCanvas && this.mystate.componentFocused) {
      this.mystate.componentFocused = false;
      this.props.lostFocusCallback();
    }

    /** left button click */
    if (event.button === LEFT_BUTTON) {
      /** if left click within canvas boundaries and within canvasWrapper's hierarchy */
      if (clickInsideCanvas) {
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
            this.mystate.id2labelMap[newLabel.id] = newLabel;
            // select the new label
            this.selectLabel(newLabel, true);
          }
          // notify parent of changes in labels
          this.props.labelsChangedCallback(this.exportLabelsToJSON());

        /** case 2) dragging a temporary point */
        } else if (this.mystate.draggingNextTempPoint) {
          // check intersection against dropped points
          let intersected = false;
          const tmpPts = this.mystate.tmpPoints;
          if (tmpPts.length >= 2) {
            const p = tmpPts[0];
            if (Utils2D.circlesIntersect(p.x * canvas.width, p.y * canvas.height,
              TMP_CIRCLE_RADIUS, nccoords.x * canvas.width, nccoords.y * canvas.height,
              TMP_CIRCLE_RADIUS)) {
              /** case 2.1) previous point intersected */
              const points = tmpPts.slice(0, -1);
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
                  type: CIRCLE_TYPE, x, y,
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
            }
          }
          /** case 2.2) no intersection -> add a new point */
          if (!intersected) this.mystate.tmpPoints.push({ x: nccoords.x, y: nccoords.y });

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
              if (ans.label.regions.size === 0) this.removeLabel(ans.label);
              else {
                this.renderForAWhile(0);
                this.forceUpdate();
                this.props.labelsChangedCallback(this.exportLabelsToJSON());
              }
              break;
            }

            /** case 3.3) check if click on a region's string */
            let ans = this.intersectRegionStrings(mouseCanvasX, mouseCanvasY);
            if (ans) {
              this.selectRegionString(ans.region, ans.label);
              stringClicked = true;
              break;
            }

            /** case 3.4) check if click on region */
            ans = this.intersectRegions(nccoords.x, nccoords.y);
            if (ans) {
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
            this.mystate.tmpPoints.push({ x: nccoords.x, y: nccoords.y });
            this.mystate.tmpPoints.push({ x: nccoords.x, y: nccoords.y });
            // start dragging the last point
            this.mystate.draggingFirstTempPoint = true;
            break; // pseudo GOTO
          }

          if (this.mystate.regionWithSelectedString && !stringClicked) {
            this.unselectSelectedRegionString();
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

  onMouseMove_EditionMode(e) {
    // don't do anything if labels are hidden
    if (!this.mystate.showLabels) return;
    // get mouse coordinates relative to canvas
    const canvas = this.refs.labelCanvas;
    const mcoords = Utils2D.getElementMouseCoords(canvas, e);

    /* dragging a temporal point */
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

    /* dragging a temporal label */
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

    /* dragging an existing label */
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

    /* dragging a region */
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
      // remember region's position is dirty
      this.mystate.draggedRegionPositionDirty = true;
    }
  }

  onMouseUp_EditionMode(e) {
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
          type: CIRCLE_TYPE, x, y,
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
        this.mystate.tmpPoints.push({ x: ncmcoords.x, y: ncmcoords.y });
        /**  stop dragging first temporary point but start dragging next ones */
        this.mystate.draggingFirstTempPoint = false;
        this.mystate.draggingNextTempPoint = true;
      }
      this.renderForAWhile();
    } else if (this.mystate.draggingRegion) {
      this.mystate.draggingRegion = false;
      this.mystate.draggedRegion = null;
      if (this.mystate.draggedRegionPositionDirty) {
        this.props.labelsChangedCallback(this.exportLabelsToJSON());
        this.mystate.draggedRegionPositionDirty = false;
      }
    }
  }

  onMouseDown_ReadOnlyMode(event) {
    /* if labels hidden, don't do anything */
    if (!this.mystate.showLabels) return;

    /* get mouse coordinates in canvas space */
    const canvas = this.refs.labelCanvas;
    const canvCoords = Utils2D.getElementMouseCoords(canvas, event);
    const mouseCanvasX = canvCoords.x;
    const mouseCanvasY = canvCoords.y;

    /* click within canvas boundaries and within canvasWrapper's hierarchy */
    const clickInsideCanvas = Utils2D.coordsInRectangle(mouseCanvasX, mouseCanvasY,
      0, 0, canvas.width, canvas.height) && isAncestorOf(this.refs.canvasWrapper, event.target);

    /** left button click */
    if (event.button === LEFT_BUTTON) {
      /** if left click within canvas boundaries and within canvasWrapper's hierarchy */
      if (clickInsideCanvas) {
        /** a little Hack to simulate GOTO in javascript */
        do {
          /* case 1) check if click on label  (text input) */
          const label = this.getIntersectedLabel(mouseCanvasX, mouseCanvasY);
          if (label) { this.selectLabel(label); break; }

          /* case 2) check if click on a region's string */
          let ans = this.intersectRegionStrings(mouseCanvasX, mouseCanvasY);
          if (ans) { this.selectLabel(ans.label); break; }

          /* case 3) check if click on region */
          const nccoords = Utils2D.getClippedAndNormalizedCoords(canvCoords, canvas);
          ans = this.intersectRegions(nccoords.x, nccoords.y);
          if (ans) {
            // select the label
            this.selectLabel(ans.label);
            break;
          }

          /* default: unselect the selected label */
          this.unselectSelectedLabel();
        } while (false);
      } else {
        this.unselectSelectedLabel();
      }
    }
  }

  onMouseDown_MultiSelectMode(event) {
    /* if labels hidden, don't do anything */
    if (!this.mystate.showLabels) return;

    /* get mouse coordinates in canvas space */
    const canvas = this.refs.labelCanvas;
    const canvCoords = Utils2D.getElementMouseCoords(canvas, event);
    const mouseCanvasX = canvCoords.x;
    const mouseCanvasY = canvCoords.y;

    /* click within canvas boundaries and within canvasWrapper's hierarchy */
    const clickInsideCanvas = Utils2D.coordsInRectangle(mouseCanvasX, mouseCanvasY,
      0, 0, canvas.width, canvas.height) && isAncestorOf(this.refs.canvasWrapper, event.target);

    /** left button click inside canvas */
    if (event.button === LEFT_BUTTON && clickInsideCanvas) {
      let label = null;
      do {
        /* case 1) region string intersected */
        let ans = this.intersectRegionStrings(mouseCanvasX, mouseCanvasY);
        if (ans) { label = ans.label; break; }

        /* case 2) region intersected */
        const nccoords = Utils2D.getClippedAndNormalizedCoords(canvCoords, canvas);
        ans = this.intersectRegions(nccoords.x, nccoords.y);
        if (ans) { label = ans.label; break; }
      } while (false);

      if (label) {
        if (label.selected) this.unselectLabel_MultiSelectMode(label);
        else this.selectLabel_MultiSelectMode(label);
      }
    }
  }

  onMouseDown_WriteAnswerMode(event) {
    /* get mouse coordinates in canvas space */
    const canvas = this.refs.labelCanvas;
    const canvCoords = Utils2D.getElementMouseCoords(canvas, event);
    const mouseCanvasX = canvCoords.x;
    const mouseCanvasY = canvCoords.y;

    /* click within canvas boundaries and within canvasWrapper's hierarchy */
    const clickInsideCanvas = Utils2D.coordsInRectangle(mouseCanvasX, mouseCanvasY,
      0, 0, canvas.width, canvas.height) && isAncestorOf(this.refs.canvasWrapper, event.target);

    /** left button click */
    if (event.button === LEFT_BUTTON) {
      if (clickInsideCanvas) {
        /** a little Hack to simulate GOTO in javascript */
        do {
          /* case 1) check if click on label  (text input) */
          const label = this.getIntersectedLabel(mouseCanvasX, mouseCanvasY);
          if (label) { this.selectLabel(label); break; }

          /* case 2) check if click on a region's string */
          let ans = this.intersectRegionStrings(mouseCanvasX, mouseCanvasY);
          if (ans) { this.selectLabel(ans.label); break; }

          /* case 3) check if click on region */
          const nccoords = Utils2D.getClippedAndNormalizedCoords(canvCoords, canvas);
          ans = this.intersectRegions(nccoords.x, nccoords.y);
          if (ans) { this.selectLabel(ans.label); break; }

          /* default: unselect the selected label */
          this.unselectSelectedLabel();
        } while (false);
      } else {
        this.unselectSelectedLabel();
      }
    }
  }

  unselectLabel_MultiSelectMode(label) {
    if (!label.selected) return;
    label.selected = false;
    this.renderForAWhile(0);
    this.props.labelSelectedCallback(label.id);
  }

  selectLabel_MultiSelectMode(label) {
    if (label.selected) return;
    label.selected = true;
    this.renderForAWhile(0);
    this.props.labelUnselectedCallback(label.id);
  }

  unselectSelectedRegionString() {
    const reg = this.mystate.regionWithSelectedString;
    if (reg) {
      if (!reg.string) reg.string = this.getNextRegionString();
      this.mystate.regionWithSelectedString = null;
      this.refs.hiddenInput.blur();
      if (this.mystate.selectedRegionStringDirty) {
        this.props.labelsChangedCallback(this.exportLabelsToJSON());
        this.mystate.selectedRegionStringDirty = false;
      }
    }
  }

  selectRegionString(reg, label) {
    if (reg === this.mystate.regionWithSelectedString) return;
    this.unselectSelectedRegionString();
    this.mystate.regionWithSelectedString = reg;
    this.selectLabel(label);
    const input = this.refs.hiddenInput;
    input.value = reg.string;
    setTimeout(() => input.focus(), 0);
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

  refreshAllLabelsPositions() {
    for (const label of this.mystate.labelSet) {
      if (label.minimized) continue;
      this.refreshLabelPosition(label);
    }
  }

  /**
   * get region and its label that intersect the point (x,y)
   * which must be in normalized coordinates
   */
  intersectRegions(x, y) {
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
      this.mystate.selectedLabel = null;
      this.renderForAWhile(0);
      this.forceUpdate();

      if (this.mystate.mode === EDITION) {
        document.getElementById(getLabelFocusId(label.id)).blur();
        // if text has changed, notify the parent of changes
        if (this.mystate.selectedLabelTextDirty) {
          this.props.labelsChangedCallback(this.exportLabelsToJSON());
          this.mystate.selectedLabelTextDirty = false;
        }
      } else if (this.mystate.mode === WRITEANSWER) {
        document.getElementById(getLabelFocusId(label.id)).blur();
        if (this.mystate.selectedLabelTextDirty) {
          this.props.labelAnswerChangedCallback({ id: label.id, text: label.text });
          this.mystate.selectedLabelTextDirty = false;
        }
      }
    }
  }

  /** select a label, and unselect the previous one */
  selectLabel(label, selectText) {
    // already selected? do nothing
    if (label === this.mystate.selectedLabel) return;
    this.unselectSelectedLabel(); // unselect previous selected label
    label.minimized = false;
    this.mystate.selectedLabel = label;
    if (this.mystate.mode === EDITION) this.refreshAllDeleteRegionBtns();
    this.renderForAWhile(0);
    this.forceUpdate(() => {
      this.refreshLabelPosition(label);
      if (this.mystate.mode === EDITION) {
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
      } else if (this.mystate.mode === WRITEANSWER) {
        setTimeout(() => document.getElementById(getLabelFocusId(label.id)).focus());
      }
    });
  }

  removeLabel(label) {
    if (label === this.mystate.selectedLabel) {
      this.mystate.selectedLabel = null;
    }
    this.mystate.labelSet.delete(label);
    delete this.mystate.id2labelMap[label.id];
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
    const canvas = this.refs.labelCanvas;
    let lid = 0;
    let rid = 0;
    for (const label of labels) {
      const regions = new Set();
      const text = (this.mystate.mode === WRITEANSWER) ? '' : label.text;
      const newLabel = { id: label.id, regions, x: label.x, y: label.y, text };
      this.mystate.labelSet.add(newLabel);
      this.mystate.id2labelMap[newLabel.id] = newLabel;
      for (const reg of label.regions) {
        if (rid < reg.id) rid = reg.id;
        const region = cloneDeep(reg);
        if (region.type === CIRCLE_TYPE) {
          region.rx = this.props.circleRadius / canvas.width;
          region.ry = this.props.circleRadius / canvas.height;
        }
        region.stringPosition = this.getRegionStringPosition(region);
        regions.add(region);
      }
      if (lid < label.id) lid = label.id;
    }
    this.mystate.labelId = lid + 1;
    this.mystate.regionId = rid + 1;
    this.renderForAWhile(0);
    if (this.mystate.mode !== REGIONSONLY &&
      this.mystate.mode !== MULTISELECT) this.forceUpdate(this.refreshAllLabelsPositions);
  }

  /* load image from local file */
  loadLocalImage(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        this.loadImage(img);
        URL.revokeObjectURL(url);
        this.renderForAWhile(0);
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
        this.renderForAWhile(0);
        res();
      };
      img.onerror = err => rej(err);
      img.src = url;
    });
  }

  /* load an image into an auxiliar canvas for rendering performance */
  loadImage(img) {
    // abort operations if componente was unmounted
    if (this.mystate.componentUnmounted) return;
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

  /* load image from source (file or url) and then load labels */
  loadImageAndLabels(source, labels) {
    if (source) {
      let sourcePromise = null;
      if (source.file) sourcePromise = this.loadLocalImage(source.file);
      else if (source.url) sourcePromise = this.loadRemoteImage(source.url);
      if (sourcePromise) {
        sourcePromise
          .then(() => this.loadLabels(labels))
          .catch(err => this.props.errorDetectedCallback(err));
      } else this.props.errorDetectedCallback('No file or url found in source');
    }
  }

  removeAllLabels() {
    if (this.mystate.labelSet.size === 0) return;
    this.mystate.labelSet.clear();
    this.mystate.id2labelMap = {};
    this.mystate.selectedLabel = false;
    this.mystate.temporaryLabel = null;
    this.mystate.draggingTempLabel = false;
    this.mystate.draggingFirstTempPoint = false;
    this.mystate.draggingNextTempPoint = false;
    this.mystate.draggingExistingLabel = false;
    this.mystate.draggingRegion = false;
    this.mystate.draggedRegion = null;
    this.mystate.draggedRegionPositionDirty = false;
    this.mystate.selectedRegionStringDirty = false;
    this.mystate.selectedLabelPositionDirty = false;
    this.mystate.selectedLabelTextDirty = false;
    this.renderForAWhile();
    this.forceUpdate();
    // notify parent of changes in labels
    this.props.labelsChangedCallback([]);
  }

  /** render the scene onto the canvas (EDITION MODE)*/
  renderScene_EditionMode() {
    if (!this.mystate.showLabels || this.mystate.componentUnmounted ||
    !this.mystate.renderingTimerRunning) return;

    requestAnimationFrame(this.renderScene);
    const canvas = this.refs.labelCanvas;
    const cvwidth = canvas.width;
    const cvheight = canvas.height;
    const ctx = canvas.getContext('2d');
    /* 1) clear label canvas */
    ctx.clearRect(0, 0, cvwidth, cvheight);
    /* 2) draw regions */
    this.drawRegions(ctx, cvwidth, cvheight);
    /* 3) draw lines */
    this.drawLines(ctx, cvwidth, cvheight);
    /* 4) draw temporary points (polygon), if any */
    this.drawTemporaryPoints(ctx, cvwidth, cvheight);
    /* 5) draw region's strings */
    this.drawRegionStrings(ctx, cvwidth, cvheight);
    /* 6) Draw delete icons */
    this.drawDeleteIcons(ctx, cvwidth, cvheight);
  }

  /** render the scene onto the canvas (READONLY MODE)*/
  renderScene_ReadOnlyMode() {
    if (!this.mystate.showLabels || this.mystate.componentUnmounted ||
    !this.mystate.renderingTimerRunning) return;

    requestAnimationFrame(this.renderScene);
    const canvas = this.refs.labelCanvas;
    const cvwidth = canvas.width;
    const cvheight = canvas.height;
    const ctx = canvas.getContext('2d');
    /* 1) clear label canvas */
    ctx.clearRect(0, 0, cvwidth, cvheight);
    /* 2) draw regions */
    this.drawRegions(ctx, cvwidth, cvheight);
    /* 3) draw lines */
    this.drawLines(ctx, cvwidth, cvheight);
    /* 4) draw region's strings */
    this.drawRegionStrings(ctx, cvwidth, cvheight);
  }

  /** render the scene onto the canvas (REGIONSONLY MODE)*/
  renderScene_RegionsOnlyMode() {
    if (!this.mystate.showLabels || this.mystate.componentUnmounted
    || !this.mystate.renderingTimerRunning) return;

    requestAnimationFrame(this.renderScene);
    const canvas = this.refs.labelCanvas;
    const cvwidth = canvas.width;
    const cvheight = canvas.height;
    const ctx = canvas.getContext('2d');
    /* 1) clear label canvas */
    ctx.clearRect(0, 0, cvwidth, cvheight);
    /* 2) draw regions */
    this.drawRegions(ctx, cvwidth, cvheight);
    /* 3) draw region's strings */
    this.drawRegionStrings(ctx, cvwidth, cvheight);
  }

  /** render the scene onto the canvas (MULTISELECT MODE)*/
  renderScene_MultiSelectMode() {
    if (!this.mystate.showLabels || this.mystate.componentUnmounted ||
      !this.mystate.renderingTimerRunning) return;

    requestAnimationFrame(this.renderScene);
    const canvas = this.refs.labelCanvas;
    const cvwidth = canvas.width;
    const cvheight = canvas.height;
    const ctx = canvas.getContext('2d');
    /* 1) clear label canvas */
    ctx.clearRect(0, 0, cvwidth, cvheight);
    if (this.mystate.labelSet.size === 0) return; // little optimization

    /* 2) draw regions */
    // non-selected labels's regions
    ctx.fillStyle = this.props.regionNormalColor;
    ctx.strokeStyle = this.props.lineNormalColor;
    ctx.lineWidth = 1.2;
    for (const label of this.mystate.labelSet) {
      if (!label.selected) for (const reg of label.regions) drawRegion(ctx, reg, cvwidth, cvheight);
    }
    // selected labels's regions
    ctx.fillStyle = this.props.regionHighlightColor;
    ctx.strokeStyle = this.props.lineHighlightColor;
    for (const label of this.mystate.labelSet) {
      if (label.selected) for (const reg of label.regions) drawRegion(ctx, reg, cvwidth, cvheight);
    }
    /* 3) draw region's strings */
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.lineWidth = 0.8;
    ctx.font = `${REG_STRING_HEIGHT}px sans-serif`;
    // non-selected labels's region strings
    ctx.fillStyle = this.props.stringNormalColor;
    ctx.strokeStyle = this.props.lineNormalColor;
    for (const label of this.mystate.labelSet) {
      if (!label.selected) {
        for (const reg of label.regions) {
          const pos = reg.stringPosition;
          ctx.fillText(reg.string, pos.x * cvwidth, pos.y * cvheight);
          ctx.strokeText(reg.string, pos.x * cvwidth, pos.y * cvheight);
        }
      }
    }
    // selected labels's region strings
    ctx.fillStyle = this.props.stringHighlightColor;
    ctx.strokeStyle = this.props.lineHighlightColor;
    for (const label of this.mystate.labelSet) {
      if (label.selected) {
        for (const reg of label.regions) {
          const pos = reg.stringPosition;
          ctx.fillText(reg.string, pos.x * cvwidth, pos.y * cvheight);
          ctx.strokeText(reg.string, pos.x * cvwidth, pos.y * cvheight);
        }
      }
    }
  }

  /** render the scene onto the canvas (WRITEANSWER MODE)*/
  renderScene_WriteAnswerMode() {
    if (!this.mystate.showLabels || this.mystate.componentUnmounted ||
      !this.mystate.renderingTimerRunning) return;

    requestAnimationFrame(this.renderScene);
    const canvas = this.refs.labelCanvas;
    const cvwidth = canvas.width;
    const cvheight = canvas.height;
    const ctx = canvas.getContext('2d');
    /* 1) clear label canvas */
    ctx.clearRect(0, 0, cvwidth, cvheight);
    /* 2) draw regions */
    this.drawRegions(ctx, cvwidth, cvheight);
    /* 3) draw lines */
    this.drawLines(ctx, cvwidth, cvheight);;
    /* 4) draw region's strings */
    this.drawRegionStrings(ctx, cvwidth, cvheight);
  }


  drawRegions(ctx, cvwidth, cvheight) {
    // normal regions
    ctx.fillStyle = this.props.regionNormalColor;
    ctx.strokeStyle = this.props.lineNormalColor;
    ctx.lineWidth = 1.2;
    for (const label of this.mystate.labelSet) {
      if (label === this.mystate.selectedLabel) continue;
      for (const reg of label.regions) {
        drawRegion(ctx, reg, cvwidth, cvheight);
      }
    }
    // temporary label's region
    if (this.mystate.draggingTempLabel) {
      drawRegion(ctx, this.mystate.temporaryLabel.region, cvwidth, cvheight);
    }
    // selected label's regions
    if (this.mystate.selectedLabel) {
      ctx.fillStyle = this.props.regionHighlightColor;
      ctx.strokeStyle = this.props.lineHighlightColor;
      for (const reg of this.mystate.selectedLabel.regions) {
        drawRegion(ctx, reg, cvwidth, cvheight);
      }
    }
  }

  drawLines(ctx, cvwidth, cvheight) {
    // normal lines
    ctx.strokeStyle = this.props.lineNormalColor;
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
      ctx.strokeStyle = this.props.lineHighlightColor;
      const label = this.mystate.selectedLabel;
      for (const reg of label.regions) {
        Utils2D.drawLine(ctx, reg.x * cvwidth, reg.y * cvheight,
          label.x * cvwidth, label.y * cvheight);
      }
    }
  }

  drawTemporaryPoints(ctx, cvwidth, cvheight) {
    if (this.mystate.draggingFirstTempPoint || this.mystate.draggingNextTempPoint) {
      ctx.fillStyle = this.props.regionNormalColor;
      ctx.strokeStyle = this.props.lineNormalColor;
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
  }

  drawDeleteIcons(ctx, cvwidth, cvheight) {
    if (this.mystate.selectedLabel) {
      // debugger
      for (const reg of this.mystate.selectedLabel.regions) {
        const pos = reg.deleteIconPosition;
        Utils2D.drawDeleteIcon(ctx, pos.x * cvwidth, pos.y * cvheight,
          DELETE_ICON_WIDTH, DELETE_ICON_HEIGHT);
      }
    }
  }

  drawRegionStrings(ctx, cvwidth, cvheight) {
    if (this.mystate.labelSet.size > 0) {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.lineWidth = 0.8;
      ctx.fillStyle = this.props.stringNormalColor;
      ctx.strokeStyle = this.props.lineNormalColor;
      ctx.font = `${REG_STRING_HEIGHT}px sans-serif`;
      for (const label of this.mystate.labelSet) {
        for (const reg of label.regions) {
          const pos = reg.stringPosition;
          if (reg === this.mystate.regionWithSelectedString) {
            ctx.fillStyle = this.props.stringFocusColor;
            ctx.fillText(reg.string, pos.x * cvwidth, pos.y * cvheight);
            ctx.strokeText(reg.string, pos.x * cvwidth, pos.y * cvheight);
            ctx.fillStyle = this.props.stringNormalColor;
          } else if (label === this.mystate.selectedLabel) {
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
    this.mystate.renderingTimerRunning = true;
    this.renderScene();
    setTimeout(() => {
      this.mystate.renderingTimerRunning = false;
    }, milliseconds);
  }

  onSelectedLabelTextChanged(e) {
    // debugger
    this.mystate.selectedLabel.text = e.target.value;
    this.mystate.selectedLabelTextDirty = true;
  }

  onSelectedLabelKeyDown(e) {
    if (e.keyCode === 13) this.unselectSelectedLabel();
  }

  getOnCloseCallback(label) {
    return () => this.removeLabel(label);
  }

  getOnMinimizeCallback(label) {
    return () => {
      if (label === this.mystate.selectedLabel) this.unselectSelectedLabel();
      label.minimized = true;
      this.renderForAWhile();
      this.forceUpdate();
    };
  }

  onHiddenInputTextChanged() {
    const reg = this.mystate.regionWithSelectedString;
    const hiddenInput = this.refs.hiddenInput;
    if (reg) {
      const val = hiddenInput.value;
      reg.string = val;
      reg.stringPosition = this.getRegionStringPosition(reg);
      this.mystate.selectedRegionStringDirty = true;
      this.renderForAWhile();
    }
  }

  onHiddenInputKeyDown(e) {
    if (e.keyCode === 13) {
      if (this.mystate.selectedRegionStringDirty) {
        this.mystate.selectedRegionStringDirty = false;
        const reg = this.mystate.regionWithSelectedString;
        if (!reg.string) reg.string = this.getNextRegionString();
        this.props.labelsChangedCallback(this.exportLabelsToJSON());
      }
      this.mystate.regionWithSelectedString = null;
      e.target.blur();
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

  /* =============== */
  /*  API FUNCTIONS  */
  /* =============== */

  minimizeAllLabels() {
    if (!this.mystate.showLabels || this.mystate.mode === REGIONSONLY || this.mystate.mode === MULTISELECT) return;
    this.unselectSelectedLabel();
    for (const label of this.mystate.labelSet) label.minimized = true;
    this.renderForAWhile();
    this.forceUpdate();
  }

  maximizeAllLabels() {
    if (!this.mystate.showLabels || this.mystate.mode === REGIONSONLY || this.mystate.mode === MULTISELECT) return;
    for (const label of this.mystate.labelSet) label.minimized = false;
    this.renderForAWhile();
    this.forceUpdate(this.refreshAllLabelsPositions);
  }

  /* for MULTISELECT mode */
  updateSelectedLabels(selectedIds) {
    for (const label of this.mystate.labelSet) label.selected = false;
    for(const id of selectedIds) {
      const label = this.mystate.id2labelMap[id];
      if (label) label.selected = true;
      else console.warn(`WARNING: id = ${id} not found in id2labelMap`);
    }
    this.renderForAWhile(0);
  }

  /* for MULTISELECT mode */
  updateLabelAnswers(answers) {
    for (const ans of answers) {
      const label = this.mystate.id2labelMap[ans.id];
      if (label) {
        label.text = ans.text;
        if (!label.minimized) {
          const input = document.getElementById(getLabelFocusId(label.id));
          if (input) input.value = label.text;
        }
      }
      else console.warn(`No label with id = ${id} was found`);
    }
  }

  /** React's render function */
  render() {
    let dynamicElements = [];
    if (this.mystate.showLabels) {
      switch (this.mystate.mode) {
        case EDITION: {
          // temporary label
          if (this.mystate.temporaryLabel) {
            dynamicElements.push(this.props.renderLabel({
              mode: READONLY,
              label: this.mystate.temporaryLabel,
              ref: TEMPORARY_LABEL_REF,
              key: TEMPORARY_LABEL_REF,
              style: { position: 'absolute', opacity: 0.5 },
            }));
          }
          // existing labels
          for (const label of this.mystate.labelSet) {
            if (label.minimized) continue; // skip if minimized
            dynamicElements.push(
              this.props.renderLabel({
                mode: EDITION,
                label,
                ref: getLabelRef(label.id),
                key: getLabelRef(label.id),
                focusId: getLabelFocusId(label.id),
                style: { position: 'absolute' },
                onTextChanged: this.onSelectedLabelTextChanged,
                onKeyDown: this.onSelectedLabelKeyDown,
                onClose: this.getOnCloseCallback(label),
                onMinimize: this.getOnMinimizeCallback(label),
              })
            );
          }
          break;
        }
        case WRITEANSWER: {
          for (const label of this.mystate.labelSet) {
            if (label.minimized) continue; // skip if minimized
            dynamicElements.push(
              this.props.renderLabel({
                mode: WRITEANSWER,
                label,
                ref: getLabelRef(label.id),
                key: getLabelRef(label.id),
                focusId: getLabelFocusId(label.id),
                style: { position: 'absolute' },
                onTextChanged: this.onSelectedLabelTextChanged,
                onKeyDown: this.onSelectedLabelKeyDown,
                onMinimize: this.getOnMinimizeCallback(label),
              })
            );
          }
          break;
        }
        case READONLY: {
          // existing labels
          for (const label of this.mystate.labelSet) {
            if (label.minimized) continue; // skip if minimized
            dynamicElements.push(
              this.props.renderLabel({
                isReadOnly: true,
                label,
                ref: getLabelRef(label.id),
                key: getLabelRef(label.id),
                style: { position: 'absolute' },
                onMinimize: this.getOnMinimizeCallback(label),
              })
            );
          }
          break;
        }
        default: break;
      }
    }

    return (
      <div style={this.props.style}>
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

ImageWithLabels.propTypes = {
  /* ===========================*/
  /* 1) props for for ALL modes */
  /* ===========================*/

  /* --- props to read from (INPUT) ---- */
  // style for root div
  style: React.PropTypes.object,
  // mode options: EDITION, READONLY, MULTISELECT, WRITEANSWER
  mode: React.PropTypes.string.isRequired, // <------------ REQUIRED
  // props to load an image with its labels
  source: React.PropTypes.object, // { file } or { url }
  labels: React.PropTypes.array, // json array
  circleRadius: React.PropTypes.number, // float
  // dimension ranges for image's width and height
  maxWidth: React.PropTypes.number,
  maxHeight: React.PropTypes.number,
  minWidth: React.PropTypes.number,
  minHeight: React.PropTypes.number,
  // resolution limits for image
  maxResolutionX: React.PropTypes.number,
  maxResolutionY: React.PropTypes.number,
  // how to render a label
  renderLabel: React.PropTypes.func.isRequired, // <------- REQUIRED
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

  /* ==========================*/
  /* 2) props for EDITION mode */
  /* ==========================*/

  /* --- callback props to notify parent about changes (OUTPUT) --- */
  labelsChangedCallback: React.PropTypes.func,
  gotFocusCallback: React.PropTypes.func,
  lostFocusCallback: React.PropTypes.func,

  /* ==============================*/
  /* 3) props for MULTISELECT mode */
  /* ==============================*/

  /* --- callback props to notify parent about changes (OUTPUT) --- */
  labelSelectedCallback: React.PropTypes.func,
  labelUnselectedCallback: React.PropTypes.func,

  /* ==============================*/
  /* 4) props for WRITEANSWER mode */
  /* ==============================*/

  /* --- callback props to notify parent about changes (OUTPUT) --- */
  labelAnswerChangedCallback: React.PropTypes.func,
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

function isAncestorOf(ancestor, elem) {
  let el = elem;
  while (el) {
    if (el === ancestor) return true;
    el = el.parentElement;
  }
  return false;
}

function drawRegion(ctx, reg, cvwidth, cvheight) {
  if (reg.type === POLYGON_TYPE) {
    Utils2D.drawPolygon(ctx, reg.points, cvwidth, cvheight);
  } else { // CIRCLE_TYPE
    Utils2D.drawEllipse(ctx, reg.x * cvwidth, reg.y * cvheight,
      reg.rx * cvwidth, reg.ry * cvheight);
  }
}
