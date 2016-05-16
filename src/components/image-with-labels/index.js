import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import Utils2D from '../../_2Dlibrary/Utils2D';

const LEFT_BUTTON = 0;
const RIGHT_BUTTON = 1;

const GREEN = 'rgba(0,255,0,0.35)';
const BLACK = '#000000';
const YELLOW = 'rgba(255,255,0,0.65)';
const RED = 'rgb(255,0,0)';

const TEMP_CIRCLE_STYLE = {
  fillColor: GREEN,
  strokeColor: BLACK,
  lineWidth: 2,
};

const TMP_CIRCLE_RADIUS = 4;
const DEFAULT_CIRCLE_RADIUS = 12;
const AREA_THRESHOLD = 50;
const POLYGON_TYPE = 'POLYGON';
const ELLIPSE_TYPE = 'ELLIPSE';

const DEFAULT_INPUT_VALUE = 'write something ...';
const TEMPORARY_INPUT_VALUE = 'temporary label';

export default class TemplateComponent extends Component {

  static get defaultProps() {
    return {
      remoteUrl: 'https://lopezjuri.com/videos/M_10___Default1.jpg',
      maxWidth: 500,
      maxHeight: 400,
      minWidth: 300,
      minHeight: 300,
      canEdit: true,
      labelsChangedCallback: (labels) => console.log(labels),
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      hasSelectedLabel: false,
    };

    this.mystate = {
      // variables for rendering
      renderingTimerRunning: false,
      canvasMouseCoords: null,
      backgroundImg: null,
      canvasAux: document.createElement('canvas'),
      regions: [],
      lines: [],
      labelSet: new Set(),
      // variables for dragging existing labels
      draggingExistingLabel: false,
      draggedLabel: null,
      // variables for adding new polygonal regions
      tmpPoints: [],
      draggingTempPoint: false,
      tmpLabel: null,
      draggingTempLabel: false,
      // other variables
      selectedLabel: null,
      selectedLabelTextDirty: false,
      selectedLabelPositionDirty: false,
    };

    this.onFileChanged = this.onFileChanged.bind(this);
    this.renderForAWhile = this.renderForAWhile.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.loadImage = this.loadImage.bind(this);
    this.loadRemoteImage = this.loadRemoteImage.bind(this);
    this.loadLocalImage = this.loadLocalImage.bind(this);
    this.selectLabel = this.selectLabel.bind(this);
    this.unselectSelectedLabel = this.unselectSelectedLabel.bind(this);
    this.refreshLabelInput = this.refreshLabelInput.bind(this);
    this.removeSelectedLabel = this.removeSelectedLabel.bind(this);

    // event handlers
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  componentDidMount() {
    // if remote image provided as prop, load it
    if (this.props.remoteUrl) {
      this.loadRemoteImage(this.props.remoteUrl);
    }
    // add event listeners
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
  }

  componentWillUnmount() {
    // remove event listeners
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  /** load image given in file */
  onFileChanged() {
    const file = this.refs.fileInput.files[0];
    if (file) {
      this.loadLocalImage(file);
    }
  }

  /** handle mouse down event */
  onMouseDown(event) {
    const canvas = this.refs.canvas;
    const canvCoords = Utils2D.getElementMouseCoords(canvas, event);
    const mouseCanvasX = canvCoords.x;
    const mouseCanvasY = canvCoords.y;

    /** left button click */
    if (event.button === LEFT_BUTTON) {
      /** if left click within canvas */
      if (Utils2D.coordsInRectangle(mouseCanvasX, mouseCanvasY,
        0, 0, canvas.width, canvas.height)) {
        const nccoords = Utils2D.getClippedAndNormalizedCoords(canvCoords, canvas);

        /**
         * Conditions so far:
         * 	1) left mouse click
         * 	2) click within canvas
         *
         * What can happen:
         * 	1) Dragging a temporary label
         * 		1.1) intersection with already existing label
         * 			temporary label gets merged into existing label
         * 		1.2) no interesection with labels
         * 			a brand new label gets created out of the temporary label
         *
         * 	2) Dragging a temporary point
         * 		first, ingore if click was on an existing region
         * 		2.1) intersection with a previous temporary point
         * 			- the polygon get closed, points outside loop are ignored,
         * 			a convex hull is generated out of the polygon, if the area
         * 			of the polygon is too small then an ellipse is placed instead
         * 			- dragging is over
         * 		2.2) no intersection
         * 			- a new point is added to the polygon
         * 			- the dragging continuous
         *
         * 	3) No dragging
         * 		3.1) click on label
         * 			- label becomes writable
         * 			- start dragginb label
         * 		3.2) click on canvas
         * 			- first click to start drawing a temporary polygon
         */


         /** Case 1) dragging a temporary label */
         // label is either dropped as a new one or merged into another one
        if (this.mystate.draggingTempLabel) {
          const tmpLabel = this.mystate.tmpLabel;

          const label = this.getIntersectedLabel(mouseCanvasX, mouseCanvasY);
          /** case 1.1) intersection with label */
          if (label) {
            label.regions.add(tmpLabel.region); // add region into existing label
            this.refs.canvasWrapper.removeChild(tmpLabel.input);
            this.selectLabel(label);

          /** case 1.2) no intersection with other labels */
          } else {
            // create a brand new label
            const regions = new Set();
            regions.add(tmpLabel.region);
            const newLabel = { x: tmpLabel.x, y: tmpLabel.y,
              input: tmpLabel.input, regions };
            this.mystate.labelSet.add(newLabel); // add label to set
            this.selectLabel(newLabel);
            // set input's event handlers
            const input = newLabel.input;
            input.onkeydown = (e) => {
              if (e.keyCode === 13) { // enter
                this.unselectSelectedLabel();
                this.renderForAWhile(0);
              } else {
                const lastvalue = input.value;
                setTimeout(() => {
                  if (input.value !== lastvalue) {
                    this.mystate.selectedLabelTextDirty = true;
                    if (input.value === '') {
                      input.value = DEFAULT_INPUT_VALUE;
                      this.refreshLabelInput(newLabel, true);
                    } else {
                      this.refreshLabelInput(newLabel);
                    }
                  }
                }, 0);
              }
            };
            input.onblur = () => {
              if (this.mystate.selectedLabelTextDirty) {
                if (this.props.labelsChangedCallback) {
                  this.props.labelsChangedCallback(this.exportLabelsToJSON());
                }
                this.mystate.selectedLabelTextDirty = false;
              }
            };
            // set input's message and refresh it
            input.value = DEFAULT_INPUT_VALUE;
            input.style.background = 'rgba(255,255,255,0.8)';
            input.style.color = 'rgb(0,0,0)';
            input.style.borderColor = 'rgb(0,0,0)';
            input.style.fontStyle = 'normal';
            this.refreshLabelInput(newLabel, true); // refresh and select text
          }
          // end dragging
          this.mystate.draggingTempLabel = false;
          this.mystate.tmpLabel = null;
          // notify parent of changes in labels
          if (this.props.labelsChangedCallback) {
            this.props.labelsChangedCallback(this.exportLabelsToJSON());
          }

        /** case 2) dragging a temporary point */
        } else if (this.mystate.draggingTempPoint) {
          // make sure that we don't drop points on already existing regions
          if (!this.getIntersectedRegionAndLabel(nccoords.x, nccoords.y)) {
            // check intersection against dropped points
            let intersected = false;
            const tmpPts = this.mystate.tmpPoints;
            for (let i = 0; i < tmpPts.length - 1; ++i) {
              const p = tmpPts[i];
              if (Utils2D.circlesIntersect(p.x * canvas.width, p.y * canvas.height,
                TMP_CIRCLE_RADIUS, nccoords.x * canvas.width, nccoords.y * canvas.height,
                TMP_CIRCLE_RADIUS)) {
                /** case 2.1) previous point intersected */
                // get convex hull
                const points = Utils2D.getConvexHull(tmpPts.slice(i, -1));
                // get its area
                const area = Utils2D.getAreaOfPolygon(points) * canvas.width * canvas.height;
                // get its centroid
                const centroid = Utils2D.getCentroidOfPolygon(points);

                let newRegion;
                /** if area above threshold, we create the polygon */
                if (area > AREA_THRESHOLD) {
                  newRegion = { type: POLYGON_TYPE, points, x: centroid.x, y: centroid.y };
                  this.mystate.regions.push(newRegion);
                /** otherwise, it's too small so we create an ellipse instead */
                } else {
                  const { x, y } = centroid || nccoords;
                  newRegion = {
                    type: ELLIPSE_TYPE, x, y,
                    rx: DEFAULT_CIRCLE_RADIUS / canvas.width,
                    ry: DEFAULT_CIRCLE_RADIUS / canvas.height,
                  };
                  this.mystate.regions.push(newRegion);
                }

                /** create a temporary label */
                // create input
                const input = document.createElement('input');
                input.type = 'text';
                input.value = TEMPORARY_INPUT_VALUE;
                input.size = input.value.length;
                input.style.position = 'absolute';
                input.style.background = 'rgba(255,255,255,0.3)';
                input.style.color = 'rgba(0,0,0,0.3)';
                input.style.borderColor = 'rgba(0,0,0,0.3)';
                input.style.padding = '5px';
                input.style.fontStyle = 'italic';
                input.readOnly = true;
                this.refs.canvasWrapper.appendChild(input);
                input.style.left = `${mouseCanvasX - input.offsetWidth * 0.5}px`;
                input.style.top = `${mouseCanvasY - input.offsetHeight * 0.5}px`;
                // tmp label
                this.mystate.tmpLabel = { input, x: nccoords.x, y: nccoords.y, region: newRegion };
                this.mystate.draggingTempLabel = true;

                /**  stop dragging temporary point */
                tmpPts.length = 0; // clear array
                this.mystate.draggingTempPoint = false;

                // end loop
                intersected = true;
                break;
              }
            }
            /** case 2.2) no intersection -> add a new point */
            if (!intersected) {
              this.mystate.tmpPoints.push({ x: nccoords.x, y: nccoords.y });
            }
          }

        /** case 3) Nothing being dragged */
        } else {
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

            /** case 3.2) check if click on region */
            const ans = this.getIntersectedRegionAndLabel(nccoords.x, nccoords.y);
            if (ans) {
              const prevLabel = this.mystate.selectedLabel;
              /** label already selected, remove the clicked region */
              if (prevLabel === ans.label) {
                // remove region from label
                prevLabel.regions.delete(ans.region);
                // if label runs out of regions, remove it as well
                if (prevLabel.regions.size === 0) {
                  // remove whole label
                  this.removeSelectedLabel();
                } else if (this.props.labelsChangedCallback) {
                  // notify parent of changes in labels
                  this.props.labelsChangedCallback(this.exportLabelsToJSON());
                }
              /** label being selected for the first time */
              } else {
                this.selectLabel(ans.label); // select the label
              }
              break; // pseudo GOTO
            }

            /** case 3.3)  DEFAULT: click on canvas */
            // we drop the first 2 points of the temporary polygon
            this.mystate.tmpPoints.push({ x: nccoords.x, y: nccoords.y });
            this.mystate.tmpPoints.push({ x: nccoords.x, y: nccoords.y });
            // start dragging the last point
            this.mystate.draggingTempPoint = true;
            // if a label was selected, it becomes unselected
            this.unselectSelectedLabel();
            break; // pseudo GOTO
          }
        }

        // refresh scene
        this.renderForAWhile(0);
      }
    }
  }

  onMouseMove(e) {
    // get mouse coordinates relative to canvas
    const canvas = this.refs.canvas;
    const mcoords = Utils2D.getElementMouseCoords(canvas, e);
    this.mystate.canvasMouseCoords = mcoords; // save into mystate

    if (this.mystate.draggingTempPoint) {
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
      const tmpLabel = this.mystate.tmpLabel;
      const input = tmpLabel.input;
      tmpLabel.x = ncmcoords.x;
      tmpLabel.y = ncmcoords.y;
      input.style.left = `${cmcoords.x - input.offsetWidth * 0.5}px`;
      input.style.top = `${cmcoords.y - input.offsetHeight * 0.5}px`;
      // refresh scene
      this.renderForAWhile();
    } else if (this.mystate.draggingExistingLabel) {
      // update label position
      const ncmcoords = Utils2D.getClippedAndNormalizedCoords(mcoords, canvas);
      const label = this.mystate.draggedLabel;
      const input = label.input;
      const w = input.offsetWidth;
      const h = input.offsetHeight;
      // left
      let left = ncmcoords.x * canvas.width - w * 0.5;
      if (left <= 0) left = 1;
      else if (left + w >= canvas.width) left = canvas.width - w - 1;
      input.style.left = `${left}px`;
      // top
      let top = ncmcoords.y * canvas.height - h * 0.5;
      if (top <= 0) top = 1;
      else if (top + h >= canvas.height) top = canvas.height - h - 1;
      input.style.top = `${top}px`;
      // reset label's coords
      label.x = (left + 0.5 * w) / canvas.width;
      label.y = (top + 0.5 * h) / canvas.height;
      // refresh scene
      this.renderForAWhile();
      // remember label position is dirty
      this.mystate.selectedLabelPositionDirty = true;
    }
  }

  onMouseUp() {
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
    }
  }

