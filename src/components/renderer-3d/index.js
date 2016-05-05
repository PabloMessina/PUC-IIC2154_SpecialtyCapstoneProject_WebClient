import React, { Component } from 'react';
import THREE from 'n3d-threejs';
import MTLLoader from '../../_3Dlibrary/MTLLoader';
import OBJLoader from '../../_3Dlibrary/OBJLoader';
import ThreeUtils from '../../_3Dlibrary/ThreeUtils';

// button constants
const LEFT_BUTTON = 0;
const RIGH_BUTTON = 2;

// colors
const BLACK = 'rgb(0,0,0)';
const YELLOW = 'rgb(255,255,0)';
const GREEN_US = 'rgb(0,168,150)';

const DEFAULT_LABEL_MESSAGE = 'Add name...';

export default class Renderer3D extends Component {

  static get defaultProps() {
    return {
      canEdit: true,
      localFiles: null,
      remoteFiles: null,
      annotations: null,
    };
  }

  constructor(props) {
    super(props);

    this.threeUpdate = this.threeUpdate.bind(this);
    this.threeRender = this.threeRender.bind(this);
    this.threeAnimate = this.threeAnimate.bind(this);
    this.load3DModelFromFiles = this.load3DModelFromFiles.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.animateForAWhile = this.animateForAWhile.bind(this);
    this.highlightLabel = this.highlightLabel.bind(this);
    this.unhighlightLabel = this.unhighlightLabel.bind(this);

    this.refocusOnModel = this.refocusOnModel.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleKeypress = this.handleKeypress.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.updateSpritePlaneOrientations =
      this.updateSpritePlaneOrientations.bind(this);

    // API functions
    this.loadModel = this.loadModel.bind(this);
    this.hideLabes = this.hideLabes.bind(this);
    this.showLabels = this.showLabels.bind(this);
    this.setNormalLabelStyle = this.setNormalLabelStyle.bind(this);
    this.setHighlightedLabelStyle = this.setHighlightedLabelStyle.bind(this);
  }

  componentDidMount() {
    // add event listeners
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keypress', this.handleKeypress);
    window.addEventListener('keydown', this.handleKeydown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);

    // reference to the viewport div
    const viewport = this.refs.viewport;
    const width = viewport.offsetWidth;
    const height = viewport.offsetHeight;

    // set up instance of THREE.WebGLRenderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0xeeeeee, 1);
    viewport.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    // initialize scene
    const scene = new THREE.Scene();

    // ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    // camera light
    const cameraLight = new THREE.PointLight(0xffffff, 1);
    cameraLight.position.set(0, 0, 50);
    scene.add(cameraLight);

    // groups (necessary for labels)
    const spriteGroup = new THREE.Group();
    const spritePlaneGroup = new THREE.Group();
    const lineGroup = new THREE.Group();
    const sphereGroup = new THREE.Group();
    scene.add(spriteGroup);
    scene.add(spritePlaneGroup);
    scene.add(lineGroup);
    scene.add(sphereGroup);

    // initialize camera
    const camera = new THREE.OrthographicCamera(
      width / - 2, width / 2, height / 2, height / - 2, - 500, 1000);
    camera.position.set(0, 0, 50);
    camera.updateProjectionMatrix();

    // initialize raycaster
    const raycaster = new THREE.Raycaster();

    // save inner variables and data structures into "this._state"
    // that we don't want to expose to the client code (that's why _state
    // instead of state)
    this._state = {
      renderer,
      scene,
      camera,
      ambientLight,
      cameraLight,
      meshGroup: null,
      boundingBox: null,
      meshCenter: new THREE.Vector3(),
      meshDiameter: null,
      raycaster,
      // label data
      spriteGroup,
      lineGroup,
      sphereGroup,
      spritePlaneGroup,
      sphereToLabelMap: {},
      sphereToLineMap: {},
      spritePlaneToLabelMap: {},
      annotations: this.props.annotations,
      labelsEnabled: true,
      labelSet: new Set(),
      normalLabelStyle: this.props.normalLabelStyle,
      highlightedLabelStyle: this.props.highlightedLabelStyle,
      // other state data
      zoom: 1,
      updateCameraZoom: false,
      cameraOrbitUpdatePending: false,
      orbitingCamera: false,
      mouseLeft1: { x: null, y: null },
      mouseLeft2: { x: null, y: null },
      mouseViewportCoords: { x: null, y: null },
      updateTimerRunning: false,
      mouseClipping: new THREE.Vector2(),
      selectedLabel: null,
      draggingSelectedLabel: false,
      updatingLabelPosition: false,
      // draggable label vars
      draggingTempLabel: false,
      tempDraggableLabel: null,
      dragLastPosition: new THREE.Vector3(),
      dragPlane: { normal: null, position: null },
    };

    // try to load files provided (if any)
    if (this.props.localFiles) {
      // we are receving new files, we must parse them
      const promise = this.load3DModelFromFiles(this.props.localFiles);
      // if we also received annotations, we load the annotations
      if (this.props.annotations) {
        promise.then(() => {
          this.loadAnnotations(this.props.annotations);
        });
      }
      // check for errors
      promise.catch((reason) => { alert(reason); });
    }

    // run animation
    this.animateForAWhile();
  }

