import React, { Component } from 'react';
import THREE from 'n3d-threejs';
import MTLLoader from '../../_3Dlibrary/MTLLoader';
import OBJLoader from '../../_3Dlibrary/OBJLoader';
import ThreeUtils from '../../_3Dlibrary/ThreeUtils';
import _ from 'lodash';

// button constants
const LEFT_BUTTON = 0;
const RIGHT_BUTTON = 2;
// default message
const DEFAULT_LABEL_MESSAGE = 'Add name...';
// file extensions
const OBJ_EXT = '.obj';
const MTL_EXT = '.mtl';

export default class Renderer3D extends Component {

  static get defaultProps() {
    return {
      canEdit: true,
    };
  }

  constructor(props) {
    super(props);

    this.threeUpdate = this.threeUpdate.bind(this);
    this.threeRender = this.threeRender.bind(this);
    this.threeAnimate = this.threeAnimate.bind(this);
    this.load3DModelFromFiles = this.load3DModelFromFiles.bind(this);
    this.load3DModelFromUrls = this.load3DModelFromUrls.bind(this);
    this.loadMeshGroup = this.loadMeshGroup.bind(this);
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
    this.onHiddenTextChanged = this.onHiddenTextChanged.bind(this);
    this.updateSpritePlaneOrientations =
      this.updateSpritePlaneOrientations.bind(this);
    this.getViewportCoords = this.getViewportCoords.bind(this);
    this.labelsToJSON = this.labelsToJSON.bind(this);
    this.loadLabels = this.loadLabels.bind(this);
    this.clearAllLabelData = this.clearAllLabelData.bind(this);

    // API functions
    this.loadModel = this.loadModel.bind(this);
    this.hideLabes = this.hideLabes.bind(this);
    this.showLabels = this.showLabels.bind(this);
    this.setNormalLabelStyle = this.setNormalLabelStyle.bind(this);
    this.setHighlightedLabelStyle = this.setHighlightedLabelStyle.bind(this);
    this.removeSelectedLabel = this.removeSelectedLabel.bind(this);
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

    // save inner variables and data structures
    // that we don't want to expose to the client code
    // into "this.mystate" (that's why mystate instead of state)
    this.mystate = {
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
      labels: this.props.labels,
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
      // draggable label vars
      draggingTempLabel: false,
      tempDraggableLabel: null,
      dragLastPosition: new THREE.Vector3(),
      dragPlane: { normal: null, position: null },
    };

    /** if we are receiving remoteFiles, we load the 3D model
    from the server */
    if (this.props.remoteFiles) {
      const remoteFiles = this.props.remoteFiles;
      this.props.loadingStartingCallback();
      this.load3DModelFromUrls(remoteFiles)
      .then(() => {
        this.loadLabels(this.props.labels);
        this.props.loadingCompletedCallback();
      })
      .catch(error => {
        this.props.loadingErrorCallback(error);
      });
    }
    // run animation
    this.animateForAWhile();
  }

  /** Avoid updates altogether (they are not necessary) */
  shouldComponentUpdate() {
    return false;
  }

  componentWillReceiveProps(nextProps) {
    /** check if we are receving new remote files */
    if (nextProps.remoteFiles &&
      !_.isEqual(this.props.remoteFiles, nextProps.remoteFiles)) {
      const remoteFiles = nextProps.remoteFiles;
      this.props.loadingStartingCallback();
      this.load3DModelFromUrls(remoteFiles)
      .then(() => {
        /** update label styles if they are provided */
        if (nextProps.highlightedLabelStyle) {
          this.mystate.highlightedLabelStyle = nextProps.highlightedLabelStyle;
        }
        if (nextProps.normalLabelStyle) {
          this.mystate.normalLabelStyle = nextProps.normalLabelStyle;
        }
        /** update labels **/
        this.loadLabels(nextProps.labels);
        // notify successful completion
        this.props.loadingCompletedCallback();
      })
      .catch(error => {
        // notify any errors
        this.props.loadingErrorCallback(error);
      });
    }
  }

  componentWillUnmount() {
    // remove event listeners
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keypress', this.handleKeypress);
    window.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
  }