  /**
   * get region and its label that intersect the point (x,y)
   * which must be in normalized coordinates
   */
  getIntersectedRegionAndLabel(x, y) {
    for (const label of this.mystate.labelSet) {
      for (const reg of label.regions) {
        if (reg.type === POLYGON_TYPE ?
            Utils2D.coordsInConvexPolygon(x, y, reg.points)
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
      if (Utils2D.coordsInElement(x, y, label.input)) {
        return label;
      }
    }
    return null;
  }

  /** resize and postion label's input according to its value */
  refreshLabelInput(label, selectText) {
    const input = label.input;
    const canvas = this.refs.canvas;
    this.refs.dummy.innerHTML = label.input.value;
    setTimeout(() => {
      const padding = parseFloat(input.style.padding);
      const w = Math.min(this.refs.dummy.offsetWidth + padding + 10, canvas.width - 4);
      const h = input.offsetHeight;
      // left
      let left = label.x * canvas.width - w * 0.5;
      if (left <= 0) left = 1;
      else if (left + w >= canvas.width) left = canvas.width - w - 1;
      label.x = (left + w * 0.5) / canvas.width;
      // top
      let top = label.y * canvas.height - h * 0.5;
      if (top <= 0) top = 1;
      else if (top + h >= canvas.height) top = canvas.height - h - 1;
      label.y = (top + h * 0.5) / canvas.height;
      // update input's style
      input.style.width = `${w}px`;
      input.style.left = `${left}px`;
      input.style.top = `${top}px`;
      if (selectText) {
        input.setSelectionRange(0, input.value.length);
      }
      this.renderForAWhile(0);
    }, 0);
  }

  /** unselect the current selected label */
  unselectSelectedLabel() {
    if (this.mystate.selectedLabel) {
      this.mystate.selectedLabel.input.blur();
      this.mystate.selectedLabel.input.readOnly = true;
      this.mystate.selectedLabel = null;
      this.setState({ hasSelectedLabel: false });
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
  selectLabel(label) {
    if (label === this.mystate.selectLabel) return;
    this.unselectSelectedLabel();
    this.mystate.selectedLabel = label;
    setTimeout(() => {
      label.input.readOnly = false;
      label.input.focus();
    }, 0);
    this.setState({ hasSelectedLabel: true });
  }

  /** remove the current selected label */
  removeSelectedLabel() {
    const label = this.mystate.selectedLabel;
    if (label) {
      this.refs.canvasWrapper.removeChild(label.input);
      this.mystate.labelSet.delete(label);
      this.mystate.selectedLabel = null;
      this.setState({ hasSelectedLabel: false });
      this.renderForAWhile(0);
      // notify parent of changes in labels
      if (this.props.labelsChangedCallback) {
        this.props.labelsChangedCallback(this.exportLabelsToJSON());
      }
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
      labelJSONArray.push({ regions, x: label.x, y: label.y, text: label.input.value });
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
    const canvas = this.refs.canvas;
    const cw = this.refs.canvasWrapper;
    const w = Math.max(img.width * ratio, this.props.minWidth);
    const h = Math.max(img.height * ratio, this.props.minHeight);
    canvas.width = w;
    canvas.height = h;
    canvasAux.width = w;
    canvasAux.height = h;
    cw.style.width = `${w}px`;
    cw.style.height = `${h}px`;
    // draw image into canvasAux
    const ctxAux = canvasAux.getContext('2d');
    ctxAux.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
    // set as background image
    this.mystate.backgroundImg = img;
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
      const canvas = this.refs.canvas;
      const cvwidth = canvas.width;
      const cvheight = canvas.height;
      const ctx = canvas.getContext('2d');

      /** 1) draw background image */
      const canvasAux = this.mystate.canvasAux;
      ctx.drawImage(canvasAux, 0, 0, canvasAux.width, canvasAux.height, 0, 0, cvwidth, cvheight);

      /** 2) draw regions */
      // normal regions
      ctx.fillStyle = GREEN;
      ctx.strokeStyle = BLACK;
      ctx.lineWidth = 2;
      for (const label of this.mystate.labelSet) {
        if (label === this.mystate.selectedLabel) continue;
        for (const reg of label.regions) {
          this.drawRegion(ctx, reg, cvwidth, cvheight);
        }
      }
      // temporary label's region
      if (this.mystate.draggingTempLabel) {
        this.drawRegion(ctx, this.mystate.tmpLabel.region, cvwidth, cvheight);
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
        for (const reg of label.regions) {
          Utils2D.drawLine(ctx, reg.x * cvwidth, reg.y * cvheight,
            label.x * cvwidth, label.y * cvheight);
        }
      }
      // temporary label's line
      if (this.mystate.draggingTempLabel) {
        const label = this.mystate.tmpLabel;
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
      if (this.mystate.draggingTempPoint) {
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

  /** React's render function */
  render() {
    return (
      <div>
        <input ref="fileInput" type="file" onChange={this.onFileChanged}></input>
        <Button
          disabled={!this.state.hasSelectedLabel}
          onClick={this.removeSelectedLabel} bsSize="small"
        >remove label</Button>
        <div ref="canvasWrapper" style={styles.canvasWrapper}>
          <canvas ref="canvas" style={styles.canvas}></canvas>
        </div>
        <div type="text" ref="dummy" style={styles.dummy} contentEditable="true" />
      </div>
    );
  }
}

TemplateComponent.propTypes = {
  remoteUrl: React.PropTypes.string,
  maxWidth: React.PropTypes.number,
  maxHeight: React.PropTypes.number,
  minWidth: React.PropTypes.number,
  minHeight: React.PropTypes.number,
  canEdit: React.PropTypes.bool,
  labelsChangedCallback: React.PropTypes.func,
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
  dummy: {
    position: 'absolute',
    left: '-1000%',
  },
};