  shouldComponentUpdate() {
    // Avoid updates altogether (they are not necessary)
    return false;
  }

  componentWillUnmount() {
    // remove event listeners
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keypress', this.handleKeypress);
    window.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
  }

  // function to update the scene
  threeUpdate() {
    // if no mesh has been set yet, abort updates
    if (this._state.meshGroup === null) return;

    if (this._state.updateCameraZoom) {
      // get viewport's dimensions
      const width = this.refs.viewport.offsetWidth;
      const height = this.refs.viewport.offsetHeight;
      // get mouse's world coords before zoom update
      const mw1 = ThreeUtils.unprojectFromScreenToWorld(
        this._state.mouseViewportCoords.x,
        this._state.mouseViewportCoords.y,
        width, height, this._state.camera
      );
      // update zoom
      this._state.camera.zoom = this._state.zoom;
      this._state.camera.updateProjectionMatrix();
      this._state.updateCameraZoom = false;
      // get mouse's world coords after zoom update
      const mw2 = ThreeUtils.unprojectFromScreenToWorld(
        this._state.mouseViewportCoords.x,
        this._state.mouseViewportCoords.y,
        width, height, this._state.camera
      );
      // get shift vector to update camera's position, light and target
      const shift = mw1.sub(mw2);
      this._state.camera.position.add(shift);
      this._state.cameraLight.position.copy(this._state.camera.position);
      const target = (new THREE.Vector3(0, 0, -1)).applyMatrix4(this._state.camera.matrixWorld);
      target.add(shift);
      this._state.camera.lookAt(target);
    }

    if (this._state.cameraOrbitUpdatePending) {
      // get viewport's dimensions
      const width = this.refs.viewport.offsetWidth;
      const height = this.refs.viewport.offsetHeight;
      // convert previous mouse screen coords into world coords
      const w1 = ThreeUtils.unprojectFromScreenToWorld(
        this._state.mouseLeft1.x,
        this._state.mouseLeft1.y,
        width, height, this._state.camera
      );
      // convert current mouse screen coords into world coords
      const w2 = ThreeUtils.unprojectFromScreenToWorld(
        this._state.mouseLeft2.x,
        this._state.mouseLeft2.y,
        width, height, this._state.camera
      );
      // get diff vectors
      const v01 = (new THREE.Vector3()).subVectors(w1, this._state.meshCenter);
      const v12 = (new THREE.Vector3()).subVectors(w2, w1);

      if (!ThreeUtils.isZero(v01) && !ThreeUtils.isZero(v12)) {
        // compute axis
        const axis = (new THREE.Vector3()).crossVectors(v01, v12);
        axis.normalize();

        // compute angle
        let xx = (this._state.mouseLeft2.x - this._state.mouseLeft1.x);
        xx *= xx;
        let yy = (this._state.mouseLeft2.y - this._state.mouseLeft1.y);
        yy *= yy;
        const angle = 0.003 + Math.min(0.4, (xx + yy) / 100);

        // set quaternion
        const quat = new THREE.Quaternion();
        quat.setFromAxisAngle(axis, angle);

        // rotate camera's position
        this._state.camera.position
          .sub(this._state.meshCenter)
          .applyQuaternion(quat)
          .add(this._state.meshCenter);

        // rotate camera's target
        const target = (new THREE.Vector3(0, 0, -1)).applyMatrix4(this._state.camera.matrixWorld);
        target
          .sub(this._state.meshCenter)
          .applyQuaternion(quat)
          .add(this._state.meshCenter);

        // rotate camera's up
        const up = (new THREE.Vector3(0, 1, 0)).applyMatrix4(this._state.camera.matrixWorld);
        up.sub(this._state.meshCenter)
        .applyQuaternion(quat)
        .add(this._state.meshCenter)
        .sub(this._state.camera.position);

        this._state.camera.up.copy(up);
        this._state.camera.lookAt(target);

        // update camera's light's position
        this._state.cameraLight.position.copy(this._state.camera.position);

        // update orientation of sprite planes
        this.updateSpritePlaneOrientations();
      }

      this._state.mouseLeft1.x = this._state.mouseLeft2.x;
      this._state.mouseLeft1.y = this._state.mouseLeft2.y;
      this._state.cameraOrbitUpdatePending = false;
    }
  }

  /**
   * [threeRender : renders the scene]
   */
  threeRender() {
    const renderer = this._state.renderer;
    const camera = this._state.camera;
    // render scene
    renderer.render(this._state.scene, camera);
  }