  /** function to update the 3D scene */
  threeUpdate() {
    // if no mesh has been set yet, abort updates
    if (this.mystate.meshGroup === null) return;

    if (this.mystate.updateCameraZoom) {
      // get viewport's dimensions
      const width = this.refs.viewport.offsetWidth;
      const height = this.refs.viewport.offsetHeight;
      // get mouse's world coords before zoom update
      const mw1 = ThreeUtils.unprojectFromScreenToWorld(
        this.mystate.mouseViewportCoords.x,
        this.mystate.mouseViewportCoords.y,
        width, height, this.mystate.camera
      );
      // update zoom
      this.mystate.camera.zoom = this.mystate.zoom;
      this.mystate.camera.updateProjectionMatrix();
      this.mystate.updateCameraZoom = false;
      // get mouse's world coords after zoom update
      const mw2 = ThreeUtils.unprojectFromScreenToWorld(
        this.mystate.mouseViewportCoords.x,
        this.mystate.mouseViewportCoords.y,
        width, height, this.mystate.camera
      );
      // get shift vector to update camera's position, light and target
      const shift = mw1.sub(mw2);
      this.mystate.camera.position.add(shift);
      this.mystate.cameraLight.position.copy(this.mystate.camera.position);
      const target = (new THREE.Vector3(0, 0, -1)).applyMatrix4(this.mystate.camera.matrixWorld);
      target.add(shift);
      this.mystate.camera.lookAt(target);

    } else if (this.mystate.cameraOrbitUpdatePending) {
      // get viewport's dimensions
      const width = this.refs.viewport.offsetWidth;
      const height = this.refs.viewport.offsetHeight;
      // convert previous mouse screen coords into world coords
      const w1 = ThreeUtils.unprojectFromScreenToWorld(
        this.mystate.mouseLeft1.x,
        this.mystate.mouseLeft1.y,
        width, height, this.mystate.camera
      );
      // convert current mouse screen coords into world coords
      const w2 = ThreeUtils.unprojectFromScreenToWorld(
        this.mystate.mouseLeft2.x,
        this.mystate.mouseLeft2.y,
        width, height, this.mystate.camera
      );
      // get diff vectors
      const v01 = (new THREE.Vector3()).subVectors(w1, this.mystate.meshCenter);
      const v12 = (new THREE.Vector3()).subVectors(w2, w1);

      if (!ThreeUtils.isZero(v01) && !ThreeUtils.isZero(v12)) {
        // compute axis
        const axis = (new THREE.Vector3()).crossVectors(v01, v12);
        axis.normalize();

        // compute angle
        let xx = (this.mystate.mouseLeft2.x - this.mystate.mouseLeft1.x);
        xx *= xx;
        let yy = (this.mystate.mouseLeft2.y - this.mystate.mouseLeft1.y);
        yy *= yy;
        const angle = 0.003 + Math.min(0.4, (xx + yy) / 100);

        // set quaternion
        const quat = new THREE.Quaternion();
        quat.setFromAxisAngle(axis, angle);

        // rotate camera's position
        this.mystate.camera.position
          .sub(this.mystate.meshCenter)
          .applyQuaternion(quat)
          .add(this.mystate.meshCenter);

        // rotate camera's target
        const target = (new THREE.Vector3(0, 0, -1)).applyMatrix4(this.mystate.camera.matrixWorld);
        target
          .sub(this.mystate.meshCenter)
          .applyQuaternion(quat)
          .add(this.mystate.meshCenter);

        // rotate camera's up
        const up = (new THREE.Vector3(0, 1, 0)).applyMatrix4(this.mystate.camera.matrixWorld);
        up.sub(this.mystate.meshCenter)
        .applyQuaternion(quat)
        .add(this.mystate.meshCenter)
        .sub(this.mystate.camera.position);

        // set camera's up and target
        this.mystate.camera.up.copy(up);
        this.mystate.camera.lookAt(target);

        // update camera's light's position
        this.mystate.cameraLight.position.copy(this.mystate.camera.position);

        // update orientation of sprite planes
        this.updateSpritePlaneOrientations();
      }

      this.mystate.mouseLeft1.x = this.mystate.mouseLeft2.x;
      this.mystate.mouseLeft1.y = this.mystate.mouseLeft2.y;
      this.mystate.cameraOrbitUpdatePending = false;
    }
  }

  /**
   * [threeRender : renders the scene]
   */
  threeRender() {
    const renderer = this.mystate.renderer;
    const camera = this.mystate.camera;
    // render scene
    renderer.render(this.mystate.scene, camera);
  }

  /**
   * [threeAnimate : updates and renders the scene]
   */
  threeAnimate() {
    if (this.mystate.updateTimerRunning) {
      requestAnimationFrame(this.threeAnimate);
      this.threeUpdate();
      this.threeRender();
    }
  }