  /**
   * [threeAnimate : updates and renders the scene]
   */
  threeAnimate() {
    if (this._state.updateTimerRunning) {
      requestAnimationFrame(this.threeAnimate);
      this.threeUpdate();
      this.threeRender();
    }
  }

  /**
   * [load3DModelFromFiles : Reads the files that are expected to contain all the information
   * necessary to render a 3D Model, and then renders that model.
   * It expects to receive 1 OBJ file, 1 MTL file and 0 or more image files (jpg, png, etc.)]
   * @param  {[array of File]} files [an array of the expected files, according to
   * https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications]
   * @return {[Promise]}       [a promise wrapping all the asynchronous actions performed]
   */
  load3DModelFromFiles(files) {
    // files we expect to read
    let objFile = null;
    let mtlFile = null;
    const texturePaths = {};
    // fixed extensions
    const objExt = '.obj';
    const mtlExt = '.mtl';

    // ------------------------------------------------
    // iterate through files and select them according
    // to their file extension
    for (let i = 0; i < files.length; ++i) {
      const file = files.item(i);
      const fname = file.name;
      console.log("file ", i, " = ",file);

      if (fname.length > objExt.length &&
        fname.substr(fname.length - objExt.length, fname.length)
        .toLowerCase() === objExt) {
        objFile = file; // obj file
      } else if (fname.length > mtlExt.length &&
        fname.substr(fname.length - mtlExt.length, fname.length)
        .toLowerCase() === mtlExt) {
        mtlFile = file; // mtl file
      } else {
        // save path to texture image file
        texturePaths[fname] = window.URL.createObjectURL(file);
      }
    }

    // ---------------------------------
    // parse MTL and OBJ files
    // ---------------------------------
    if (mtlFile === null) { // check mtl file was provided
      return Promise.reject('mtl file not found');
    }
    if (objFile === null) { // check obj file was provided
      return Promise.reject('mtl file not found');
    }
    // use MTLLoader to load materials from MTL file
    return MTLLoader.loadMaterials(mtlFile, texturePaths)
    .then((materials) => {
      console.log("-----------------------");
      console.log("success: materials = ", materials);
      // on success, proceed to use the OBJLoader to load the 3D objects
      // from OBJ file
      return OBJLoader.loadObjects(objFile, materials);
    })
    .then((meshGroup) => {
      // on success, proceed to incorporte the meshes into the scene
      // and render them
      console.log("----------------------");
      console.log("success: meshGroup = ", meshGroup);
      // compute bounding box
      this._state.boundingBox = ThreeUtils.getMeshesBoundingBox(meshGroup.children);
      // compute the center
      this._state.meshCenter
        .copy(this._state.boundingBox.min)
        .add(this._state.boundingBox.max)
        .multiplyScalar(0.5);
      // compute the mesh diameter
      this._state.meshDiameter =
        this._state.boundingBox.min.distanceTo(this._state.boundingBox.max);
      // center the camera on boundingBox
      ThreeUtils.centerCameraOnBoundingBox(
        this._state.camera,
        this._state.cameraLight,
        this._state.boundingBox,
        this.refs.viewport.offsetWidth,
        this.refs.viewport.offsetHeight
      );
      this._state.zoom = this._state.camera.zoom; // keep the zoom up to date

      // remove from scene the previous meshes, lines,
      // spheres, sprites, labels, if any
      if (this._state.meshGroup !== null) {
        this._state.meshGroup.children.length = 0;
        this._state.scene.remove(this._state.meshGroup);
      }
      this._state.lineGroup.children.length = 0;
      this._state.spriteGroup.children.length = 0;
      this._state.sphereGroup.children.length = 0;
      this._state.labelSet.clear();
      this.props.labelCountChanged(this._state.labelSet.size); // notify parent
      // set the new meshGroup
      this._state.meshGroup = meshGroup;
      // add to scene
      this._state.scene.add(meshGroup);

      // run animation cycle to reflect changes on the screen
      this.animateForAWhile();
    })
    .catch((error) => {
      console.log("===> MTLLoader promise chain: error = ", error);
    });
  }

  loadAnnotations(annotations) {
    if (!annotations) return; // make sure annotations is defined

    // clear previous spheres, lines and sprites
    this._state.lineGroup.children.length = 0;
    this._state.spriteGroup.children.length = 0;
    this._state.sphereGroup.children.length = 0;

    // render new annotaitons
    // TODO: implement this
  }

  // ======================================================

  // ==============
  // API FUNCTIONS
  // ==============

  /**
   * [loadModel : load model from local files]
   * @param  {[type]} files       [description]
   * @param  {[type]} annotations [description]
   * @return {[type]}             [description]
   */
  loadModel(files, annotations) {
    this.load3DModelFromFiles(files)
    .then(() => {
      this.loadAnnotations(annotations);
    });
  }

  /**
   * [refocusOnModel : center camera on model]
   */
  refocusOnModel() {
    if (this._state.meshGroup !== null) {
      ThreeUtils.centerCameraOnBoundingBox(
        this._state.camera,
        this._state.cameraLight,
        this._state.boundingBox,
        this.refs.viewport.offsetWidth,
        this.refs.viewport.offsetHeight
      );
      this._state.zoom = this._state.camera.zoom; // keep the zoom up to date
      this.animateForAWhile();
    }
  }

  /**
   * Starts the update and render (animation) cycle for @milliseconds milliseconds
   * The purpose is to ensure that updates and rendering are performed
   * only when it's necessary, and not all the time
   */
  animateForAWhile(milliseconds = 500) {
    if (this._state.updateTimerRunning) return; // already running? ignore
    this._state.updateTimerRunning = true;
    // start the animation cycle
    this.threeAnimate();
    // start timer to stop the animation cycle when time is over
    setTimeout(() => {
      this._state.updateTimerRunning = false;
    }, milliseconds);
  }

  /**
   * Handle wheel events
   */
  handleWheel(event) {
    event.preventDefault();
    if (event.deltaY < 0) { // zoom in
      this._state.zoom *= 1.05;
    } else { // zoom out
      this._state.zoom *= 0.95;
      if (this._state.zoom < 0.01) this._state.zoom = 0.01;
    }
    this._state.updateCameraZoom = true;
    this.animateForAWhile();
  }

  /**
   * [sets the new style for normal labels and
   * refreshes the scene]
   */
  setNormalLabelStyle(style) {
    this._state.normalLabelStyle = style;
    if (this._state.labelSet.size > 0) {
      for (const label of this._state.labelSet) {
        if (label === this._state.selectedLabel) continue;
        this.unhighlightLabel(label);
      }
      this.animateForAWhile();
    }
  }

  /**
   * [sets the new style for highlighted labels and
   * refreshes the scene]
   */
  setHighlightedLabelStyle(style) {
    this._state.highlightedLabelStyle = style;
    if (this._state.selectedLabel) {
      this.highlightLabel(this._state.selectedLabel);
      this.animateForAWhile();
    }
  }