  load3DModelFromUrls(urls) {
    const objUrl = urls.obj;
    const mtlUrl = urls.mtl;
    const textureUrls = {};

    if (urls.images) {
      for (let i = 0; i < urls.images.length; ++i) {
        const url = urls.images[i];
        const filename = url.substring(url.lastIndexOf('/') + 1);
        textureUrls[filename] = url;
      }
    }

    if (mtlUrl === null) { // check mtl url was provided
      return Promise.reject('mtl url not found');
    }
    if (objUrl === null) { // check obj url was provided
      return Promise.reject('obj url not found');
    }

    const progressCallback = this.props.loadingProgressCallback;
    progressCallback(`Loading MTL file from ${mtlUrl} ...`, 0, 1);

    return MTLLoader.loadMaterialsFromUrl(mtlUrl, textureUrls)
    .then((materials) => {
      progressCallback(`Loading OBJ file from ${objUrl} ...`, 0, 1);
      return OBJLoader.loadObjectsFromUrl(objUrl, materials, (lengthSoFar, totalLength) => {
        progressCallback(`Loading OBJ file from ${objUrl} ...`, lengthSoFar, totalLength);
      })
    })
    .then((meshGroup) => {
      // on success, proceed to incorporte the meshes into the scene
      // and render them
      this.loadMeshGroup(meshGroup);
    });
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

    // ------------------------------------------------
    // iterate through files and select them according
    // to their file extension
    for (let i = 0; i < files.length; ++i) {
      const file = files.item(i);
      const fname = file.name;

      if (fname.length > OBJ_EXT.length &&
        fname.substr(fname.length - OBJ_EXT.length, fname.length)
        .toLowerCase() === OBJ_EXT) {
        objFile = file; // obj file
      } else if (fname.length > MTL_EXT.length &&
        fname.substr(fname.length - MTL_EXT.length, fname.length)
        .toLowerCase() === MTL_EXT) {
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
      return Promise.reject('obj file not found');
    }

    const progressCallback = this.props.loadingProgressCallback;
    progressCallback(`Loading MTL file ${mtlFile.name} ...`, 0, mtlFile.size);
    // use MTLLoader to load materials from MTL file
    return MTLLoader.loadMaterialsFromFile(mtlFile, texturePaths)
    .then((materials) => {
      progressCallback(`Loading MTL file ${mtlFile.name} ...`, mtlFile.size, mtlFile.size);
      // on success, proceed to use the OBJLoader to load the 3D objects
      // from OBJ file
      return OBJLoader.loadObjectsFromFile(objFile, materials, (lengthSoFar, totalLength) => {
        progressCallback(`Loading OBJ file ${objFile.name} ...`, lengthSoFar, totalLength);
      });
    })
    .then((meshGroup) => {
      // on success, proceed to incorporte the meshes into the scene
      // and render them
      this.loadMeshGroup(meshGroup);
    });
  }

  loadMeshGroup(meshGroup) {
    // compute bounding box
    this.mystate.boundingBox = ThreeUtils.getMeshesBoundingBox(meshGroup.children);
    // compute the center
    this.mystate.meshCenter
      .copy(this.mystate.boundingBox.min)
      .add(this.mystate.boundingBox.max)
      .multiplyScalar(0.5);
    // compute the mesh diameter
    this.mystate.meshDiameter =
      this.mystate.boundingBox.min.distanceTo(this.mystate.boundingBox.max);
    // center the camera on boundingBox
    ThreeUtils.centerCameraOnBoundingBox(
      this.mystate.camera,
      this.mystate.cameraLight,
      this.mystate.boundingBox,
      this.refs.viewport.offsetWidth,
      this.refs.viewport.offsetHeight
    );
    this.mystate.zoom = this.mystate.camera.zoom; // keep the zoom up to date

    /** remove from scene both meshes and labels */
    if (this.mystate.meshGroup !== null) {
      // remove meshes
      for (let i = this.mystate.meshGroup.children.length - 1; i >= 0; --i) {
        const mesh = this.mystate.meshGroup.children[i];
        this.mystate.meshGroup.remove(mesh);
      }
      // remove labels
      this.clearAllLabelData();
      // notify parent of changes
      this.props.labelsChangedCallback(this.labelsToJSON());
      this.props.selectedLabelChangedCallback(this.mystate.selectedLabel);
    }
    // set the new meshGroup
    this.mystate.meshGroup = meshGroup;
    // add to scene
    this.mystate.scene.add(meshGroup);
    // reenable labels
    this.mystate.scene.remove(this.mystate.sphereGroup);
    this.mystate.scene.remove(this.mystate.lineGroup);
    this.mystate.scene.remove(this.mystate.spriteGroup);
    this.mystate.scene.remove(this.mystate.spritePlaneGroup);
    this.mystate.scene.add(this.mystate.sphereGroup);
    this.mystate.scene.add(this.mystate.lineGroup);
    this.mystate.scene.add(this.mystate.spriteGroup);
    this.mystate.scene.add(this.mystate.spritePlaneGroup);
    this.mystate.labelsEnabled = true;
    // run animation cycle to reflect changes on the screen
    this.animateForAWhile();
  }

  /**
   * [Clear all data structures used internally for labels]
   */
  clearAllLabelData() {
    // clear lines
    for (let i = this.mystate.lineGroup.children.length - 1; i >= 0; --i) {
      const line = this.mystate.lineGroup.children[i];
      this.mystate.lineGroup.remove(line);
    }
    // clear sprites
    for (let i = this.mystate.spriteGroup.children.length - 1; i >= 0; --i) {
      const sprite = this.mystate.spriteGroup.children[i];
      this.mystate.spriteGroup.remove(sprite);
    }
    // clear sprite planes
    for (let i = this.mystate.spritePlaneGroup.children.length - 1; i >= 0; --i) {
      const splane = this.mystate.spritePlaneGroup.children[i];
      this.mystate.spritePlaneGroup.remove(splane);
    }
    // clear spheres
    for (let i = this.mystate.sphereGroup.children.length - 1; i >= 0; --i) {
      const sphere = this.mystate.sphereGroup.children[i];
      this.mystate.sphereGroup.remove(sphere);
    }
    // clear other structures
    this.mystate.labelSet.clear();
    this.mystate.spritePlaneToLabelMap = {};
    this.mystate.sphereToLineMap = {};
    this.mystate.sphereToLabelMap = {};
    // no selected label anymore
    this.mystate.selectedLabel = null;
    this.draggingSelectedLabel = false;
  }

  /**
   * [Receives an array of labels in JSON format, and then loads them
   * as 3D labels that show up on the screen]
   */
  loadLabels(labels) {
    // remove all existing labels
    this.clearAllLabelData();
    // load new labels
    this.mystate.labels = labels;
    if (labels) {
      labels.forEach((label) => {
        /** new label object */
        const labelObj = {};
        /** spheres and lines */
        const spheres = new Set();
        const lines = new Set();
        label.points.forEach((p) => {
          const point = new THREE.Vector3(p.x, p.y, p.z);
          // sphere
          const radius = this.mystate.meshDiameter / 100;
          const sphereGeom = new THREE.SphereGeometry(radius, 32, 32);
          const material = new THREE.MeshPhongMaterial({
            color: this.props.normalLabelStyle.sphereColor });
          const sphere = new THREE.Mesh(sphereGeom, material);
          sphere.position.copy(point);
          spheres.add(sphere);
          this.mystate.sphereGroup.add(sphere);
          this.mystate.sphereToLabelMap[sphere.uuid] = labelObj;
          // line
          const lineGeo = new THREE.Geometry();
          lineGeo.vertices.push(point);
          lineGeo.vertices.push(label.position);
          const lineMat = new THREE.LineBasicMaterial({
            color: this.props.normalLabelStyle.lineColor, linewidth: 2 });
          const line = new THREE.Line(lineGeo, lineMat);
          lines.add(line);
          this.mystate.lineGroup.add(line);
          this.mystate.sphereToLineMap[sphere.uuid] = line;
        });
        /** sprite */
        const sprite = ThreeUtils.makeTextSprite(
          label.text, 1, this.mystate.meshDiameter, this.mystate.normalLabelStyle
        );
        sprite.position.set(label.position.x, label.position.y, label.position.z);
        this.mystate.spriteGroup.add(sprite);
        /** sprite plane */
        const spritePlane =
          ThreeUtils.createPlaneFromSprite(sprite, this.mystate.camera);
        spritePlane.visible = false; // make sure it's invisible
        this.mystate.spritePlaneGroup.add(spritePlane);
        this.mystate.spritePlaneToLabelMap[spritePlane.uuid] = labelObj;
        /** set labelObj's fields */
        labelObj.spheres = spheres;
        labelObj.lines = lines;
        labelObj.spritePlane = spritePlane;
        labelObj.sprite = sprite;
        labelObj.text = label.text;
        /** add label to set */
        this.mystate.labelSet.add(labelObj);
      });
    }
    // notify parent of changes
    this.props.labelsChangedCallback(this.labelsToJSON());
    this.props.selectedLabelChangedCallback(this.mystate.selectedLabel);
    // refresh screen
    this.animateForAWhile();
  }

  // ======================================================

  // ==============
  // API FUNCTIONS
  // ==============

  /**
   * [loadModel : load model from local files]
   * @param  {[type]} files       [description]
   * @param  {[type]} labels [description]
   * @return {[type]}             [description]
   */
  loadModel(files, labels) {
    this.props.loadingStartingCallback();
    this.load3DModelFromFiles(files)
    .then(() => {
      this.loadLabels(labels);
      this.props.loadingCompletedCallback();
    })
    .catch(error => {
      this.props.loadingErrorCallback(error);
    });
  }

  /**
   * [refocusOnModel : center camera on model]
   */
  refocusOnModel() {
    if (this.mystate.meshGroup !== null) {
      ThreeUtils.centerCameraOnBoundingBox(
        this.mystate.camera,
        this.mystate.cameraLight,
        this.mystate.boundingBox,
        this.refs.viewport.offsetWidth,
        this.refs.viewport.offsetHeight
      );
      this.mystate.zoom = this.mystate.camera.zoom; // keep the zoom up to date
      this.animateForAWhile();
    }
  }

  /**
   * Starts the update and render (animation) cycle for @milliseconds milliseconds
   * The purpose is to ensure that updates and rendering are performed
   * only when it's necessary, and not all the time
   */
  animateForAWhile(milliseconds = 500) {
    if (this.mystate.updateTimerRunning) return; // already running? ignore
    this.mystate.updateTimerRunning = true;
    // start the animation cycle
    this.threeAnimate();
    // start timer to stop the animation cycle when time is over
    setTimeout(() => {
      this.mystate.updateTimerRunning = false;
    }, milliseconds);
  }

  /**
   * Handle wheel events
   */
  handleWheel(event) {
    event.preventDefault();
    if (event.deltaY < 0) { // zoom in
      this.mystate.zoom *= 1.05;
    } else { // zoom out
      this.mystate.zoom *= 0.95;
      if (this.mystate.zoom < 0.01) this.mystate.zoom = 0.01;
    }
    this.mystate.updateCameraZoom = true;
    this.animateForAWhile();
  }

  /**
   * [sets the new style for normal labels and
   * refreshes the scene]
   */
  setNormalLabelStyle(style) {
    this.mystate.normalLabelStyle = style;
    if (this.mystate.labelSet.size > 0) {
      for (const label of this.mystate.labelSet) {
        if (label === this.mystate.selectedLabel) continue;
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
    this.mystate.highlightedLabelStyle = style;
    if (this.mystate.selectedLabel) {
      this.highlightLabel(this.mystate.selectedLabel);
      this.animateForAWhile();
    }
  }

  /**
   * Handle mouse down events
   */
  handleMouseDown(event) {
    console.log("====> handleMouseDown()");

    const viewport = this.refs.viewport;
    const vpcoords = this.getViewportCoords(event);
    const screenX = vpcoords.x;
    const screenY = vpcoords.y;

    if (event.button === LEFT_BUTTON) {
      if (this.mystate.meshGroup !== null && !this.mystate.draggingTempLabel) {
        /**
         * Conditions:
         * 	  1) there is 3D Model already loaded
         *    2) we are not dragging a temporal label (transparent label)
         *
         * What can happen:
         * 	  1) left click on spritePlane
         * 	  	-> selects/highlight the label
         * 	  	-> unselect/unhighlight previously selected label (if any)
         * 	  	-> starts dragging this label (if canEdit)
         * 	  2) left click on sphere
         * 	  	2.1) if the sphere belongs to a highlighted label (and canEdit)
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
        if (this.mystate.labelsEnabled) {
          const splanes = this.mystate.spritePlaneGroup.children;
          // make sprite planes visible for intersection
          for (let i = 0; i < splanes.length; ++i) splanes[i].visible = true;
          // check intersection with sprite planes, spheres and meshes
          const intrs = ThreeUtils.getClosestIntersectedObject(
            screenX, screenY, viewport.offsetWidth, viewport.offsetHeight,
            this.mystate.raycaster, this.mystate.camera,
            this.mystate.sphereGroup,
            this.mystate.meshGroup,
            this.mystate.spritePlaneGroup
          );
          // make sprite planes invisible again
          for (let i = 0; i < splanes.length; ++i) splanes[i].visible = false;

          if (intrs) {
            const pickedObj = intrs.object;
            const pickedGroup = intrs.group;
            const prevLabel = this.mystate.selectedLabel;

            // case 1) sprite plane intersected
            if (pickedGroup === this.mystate.spritePlaneGroup) {
              // highlight label (if not already)
              const label = this.mystate.spritePlaneToLabelMap[pickedObj.object.uuid];
              if (label !== prevLabel) {
                if (prevLabel) this.unhighlightLabel(prevLabel);
                this.highlightLabel(label);
                this.mystate.selectedLabel = label;
                this.props.selectedLabelChangedCallback(this.mystate.selectedLabel);
              }

              /** starts dragging the label (only if edition is enabled) */
              if (this.props.canEdit) {
                this.mystate.draggingSelectedLabel = true;
                // plane paramters where dragging will happen
                this.mystate.dragPlane.normal =
                  ThreeUtils.getCameraForwardNormal(this.mystate.camera);
                this.mystate.dragPlane.position = label.sprite.position;

                this.refs.hiddenTxtInp.value = label.text;
                // setTimeout(() => { this.refs.hiddenTxtInp.focus(); }, 0);
                // no orbits
                shouldOrbit = false;
              }

            // case 2) sphere intersected
            } else if (pickedGroup === this.mystate.sphereGroup) {
              const sphere = pickedObj.object;
              const label = this.mystate.sphereToLabelMap[sphere.uuid];

              // case 2.1) sphere belongs to already selected label
              if (label === prevLabel && this.props.canEdit) {
                // remove line
                const line = this.mystate.sphereToLineMap[sphere.uuid];
                this.mystate.lineGroup.remove(line); // from scene
                label.lines.delete(line); // from label
                // remove sphere
                this.mystate.sphereGroup.remove(sphere); // from scene
                label.spheres.delete(sphere); // from label
                delete this.mystate.sphereToLineMap[sphere.uuid]; // from maps
                delete this.mystate.sphereToLabelMap[sphere.uuid];
                // ----
                // if label runs out of spheres, delete label as well
                if (label.spheres.size === 0) {
                  this.mystate.spritePlaneGroup.remove(label.spritePlane);
                  this.mystate.spriteGroup.remove(label.sprite);
                  this.mystate.selectedLabel = null;
                  this.mystate.labelSet.delete(label);
                  // notify change of selected label
                  this.props.selectedLabelChangedCallback(this.mystate.selectedLabel);
                }
                // notify change of labels
                this.props.labelsChangedCallback(this.labelsToJSON());

              // case 2.2) a different label selected
              } else if (label !== prevLabel) {
                if (prevLabel) this.unhighlightLabel(prevLabel);
                this.highlightLabel(label);
                this.mystate.selectedLabel = label;
                this.props.selectedLabelChangedCallback(this.mystate.selectedLabel);
              }
              shouldOrbit = false;
            }
          }
        }
        if (shouldOrbit) {
          // initiate a camera orbit around 3D Model
          this.mystate.orbitingCamera = true;
          this.mystate.mouseLeft1.x = screenX;
          this.mystate.mouseLeft1.y = screenY;
        }
        // refresh canvas
        this.animateForAWhile();
      }
    } else if (event.button === RIGHT_BUTTON) {
      if (this.mystate.meshGroup !== null && this.mystate.labelsEnabled
        && this.props.canEdit) {
        /**
         * Conditions:
         * 	1) there is a 3D Model already loaded
         * 	2) labels are enabled
         * 	3) edition is enabled
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
         *  	In both cases the dragging cycle of temporal label finishes
         **/

        // -----------------
        // set up raycaster
        this.mystate.mouseClipping.x = (screenX / viewport.offsetWidth) * 2 - 1;
        this.mystate.mouseClipping.y = (screenY / viewport.offsetHeight) * 2 - 1;
        this.mystate.raycaster.setFromCamera(this.mystate.mouseClipping, this.mystate.camera);
        // --------------------------------------------
        // intersect against meshes, spheres and sprite planes
        const splanes = this.mystate.spritePlaneGroup.children;
        // make sprite planes visible for intersection
        for (let i = 0; i < splanes.length; ++i) splanes[i].visible = true;
        // check intersection with sprite planes, spheres and meshes
        const intrs = ThreeUtils.getClosestIntersectedObject(
          screenX, screenY, viewport.offsetWidth, viewport.offsetHeight,
          this.mystate.raycaster, this.mystate.camera,
          this.mystate.sphereGroup, this.mystate.meshGroup, this.mystate.spritePlaneGroup
        );
        // make sprite planes invisible again
        for (let i = 0; i < splanes.length; ++i) splanes[i].visible = false;

        // --------------------------------------------
        // case 2) already dragging a temporal label
        if (this.mystate.draggingTempLabel) {
          const dragLabel = this.mystate.tempDraggableLabel;
          // auxiliar pointer
          let labelToHighlight;
          // ----------------------------------------
          // case 2.1) existing label intersected:
          // temp label gets merged into it
          if (intrs && intrs.group === this.mystate.spritePlaneGroup) {
            // -----
            const splane = intrs.object.object; // intesected plane
            // we get label from plane
            const intrsLabel = this.mystate.spritePlaneToLabelMap[splane.uuid];
            // add sphere and line into intersected label
            intrsLabel.spheres.add(dragLabel.sphere);
            intrsLabel.lines.add(dragLabel.line);
            // match sphere with the intersected label and line
            this.mystate.sphereToLabelMap[dragLabel.sphere.uuid] = intrsLabel;
            this.mystate.sphereToLineMap[dragLabel.sphere.uuid] = dragLabel.line;
            // update line so that it points to the intersected label
            const lineGeo = dragLabel.line.geometry;
            lineGeo.dynamic = true;
            lineGeo.vertices.length = 1;
            lineGeo.vertices.push(intrsLabel.sprite.position);
            lineGeo.verticesNeedUpdate = true;
            // add elements into structures so they show up in scene
            this.mystate.sphereGroup.add(dragLabel.sphere);
            this.mystate.lineGroup.add(dragLabel.line);
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
            dragLabel.spritePlane.quaternion.copy(this.mystate.camera.quaternion);
            // create new label object
            const labelObj = {
              text: dragLabel.text, // copy text
              spritePlane: dragLabel.spritePlane, // copy sprite plane
              sprite: dragLabel.sprite, // copy sprite
              spheres, // set of spheres
              lines, // set of lines
            };
            // create matches between elements
            this.mystate.sphereToLabelMap[dragLabel.sphere.uuid] = labelObj;
            this.mystate.sphereToLineMap[dragLabel.sphere.uuid] = dragLabel.line;
            this.mystate.spritePlaneToLabelMap[dragLabel.spritePlane.uuid] = labelObj;
            // add elements into structures so they show up in scene
            this.mystate.spritePlaneGroup.add(dragLabel.spritePlane);
            this.mystate.spriteGroup.add(dragLabel.sprite);
            this.mystate.sphereGroup.add(dragLabel.sphere);
            this.mystate.lineGroup.add(dragLabel.line);
            // set label to highlight
            labelToHighlight = labelObj;
            // add new label to set
            this.mystate.labelSet.add(labelObj);
          }
          //----------------------------------------
          // Things that happen for both cases 2.1 and 2.2
          // --------------------------------
          // highlight label
          this.highlightLabel(labelToHighlight);
          this.mystate.selectedLabel = labelToHighlight;
          this.props.selectedLabelChangedCallback(this.mystate.selectedLabel);
          // remove dragged elements directly from scene (because they were added
          // directly into scene for temporal dragging purposes)
          this.mystate.scene.remove(dragLabel.sprite);
          this.mystate.scene.remove(dragLabel.sphere);
          this.mystate.scene.remove(dragLabel.line);
          this.mystate.scene.remove(dragLabel.spritePlane);
          // temporal dragging is over
          this.mystate.tempDraggableLabel = null;
          this.mystate.draggingTempLabel = false;
          // and notify parent of changes in labels
          this.props.labelsChangedCallback(this.labelsToJSON());
          // refresh scene
          this.animateForAWhile();

        // ------------------------------------------
        // Case 1): we were not dragging anything
        // so this is the first right click to start
        // adding a new label
        } else {
          // if we intersected a mesh
          if (intrs && intrs.group === this.mystate.meshGroup) {
            // -------------
            // get sphere
            const point = intrs.object.point;
            const radius = this.mystate.meshDiameter / 100;
            const sphereGeom = new THREE.SphereGeometry(radius, 32, 32);
            const material = new THREE.MeshPhongMaterial({
              color: this.props.normalLabelStyle.sphereColor });
            const sphere = new THREE.Mesh(sphereGeom, material);
            sphere.position.copy(point);

            // ---------------------------------------------
            // get temporal, transparent label
            const sprite = ThreeUtils.makeTextSprite(
              DEFAULT_LABEL_MESSAGE,
              0.5, // opacity
              this.mystate.meshDiameter, // reference size to scale
              this.mystate.normalLabelStyle // label style
            );
            // get camera's normal pointing forward
            const camForwardN = ThreeUtils.getCameraForwardNormal(this.mystate.camera);
            // get dir towards camera
            const dir = new THREE.Vector3()
              .copy(camForwardN)
              .multiplyScalar(-1);
            // get dist
            const dist = this.mystate.meshDiameter / 5;
            // position sprite
            sprite.position
              .copy(point)
              .addScaledVector(dir, dist);

            // save plane's parameters where label was dropped,
            // intended to be used for dragging purposes
            this.mystate.dragPlane.normal = camForwardN;
            this.mystate.dragPlane.position = sprite.position;

            // get plane from sprite (for intersection purposes),
            // not the same as the previous one
            const spritePlane = ThreeUtils.createPlaneFromSprite(sprite, this.mystate.camera);
            spritePlane.visible = false; // should not be visible

            // get line connecting the sphere with the label
            const lineGeo = new THREE.Geometry();
            lineGeo.vertices.push(point);
            lineGeo.vertices.push(sprite.position);
            const lineMat = new THREE.LineBasicMaterial({
              color: this.props.normalLabelStyle.lineColor, linewidth: 2 });
            const line = new THREE.Line(lineGeo, lineMat);

            // unselect the previously selected label (if any)
            if (this.mystate.selectedLabel !== null) {
              this.unhighlightLabel(this.mystate.selectedLabel);
              this.mystate.selectedLabel = null;
              this.props.selectedLabelChangedCallback(this.mystate.selectedLabel);
            }

            // add elements into scene
            this.mystate.scene.add(line);
            this.mystate.scene.add(sprite);
            this.mystate.scene.add(sphere);
            this.mystate.scene.add(spritePlane);

            // remember that we are dragging a temporal label
            const labelObj = { sprite, spritePlane, sphere, line, text: '' };
            this.mystate.tempDraggableLabel = labelObj;
            this.mystate.draggingTempLabel = true;

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
    const quat = this.mystate.camera.quaternion;
    this.mystate.spritePlaneGroup.children.forEach((p) => { p.quaternion.copy(quat); });
  }

  /**
   * [shows label as highlighted]
   */
  highlightLabel(labelObj) {
    this.setLabelStyle(labelObj, {
      text: labelObj.text || DEFAULT_LABEL_MESSAGE,
      worldReferenceSize: this.mystate.meshDiameter,
      style: this.mystate.highlightedLabelStyle,
    });
  }

  /**
   * [shows label as non-highlighted]
   */
  unhighlightLabel(labelObj) {
    this.setLabelStyle(labelObj, {
      text: labelObj.text || DEFAULT_LABEL_MESSAGE,
      worldReferenceSize: this.mystate.meshDiameter,
      style: this.mystate.normalLabelStyle,
    });
  }

  /**
   * [resets the color of the spheres, reset the color the lines and
   * reset the sprite's style settings of the given label object]
   */
  setLabelStyle(labelObj, labelSettings) {
    const labelStyle = labelSettings.style;
    // change spheres color
    for (const sphere of labelObj.spheres) {
      sphere.material.color.set(labelStyle.sphereColor);
    }
    // change lines color
    for (const line of labelObj.lines) {
      line.material.color.set(labelStyle.lineColor);
    }
    // remove current sprite
    this.mystate.spriteGroup.remove(labelObj.sprite);
    // create a new sprite
    const newSprite = ThreeUtils.makeTextSprite(
      labelSettings.text,
      labelSettings.opacity,
      labelSettings.worldReferenceSize,
      labelSettings.style
    );
    // copy the same position from the old sprite
    newSprite.position.copy(labelObj.sprite.position);
    // replace with new sprite
    this.mystate.spriteGroup.add(newSprite);
    labelObj.sprite = newSprite;
    // remove old spritePlane
    this.mystate.spritePlaneGroup.remove(labelObj.spritePlane);
    delete this.mystate.spritePlaneToLabelMap[labelObj.spritePlane.uuid];
    // replace with new spritePlane
    const newSpritePlane =
      ThreeUtils.createPlaneFromSprite(newSprite, this.mystate.camera);
    newSpritePlane.visible = false; // make sure it's invisible
    this.mystate.spritePlaneGroup.add(newSpritePlane);
    this.mystate.spritePlaneToLabelMap[newSpritePlane.uuid] = labelObj;
    labelObj.spritePlane = newSpritePlane;
  }

  hideLabes() {
    this.mystate.scene.remove(this.mystate.sphereGroup);
    this.mystate.scene.remove(this.mystate.lineGroup);
    this.mystate.scene.remove(this.mystate.spriteGroup);
    this.mystate.scene.remove(this.mystate.spritePlaneGroup);
    this.mystate.labelsEnabled = false;
    this.animateForAWhile();
  }

  showLabels() {
    this.mystate.scene.add(this.mystate.sphereGroup);
    this.mystate.scene.add(this.mystate.lineGroup);
    this.mystate.scene.add(this.mystate.spriteGroup);
    this.mystate.scene.add(this.mystate.spritePlaneGroup);
    this.mystate.labelsEnabled = true;
    this.animateForAWhile();
  }

  removeSelectedLabel() {
    this.removeLabel(this.mystate.selectedLabel);
  }

  removeLabel(label) {
    if (!label) return;
    // remove sprite
    this.mystate.spriteGroup.remove(label.sprite);
    // remove sprite plane
    this.mystate.spritePlaneGroup.remove(label.spritePlane);
    delete this.mystate.spritePlaneToLabelMap[label.spritePlane.uuid];
    // remove spheres
    for (const sphere of label.spheres) {
      this.mystate.sphereGroup.remove(sphere);
      delete this.mystate.sphereToLineMap[sphere.uuid];
      delete this.mystate.sphereToLabelMap[sphere.uuid];
    }
    // remove lines
    for (const line of label.lines) {
      this.mystate.lineGroup.remove(line);
    }
    // remove label
    this.mystate.labelSet.delete(label);
    this.props.labelsChangedCallback(this.labelsToJSON());
    // check if label was the selectedLabel
    if (label === this.mystate.selectedLabel) {
      this.mystate.selectedLabel = null;
      // interrupt any possible dragging in process
      this.mystate.draggingSelectedLabel = false;
      this.props.selectedLabelChangedCallback(null);
    }
    // refresh scene
    this.animateForAWhile();
  }

  labelsToJSON() {
    const labelsArray = [];
    for (const label of this.mystate.labelSet) {
      // spheres
      const points = [];
      for (const sphere of label.spheres) {
        points.push({
          x: sphere.position.x,
          y: sphere.position.y,
          z: sphere.position.z,
        });
      }
      labelsArray.push({
        points,
        position: {
          x: label.sprite.position.x,
          y: label.sprite.position.y,
          z: label.sprite.position.z,
        },
        text: label.text,
      });
    }
    return labelsArray;
  }

  /**
   * Handle mouse move events
   */
  handleMouseMove(event) {
    this.mystate.mouseViewportCoords = this.getViewportCoords(event);
    const screenX = this.mystate.mouseViewportCoords.x;
    const screenY = this.mystate.mouseViewportCoords.y;
    const viewport = this.refs.viewport;

    // if dragging a temporal label
    if (this.mystate.draggingTempLabel) {
      // get world coords from screen coords
      const worldPos = ThreeUtils.unprojectFromScreenToWorld(
        screenX, screenY,
        viewport.offsetWidth,
        viewport.offsetHeight,
        this.mystate.camera
      );
      // intersect dragPlane with ray thrown from camera
      const intersPoint = ThreeUtils.getPlaneRayIntersection(
        this.mystate.dragPlane.normal, // plane's normal
        this.mystate.dragPlane.position, // plane's position
        this.mystate.dragPlane.normal, // ray's normal (same as plane)
        worldPos); // ray's position
      // if correct intersection detected
      if (intersPoint) {
        // update sprite's position
        const tmpLabel = this.mystate.tempDraggableLabel;
        tmpLabel.sprite.position.copy(intersPoint);
        // update line's position
        const lineGeo = tmpLabel.line.geometry;
        lineGeo.dynamic = true;
        lineGeo.vertices.length = 1;
        lineGeo.vertices.push(intersPoint);
        lineGeo.verticesNeedUpdate = true;
        // update spritePlane
        tmpLabel.spritePlane.position.copy(intersPoint);
        tmpLabel.spritePlane.quaternion.copy(this.mystate.camera.quaternion);
        this.animateForAWhile();
      }
    }

    if (this.mystate.draggingSelectedLabel) {
      // get world coords from screen coords
      const worldPos = ThreeUtils.unprojectFromScreenToWorld(
        screenX, screenY,
        viewport.offsetWidth,
        viewport.offsetHeight,
        this.mystate.camera
      );
      // intersect dragPlane with ray thrown from camera
      const intersPoint = ThreeUtils.getPlaneRayIntersection(
        this.mystate.dragPlane.normal, // plane's normal
        this.mystate.dragPlane.position, // plane's position
        this.mystate.dragPlane.normal, // ray's normal (same as plane)
        worldPos); // ray's position
      // if correct intersection detected
      if (intersPoint) {
        // update sprite's position
        const selectedLabel = this.mystate.selectedLabel;
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
        selectedLabel.spritePlane.quaternion.copy(this.mystate.camera.quaternion);
        this.animateForAWhile();
      }
    }

    if (this.mystate.orbitingCamera) {
      // initiate a camera orbit
      this.mystate.mouseLeft2.x = screenX;
      this.mystate.mouseLeft2.y = screenY;
      this.mystate.cameraOrbitUpdatePending = true;
      this.animateForAWhile();
    }

  }

  getViewportCoords(event) {
    const vp = this.refs.viewport;
    const bcr = vp.getBoundingClientRect();
    const ans = {
      x: event.clientX - bcr.left,
      y: vp.offsetHeight + bcr.top - event.clientY,
    };
    return ans;
  }

  /**
   * Handle Mouse Up events
   */
  handleMouseUp(event) {
    if (event.button === LEFT_BUTTON) {
      // notify parent of labels changed if we were dragging one
      if (this.mystate.draggingSelectedLabel) {
        this.props.labelsChangedCallback(this.labelsToJSON());
      }
      this.mystate.orbitingCamera = false;
      this.mystate.cameraOrbitUpdatePending = false;
      this.mystate.draggingSelectedLabel = false;
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
    if (this.mystate.meshGroup !== null) {
      const viewport = this.refs.viewport;
      const w = viewport.offsetWidth;
      const h = viewport.offsetHeight;
      const cam = this.mystate.camera;
      // update the camera
      cam.left = -w / 2;
      cam.right = w / 2;
      cam.top = h / 2;
      cam.bottom = -h / 2;
      cam.updateProjectionMatrix();
      // update the renderer's size
      this.mystate.renderer.setSize(w, h);
      this.animateForAWhile();
    }
  }

  isMouseOverViewport() {
    const w = this.refs.viewport.offsetWidth;
    const h = this.refs.viewport.offsetHeight;
    const mvpc = this.mystate.mouseViewportCoords;
    return (mvpc.x >= 0 && mvpc.x <= w && mvpc.y >= 0 && mvpc.y <= h);
  }

  handleKeypress(e) {
    if (this.mystate.selectedLabel && this.isMouseOverViewport()) {
      const e2 = new KeyboardEvent('e', e);
      this.refs.hiddenTxtInp.focus();
      this.refs.hiddenTxtInp.dispatchEvent(e2);
    }
  }

  handleKeydown(e) {
    if (this.mystate.selectedLabel && this.isMouseOverViewport()) {
      const e2 = new KeyboardEvent('e', e);
      this.refs.hiddenTxtInp.focus();
      this.refs.hiddenTxtInp.dispatchEvent(e2);
    }
  }

  onHiddenTextChanged(event) {
    event.preventDefault();
    const text = this.refs.hiddenTxtInp.value;
    const selectedLabel = this.mystate.selectedLabel;
    if (selectedLabel) {
      selectedLabel.text = text;
      this.highlightLabel(selectedLabel);
      this.animateForAWhile();
      this.props.labelsChangedCallback(this.labelsToJSON());
    }
  }

  render() {
    return (
      <div>
        <div style={styles.viewport} ref="viewport"
          onWheel={this.handleWheel} onMouseDown={this.handleMouseDown}
          onContextMenu={this.handleContextMenu}
        >
        </div>
        <input ref="hiddenTxtInp" onChange={this.onHiddenTextChanged} style={styles.hiddenTxtInp}></input>
      </div>
    );
  }
}

Renderer3D.propTypes = {
  canEdit: React.PropTypes.bool,
  remoteFiles: React.PropTypes.object,
  labels: React.PropTypes.array,
  labelsChangedCallback: React.PropTypes.func.isRequired,
  selectedLabelChangedCallback: React.PropTypes.func.isRequired,
  loadingStartingCallback: React.PropTypes.func.isRequired,
  loadingProgressCallback: React.PropTypes.func.isRequired,
  loadingErrorCallback: React.PropTypes.func.isRequired,
  loadingCompletedCallback: React.PropTypes.func.isRequired,
  highlightedLabelStyle: React.PropTypes.object.isRequired,
  normalLabelStyle: React.PropTypes.object.isRequired,
};

const styles = {
  viewport: {
    height: '350px',
    minWidth: '700px',
  },
  hiddenTxtInp: {
    width: 0,
    height: 0,
    marginLeft: -9999,
  },
};