  /**
   * Handle mouse down events
   */
  handleMouseDown(event) {
    console.log("====> handleMouseDown()");

    const viewport = this.refs.viewport;
    const screenX = event.pageX - viewport.offsetLeft;
    const screenY = viewport.offsetHeight + viewport.offsetTop - event.pageY;

    if (event.button === LEFT_BUTTON) {
      if (this._state.meshGroup !== null && !this._state.draggingTempLabel) {
        /**
         * Conditions:
         * 	  1) there is 3D Model already loaded
         *    2) we are not dragging a temporal label (transparent label)
         *
         * What can happen:
         * 	  1) left click on spritePlane
         * 	  	-> selects/highlight the label
         * 	  	-> unselect/unhighlight previously selected label (if any)
         * 	  	-> starts dragging this label
         * 	  2) left click on sphere
         * 	  	2.1) if the sphere belongs to a highlighted label
         * 	  		-> remove the sphere and the line
         * 	  		if the label runs out of spheres
         * 	  			-> remove the label too
         * 	    2.2) else
         * 	    	highlight the label
         * 	  3) left click on any other part of the canvas
         * 	  	-> we are initiating a camera orbit around the 3D Model
         **/

        // we check if the click interacts we existing labels only
        // if they are enabled, otherwise the default behaviour
        // is to start orbiting the camera
        let shouldOrbit = true;
        if (this._state.labelsEnabled) {
          const splanes = this._state.spritePlaneGroup.children;
          // make sprite planes visible for intersection
          for (let i = 0; i < splanes.length; ++i) splanes[i].visible = true;
          // check intersection with sprite planes, spheres and meshes
          const intrs = ThreeUtils.getClosestIntersectedObject(
            screenX, screenY, viewport.offsetWidth, viewport.offsetHeight,
            this._state.raycaster, this._state.camera,
            this._state.sphereGroup,
            this._state.meshGroup,
            this._state.spritePlaneGroup
          );
          // make sprite planes invisible again
          for (let i = 0; i < splanes.length; ++i) splanes[i].visible = false;

          if (intrs) {
            const pickedObj = intrs.object;
            const pickedGroup = intrs.group;
            const prevLabel = this._state.selectedLabel;

            // case 1) sprite plane intersected
            if (pickedGroup === this._state.spritePlaneGroup) {
              // highlight label (if not already)
              const label = this._state.spritePlaneToLabelMap[pickedObj.object.uuid];
              if (label !== prevLabel) {
                if (prevLabel) this.unhighlightLabel(prevLabel);
                this.highlightLabel(label);
                this._state.selectedLabel = label;
              }
              // starts dragging label
              this._state.draggingSelectedLabel = true;
              // plane paramters where dragging will happen
              this._state.dragPlane.normal =
                ThreeUtils.getCameraForwardNormal(this._state.camera);
              this._state.dragPlane.position = label.sprite.position;
              // no orbits
              shouldOrbit = false;

            // case 2) sphere intersected
            } else if (pickedGroup === this._state.sphereGroup) {
              const sphere = pickedObj.object;
              const label = this._state.sphereToLabelMap[sphere.uuid];

              // case 2.1) sphere belongs to already selected label
              if (label === prevLabel) {
                // remove line
                const line = this._state.sphereToLineMap[sphere.uuid];
                this._state.lineGroup.remove(line); // from scene
                label.lines.delete(line); // from label
                // remove sphere
                this._state.sphereGroup.remove(sphere); // from scene
                label.spheres.delete(sphere); // from label
                delete this._state.sphereToLineMap[sphere.uuid]; // from maps
                delete this._state.sphereToLabelMap[sphere.uuid];
                // ----
                // if label runs out of spheres, delete label as well
                if (label.spheres.size === 0) {
                  this._state.spritePlaneGroup.remove(label.spritePlane);
                  this._state.spriteGroup.remove(label.sprite);
                  this._state.selectedLabel = null;
                  this._state.labelSet.delete(label);
                  // notify parent of changes
                  this.props.labelCountChanged(this._state.labelSet.size);
                }

              // case 2.2) a different label selected
              } else {
                if (prevLabel) this.unhighlightLabel(prevLabel);
                this.highlightLabel(label);
                this._state.selectedLabel = label;
              }
              shouldOrbit = false;
            }
          }
        }
        if (shouldOrbit) {
          // initiate a camera orbit around 3D Model
          this._state.orbitingCamera = true;
          this._state.mouseLeft1.x = event.pageX - viewport.offsetLeft;
          this._state.mouseLeft1.y = viewport.offsetHeight + viewport.offsetTop - event.pageY;
        }
        // refresh canvas
        this.animateForAWhile();
      }
    } else if (event.button === RIGH_BUTTON) {
      if (this._state.meshGroup !== null && this._state.labelsEnabled) {
        /**
         * Conditions:
         * 	1) there is a 3D Model already loaded
         * 	2) labels are enabled
         *
         * What can happen:
         *  1) first right click on model:
         *  	an initial sphere is dropped in intersection point,
         *  	and a temporal, transparent label will start following the mouse cursor
         *  2) second right click (a temporal label already being dragged)
         *  	2.1) intersection with an already existing label
         *  		the new sphere and line get merged into the existing label
         *  	2.2) no intersection with existing labels
         *  		a new label gets created
         *  	In both cases the dragging cycle finishes
         **/

        // -----------------
        // set up raycaster
        this._state.mouseClipping.x = (screenX / viewport.offsetWidth) * 2 - 1;
        this._state.mouseClipping.y = (screenY / viewport.offsetHeight) * 2 - 1;
        this._state.raycaster.setFromCamera(this._state.mouseClipping, this._state.camera);
        // --------------------------------------------
        // intersect against meshes, spheres and sprite planes
        const splanes = this._state.spritePlaneGroup.children;
        // make sprite planes visible for intersection
        for (let i = 0; i < splanes.length; ++i) splanes[i].visible = true;
        // check intersection with sprite planes, spheres and meshes
        const intrs = ThreeUtils.getClosestIntersectedObject(
          screenX, screenY, viewport.offsetWidth, viewport.offsetHeight,
          this._state.raycaster, this._state.camera,
          this._state.sphereGroup, this._state.meshGroup, this._state.spritePlaneGroup
        );
        // make sprite planes invisible again
        for (let i = 0; i < splanes.length; ++i) splanes[i].visible = false;

        // --------------------------------------------
        // case 2) already dragging a temporal label
        if (this._state.draggingTempLabel) {
          const dragLabel = this._state.tempDraggableLabel;
          // auxiliar pointer
          let labelToHighlight;
          // ----------------------------------------
          // case 2.1) existing label intersected:
          // temp label gets merged into it
          if (intrs && intrs.group === this._state.spritePlaneGroup) {
            // -----
            const splane = intrs.object.object; // intesected plane
            // we get label from plane
            const intrsLabel = this._state.spritePlaneToLabelMap[splane.uuid];
            // add sphere and line into intersected label
            intrsLabel.spheres.add(dragLabel.sphere);
            intrsLabel.lines.add(dragLabel.line);
            // match sphere with the intersected label and line
            this._state.sphereToLabelMap[dragLabel.sphere.uuid] = intrsLabel;
            this._state.sphereToLineMap[dragLabel.sphere.uuid] = dragLabel.line;
            // update line so that it points to the intersected label
            const lineGeo = dragLabel.line.geometry;
            lineGeo.dynamic = true;
            lineGeo.vertices.length = 1;
            lineGeo.vertices.push(intrsLabel.sprite.position);
            lineGeo.verticesNeedUpdate = true;
            // add elements into structures so they show up in scene
            this._state.sphereGroup.add(dragLabel.sphere);
            this._state.lineGroup.add(dragLabel.line);
            // set label to highlight
            labelToHighlight = intrsLabel;

          // -----------------------------------------
          // case 2.2) no existing label intersected:
          // temp label becomes a brand new label
          } else {
            // set up spheres and lines as sets
            const spheres = new Set();
            spheres.add(dragLabel.sphere);
            const lines = new Set();
            lines.add(dragLabel.line);
            // update spritePlane
            dragLabel.spritePlane.position.copy(dragLabel.sprite.position);
            dragLabel.spritePlane.quaternion.copy(this._state.camera.quaternion);
            // create new label object
            const labelObj = {
              text: dragLabel.text, // copy text
              spritePlane: dragLabel.spritePlane, // copy sprite plane
              sprite: dragLabel.sprite, // copy sprite
              spheres, // set of spheres
              lines, // set of lines
            };
            // create matches between elements
            this._state.sphereToLabelMap[dragLabel.sphere.uuid] = labelObj;
            this._state.sphereToLineMap[dragLabel.sphere.uuid] = dragLabel.line;
            this._state.spritePlaneToLabelMap[dragLabel.spritePlane.uuid] = labelObj;
            // add elements into structures so they show up in scene
            this._state.spritePlaneGroup.add(dragLabel.spritePlane);
            this._state.spriteGroup.add(dragLabel.sprite);
            this._state.sphereGroup.add(dragLabel.sphere);
            this._state.lineGroup.add(dragLabel.line);
            // set label to highlight
            labelToHighlight = labelObj;
            // add new label to set
            this._state.labelSet.add(labelObj);
            // and notify parent of changes
            this.props.labelCountChanged(this._state.labelSet.size);
          }
          //----------------------------------------
          // Things that happen for both cases 2.1 and 2.2
          // --------------------------------
          // highlight label
          this.highlightLabel(labelToHighlight);
          this._state.selectedLabel = labelToHighlight;
          // remove dragged elements directly from scene (because they were added
          // directly into scene for temporal dragging purposes)
          this._state.scene.remove(dragLabel.sprite);
          this._state.scene.remove(dragLabel.sphere);
          this._state.scene.remove(dragLabel.line);
          this._state.scene.remove(dragLabel.spritePlane);
          // temporal dragging is over
          this._state.tempDraggableLabel = null;
          this._state.draggingTempLabel = false;
          // refresh scene
          this.animateForAWhile();

        // ------------------------------------------
        // Case 1): we were not dragging anything
        // so this is the first right click to start
        // adding a new label
        } else {
          // if we intersected a mesh
          if (intrs && intrs.group === this._state.meshGroup) {
            // -------------
            // get sphere
            const point = intrs.object.point;
            const radius = this._state.meshDiameter / 100;
            const sphereGeom = new THREE.SphereGeometry(radius, 32, 32);
            const material = new THREE.MeshPhongMaterial({ color: GREEN_US });
            const sphere = new THREE.Mesh(sphereGeom, material);
            sphere.position.copy(point);

            // ---------------------------------------------
            // get temporal, transparent label
            const sprite = ThreeUtils.makeTextSprite(
              DEFAULT_LABEL_MESSAGE,
              0.5, // opacity
              this._state.meshDiameter, // reference size to scale
              this._state.normalLabelStyle // label style
            );
            // get camera's normal pointing forward
            const camForwardN = ThreeUtils.getCameraForwardNormal(this._state.camera);
            // get dir towards camera
            const dir = new THREE.Vector3()
              .copy(camForwardN)
              .multiplyScalar(-1);
            // get dist
            const dist = this._state.meshDiameter / 5;
            // position sprite
            sprite.position
              .copy(point)
              .addScaledVector(dir, dist);

            // save plane's parameters where label was dropped,
            // intended to be used for dragging purposes
            this._state.dragPlane.normal = camForwardN;
            this._state.dragPlane.position = sprite.position;

            // get plane from sprite (for intersection purposes),
            // not the same as the previous one
            const spritePlane = ThreeUtils.createPlaneFromSprite(sprite, this._state.camera);
            spritePlane.visible = false; // should not be visible

            // get line connecting the sphere with the label
            const lineGeo = new THREE.Geometry();
            lineGeo.vertices.push(point);
            lineGeo.vertices.push(sprite.position);
            const lineMat = new THREE.LineBasicMaterial({ color: BLACK, linewidth: 2 });
            const line = new THREE.Line(lineGeo, lineMat);

            // unselect the previously selected label (if any)
            if (this._state.selectedLabel !== null) {
              this.unhighlightLabel(this._state.selectedLabel);
              this._state.selectedLabel = null;
            }

            // add elements into scene
            this._state.scene.add(line);
            this._state.scene.add(sprite);
            this._state.scene.add(sphere);
            this._state.scene.add(spritePlane);

            // remember that we are dragging a temporal label
            const labelObj = { sprite, spritePlane, sphere, line, text: '' };
            this._state.tempDraggableLabel = labelObj;
            this._state.draggingTempLabel = true;

            // refresh scene
            this.animateForAWhile();
          }
        }
      }
    }
  }

  /**
   * Make all sprite planes point towards the camera
   */
  updateSpritePlaneOrientations() {
    const quat = this._state.camera.quaternion;
    this._state.spritePlaneGroup.children.forEach((p) => { p.quaternion.copy(quat); });
  }

  /**
   * [shows label as highlighted]
   */
  highlightLabel(labelObj) {
    this.setLabelStyle(labelObj, YELLOW, YELLOW, {
      text: labelObj.text || DEFAULT_LABEL_MESSAGE,
      worldReferenceSize: this._state.meshDiameter,
      labelStyle: this._state.highlightedLabelStyle,
    });
  }

  /**
   * [shows label as non-highlighted]
   */
  unhighlightLabel(labelObj) {
    this.setLabelStyle(labelObj, GREEN_US, BLACK, {
      text: labelObj.text || DEFAULT_LABEL_MESSAGE,
      worldReferenceSize: this._state.meshDiameter,
      labelStyle: this._state.normalLabelStyle,
    });
  }

  /**
   * [resets the color of the spheres, reset the color the lines and
   * reset the sprite's style settings of the given label object]
   */
  setLabelStyle(labelObj, sphereColor, lineColor, spriteSettings) {
    // change spheres color
    for (const sphere of labelObj.spheres) {
      sphere.material.color.set(sphereColor);
    }
    // change lines color
    for (const line of labelObj.lines) {
      line.material.color.set(lineColor);
    }
    // remove current sprite
    this._state.spriteGroup.remove(labelObj.sprite);
    // create a new sprite
    const newSprite = ThreeUtils.makeTextSprite(
      spriteSettings.text,
      spriteSettings.opacity,
      spriteSettings.worldReferenceSize,
      spriteSettings.labelStyle
    );
    // copy the same position from the old sprite
    newSprite.position.copy(labelObj.sprite.position);
    // replace with new sprite
    this._state.spriteGroup.add(newSprite);
    labelObj.sprite = newSprite;
    // remove old spritePlane
    this._state.spritePlaneGroup.remove(labelObj.spritePlane);
    delete this._state.spritePlaneToLabelMap[labelObj.spritePlane.uuid];
    // replace with new spritePlane
    const newSpritePlane =
      ThreeUtils.createPlaneFromSprite(newSprite, this._state.camera);
    newSpritePlane.visible = false; // make sure it's invisible
    this._state.spritePlaneGroup.add(newSpritePlane);
    this._state.spritePlaneToLabelMap[newSpritePlane.uuid] = labelObj;
    labelObj.spritePlane = newSpritePlane;
  }

  hideLabes() {
    this._state.scene.remove(this._state.sphereGroup);
    this._state.scene.remove(this._state.lineGroup);
    this._state.scene.remove(this._state.spriteGroup);
    this._state.scene.remove(this._state.spritePlaneGroup);
    this._state.labelsEnabled = false;
    this.animateForAWhile();
  }

  showLabels() {
    this._state.scene.add(this._state.sphereGroup);
    this._state.scene.add(this._state.lineGroup);
    this._state.scene.add(this._state.spriteGroup);
    this._state.scene.add(this._state.spritePlaneGroup);
    this._state.labelsEnabled = true;
    this.animateForAWhile();
  }

  /**
   * Handle mouse move events
   */
  handleMouseMove(event) {
    const viewport = this.refs.viewport;
    const screenX = event.pageX - viewport.offsetLeft;
    const screenY = viewport.offsetHeight + viewport.offsetTop - event.pageY;
    this._state.mouseViewportCoords.x = screenX;
    this._state.mouseViewportCoords.y = screenY;

    // if dragging a temporal label
    if (this._state.draggingTempLabel) {
      // get world coords from screen coords
      const worldPos = ThreeUtils.unprojectFromScreenToWorld(
        screenX, screenY,
        viewport.offsetWidth,
        viewport.offsetHeight,
        this._state.camera
      );
      // intersect dragPlane with ray thrown from camera
      const intersPoint = ThreeUtils.getPlaneRayIntersection(
        this._state.dragPlane.normal, // plane's normal
        this._state.dragPlane.position, // plane's position
        this._state.dragPlane.normal, // ray's normal (same as plane)
        worldPos); // ray's position
      // if correct intersection detected
      if (intersPoint) {
        // update sprite's position
        const tmpLabel = this._state.tempDraggableLabel;
        tmpLabel.sprite.position.copy(intersPoint);
        // update line's position
        const lineGeo = tmpLabel.line.geometry;
        lineGeo.dynamic = true;
        lineGeo.vertices.length = 1;
        lineGeo.vertices.push(intersPoint);
        lineGeo.verticesNeedUpdate = true;
        // update spritePlane
        tmpLabel.spritePlane.position.copy(intersPoint);
        tmpLabel.spritePlane.quaternion.copy(this._state.camera.quaternion);
        this.animateForAWhile();
      }
    }

    if (this._state.orbitingCamera) {
      // initiate a camera orbit
      this._state.mouseLeft2.x = screenX;
      this._state.mouseLeft2.y = screenY;
      this._state.cameraOrbitUpdatePending = true;
      this.animateForAWhile();
    }

    if (this._state.draggingSelectedLabel) {
      // get world coords from screen coords
      const worldPos = ThreeUtils.unprojectFromScreenToWorld(
        screenX, screenY,
        viewport.offsetWidth,
        viewport.offsetHeight,
        this._state.camera
      );
      // intersect dragPlane with ray thrown from camera
      const intersPoint = ThreeUtils.getPlaneRayIntersection(
        this._state.dragPlane.normal, // plane's normal
        this._state.dragPlane.position, // plane's position
        this._state.dragPlane.normal, // ray's normal (same as plane)
        worldPos); // ray's position
      // if correct intersection detected
      if (intersPoint) {
        // update sprite's position
        const selectedLabel = this._state.selectedLabel;
        selectedLabel.sprite.position.copy(intersPoint);
        // update all lines positions
        selectedLabel.lines.forEach((line) => {
          const lineGeo = line.geometry;
          lineGeo.dynamic = true;
          lineGeo.vertices.length = 1;
          lineGeo.vertices.push(intersPoint);
          lineGeo.verticesNeedUpdate = true;
        });
        // update spritePlane
        selectedLabel.spritePlane.position.copy(intersPoint);
        selectedLabel.spritePlane.quaternion.copy(this._state.camera.quaternion);
        this.animateForAWhile();
      }
    }
  }

  /**
   * Handle Mouse Up events
   */
  handleMouseUp(event) {
    console.log("====> handleMouseUp()");
    if (event.button === LEFT_BUTTON) {
      this._state.orbitingCamera = false;
      this._state.cameraOrbitUpdatePending = false;
      this._state.draggingSelectedLabel = false;
    }
  }

  /**
   * Handle Context Menu events
   */
  handleContextMenu(event) {
    event.preventDefault();
    return false;
  }

  handleResize() {
    if (this._state.meshGroup !== null) {
      const viewport = this.refs.viewport;
      const w = viewport.offsetWidth;
      const h = viewport.offsetHeight;
      const cam = this._state.camera;
      // update the camera
      cam.left = -w / 2;
      cam.right = w / 2;
      cam.top = h / 2;
      cam.bottom = -h / 2;
      cam.updateProjectionMatrix();
      // update the renderer's size
      this._state.renderer.setSize(w, h);
      this.animateForAWhile();
    }
  }

  isMouseOverViewport() {
    const w = this.refs.viewport.offsetWidth;
    const h = this.refs.viewport.offsetHeight;
    const mvpc = this._state.mouseViewportCoords;
    return (mvpc.x >= 0 && mvpc.x <= w && mvpc.y >= 0 && mvpc.y <= h);
  }

  handleKeypress(event) {
    if (this.isMouseOverViewport()) {
      const selectedLabel = this._state.selectedLabel;
      if (selectedLabel) {
        event.preventDefault();
        selectedLabel.text += String.fromCharCode(event.keyCode);
        this.highlightLabel(selectedLabel);
        this.animateForAWhile();
      }
    }
  }

  handleKeydown(event) {
    if (this.isMouseOverViewport()) {
      const selectedLabel = this._state.selectedLabel;
      if (selectedLabel) {
        if (event.keyCode === 8) { // backspace
          event.preventDefault();
          if (selectedLabel.text.length > 0) {
            selectedLabel.text = selectedLabel.text.slice(0, -1);
            this.highlightLabel(selectedLabel);
            this.animateForAWhile();
          }
        }
      }
    }
  }

  render() {
    return (
      <div style={styles.viewport} ref="viewport"
        onWheel={this.handleWheel} onMouseDown={this.handleMouseDown}
        onContextMenu={this.handleContextMenu}
      >
      </div>
    );
  }
}

Renderer3D.propTypes = {
  canEdit: React.PropTypes.bool,
  localFiles: React.PropTypes.object,
  remoteFiles: React.PropTypes.array,
  annotations: React.PropTypes.array,
  labelCountChanged: React.PropTypes.func.isRequired,
  highlightedLabelStyle: React.PropTypes.object.isRequired,
  normalLabelStyle: React.PropTypes.object.isRequired,
};

const styles = {
  viewport: {
    height: '450px',
    minWidth: '700px',
  },
};
