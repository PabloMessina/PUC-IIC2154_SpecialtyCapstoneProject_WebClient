import React, { Component } from 'react';
import THREE from 'n3d-threejs';
import MTLLoader from '../../_3Dlibrary/MTLLoader';
import OBJLoader from '../../_3Dlibrary/OBJLoader';
import ThreeUtils from '../../_3Dlibrary/ThreeUtils';

// button constants
const LEFT_BUTTON = 0;
const MIDDLE_BUTTON = 1;
const RIGH_BUTTON = 2;

// direction vector constants
const LEFT_VECTOR = new THREE.Vector3(-1, 0, 0);
const RIGHT_VECTOR = new THREE.Vector3(1, 0, 0);
const UP_VECTOR = new THREE.Vector3(0, 1, 0);
const DOWN_VECTOR = new THREE.Vector3(0, -1, 0);
const FAR_VECTOR = new THREE.Vector3(0, 0, -1);
const NEAR_VECTOR = new THREE.Vector3(0, 0, 1);

// colors
const LIGHT_BLUE = 'rgba(159,222,247,0.8)';
const BLACK = 'rgb(0,0,0)';
const WHITE = 'rgb(255,255,255)';
const RED = 'rgb(255,0,0)';
const YELLOW = 'rgb(255,255,0)';
const GREEN_US = 'rgb(0,168,150)';

// to resize coeficients
const LABEL_SIZE_COEF = 1 / 24;

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
    this.removeLabel = this.removeLabel.bind(this);
    this.highlightLabel = this.highlightLabel.bind(this);
    this.unhighlightLabel = this.unhighlightLabel.bind(this);

    this.moveLabel = this.moveLabel.bind(this);

    this.refocusOnModel = this.refocusOnModel.bind(this);

    // API functions
    this.loadModel = this.loadModel.bind(this);
    this.moveLabelUp = this.moveLabelUp.bind(this);
    this.moveLabelDown = this.moveLabelDown.bind(this);
    this.moveLabelLeft = this.moveLabelLeft.bind(this);
    this.moveLabelRight = this.moveLabelRight.bind(this);
    this.moveLabelNear = this.moveLabelNear.bind(this);
    this.moveLabelFar = this.moveLabelFar.bind(this);
    this.updateLabelText = this.updateLabelText.bind(this);

  }

  componentDidMount() {
    // reference to the viewport div
    const viewport = this.refs.viewport;
    const width = viewport.offsetWidth;
    const height = viewport.offsetHeight;

    // set up instance of THREE.WebGLRenderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0xeeeeee, 1);
    viewport.appendChild(renderer.domElement);

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
    const lineGroup = new THREE.Group();
    const sphereGroup = new THREE.Group();
    scene.add(spriteGroup);
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
      sphereToLabelMap: {},
      spriteToLabelMap: {},
      annotations: this.props.annotations,
      // other state data
      zoom: 1,
      updateCameraZoom: false,
      updateCameraRotation: false,
      mouseLeftButtonDown: false,
      mouseLeft1: { x: null, y: null },
      mouseLeft2: { x: null, y: null },
      mouseViewportCoords: { x: null, y: null },
      updateTimerRunning: false,
      mouseClipping: new THREE.Vector2(),
      selectedSphere: null,
      updatingLabelPosition: false,
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

  /**
   * Avoid updates altogether (they are not necessary)
   */
  shouldComponentUpdate() {
    return false;
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
    if (this._state.updateCameraRotation) {
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
      }

      this._state.mouseLeft1.x = this._state.mouseLeft2.x;
      this._state.mouseLeft1.y = this._state.mouseLeft2.y;
      this._state.updateCameraRotation = false;
    }
  }

  /**
   * [threeRender : renders the scene]
   */
  threeRender() {
    this._state.renderer.render(this._state.scene, this._state.camera);
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
      // spheres and sprites, if any
      if (this._state.meshGroup !== null) {
        this._state.meshGroup.children.length = 0;
        this._state.scene.remove(this._state.meshGroup);
      }
      this._state.lineGroup.children.length = 0;
      this._state.spriteGroup.children.length = 0;
      this._state.sphereGroup.children.length = 0;
      // set the new meshGroup
      this._state.meshGroup = meshGroup;
      // add to scene
      this._state.scene.add(meshGroup);

      // run animation cycle to reflect changes on the screen
      this.animateForAWhile();
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
   * functions to move current selected label up, down, left, right, front or near
   */
  moveLabelUp() {
    this.moveLabel(UP_VECTOR);
  }
  moveLabelDown() {
    this.moveLabel(DOWN_VECTOR);
  }
  moveLabelLeft() {
    this.moveLabel(LEFT_VECTOR);
  }
  moveLabelRight() {
    this.moveLabel(RIGHT_VECTOR);
  }
  moveLabelNear() {
    this.moveLabel(NEAR_VECTOR);
  }
  moveLabelFar() {
    this.moveLabel(FAR_VECTOR);
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
   * [updateLabelText : updates the text of the currently selected label
   * with the text written by the user]
   * @param  {[string]} text [text to update the label with]
   */
  updateLabelText(text) {
    const sphere = this._state.selectedSphere;
    if (sphere) {
      const labelObj = this._state.sphereToLabelMap[sphere.uuid];
      labelObj.text = text || DEFAULT_LABEL_MESSAGE;
      this.highlightLabel(labelObj);
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
   * Handle mouse down events
   */
  handleMouseDown(event) {
    console.log("====> handleMouseDown()");
    console.log("event.button = ", event.button);

    const viewport = this.refs.viewport;
    const screenX = event.pageX - viewport.offsetLeft;
    const screenY = viewport.offsetHeight + viewport.offsetTop - event.pageY;

    if (event.button === LEFT_BUTTON) {
      if (this._state.meshGroup !== null) {
        this._state.mouseClipping.x = (screenX / viewport.offsetWidth) * 2 - 1;
        this._state.mouseClipping.y = (screenY / viewport.offsetHeight) * 2 - 1;
        // set up raycaster
        this._state.raycaster.setFromCamera(this._state.mouseClipping, this._state.camera);
        // intersect spheres
        const intersectedSpheres =
          this._state.raycaster.intersectObjects(this._state.sphereGroup.children);

        let pickedSphere = false;
        // if we intersected at least one sphere
        if (intersectedSpheres.length > 0) {
          // intersect meshes
          const intersectedMeshes =
            this._state.raycaster.intersectObjects(this._state.meshGroup.children);

          // if the sphere is closest intersected object
          if (intersectedMeshes.length === 0 ||
            intersectedSpheres[0].distance < intersectedMeshes[0].distance) {
            // retrieve label
            const sphere = intersectedSpheres[0].object;
            const labelObj = this._state.sphereToLabelMap[sphere.uuid];
            const prevSphere = this._state.selectedSphere;

            if (prevSphere === null) {
              // ----------------------------------
              // case 1: no selected sphere before
              // ---------------------------------
              // highlight label
              this.highlightLabel(labelObj);
              // set this sphere as the selectedSphere
              this._state.selectedSphere = sphere;
              // execute callback to notify parent
              this.props.selectedLabelChanged(labelObj);
            } else if (sphere === prevSphere) {
              // ---------------------------------------------------------
              // case 2: this sphere and the selectedSphere are the same
              // ---------------------------------------------------------
              // we delete the whole label
              this.removeLabel(labelObj);
              this._state.selectedSphere = null;
              // execute callback to notify parent
              this.props.selectedLabelChanged(labelObj);
            } else {
              // ---------------------------------------------------------
              // case 3: this sphere and the selectedSphere are different
              // ---------------------------------------------------------
              // highlight this label
              this.highlightLabel(labelObj);
              // unhighlight the previously selected label
              this.unhighlightLabel(this._state.sphereToLabelMap[prevSphere.uuid]);
              // update the selected sphere
              this._state.selectedSphere = sphere;
              // execute callback to notify parent
              this.props.selectedLabelChanged(labelObj);
            }
            pickedSphere = true;
          }
        }

        // if no sphere picked, consider it as a normal click for rotation
        if (!pickedSphere) {
          this._state.mouseLeftButtonDown = true;
          this._state.mouseLeft1.x = event.pageX - viewport.offsetLeft;
          this._state.mouseLeft1.y = viewport.offsetHeight + viewport.offsetTop - event.pageY;
        }
        // refresh canvas
        this.animateForAWhile();
      }
    } else if (event.button === RIGH_BUTTON) {
      event.preventDefault();
      if (this._state.meshGroup !== null) {
        console.log("---------");
        console.log("right button clicked");
        // get mouse's clipping coordinates
        this._state.mouseClipping.x = (screenX / viewport.offsetWidth) * 2 - 1;
        this._state.mouseClipping.y = (screenY / viewport.offsetHeight) * 2 - 1;
        // do raycasting
        this._state.raycaster.setFromCamera(this._state.mouseClipping, this._state.camera);
        const intersects = this._state.raycaster.intersectObjects(this._state.meshGroup.children);
        // if we picked something
        if (intersects.length > 0) {
          // add sphere into scene
          const point = intersects[0].point;
          const radius = this._state.meshDiameter / 100;
          const sphereGeom = new THREE.SphereGeometry(radius, 32, 32);
          const material = new THREE.MeshPhongMaterial({ color: YELLOW });
          const sphere = new THREE.Mesh(sphereGeom, material);
          sphere.position.copy(point);
          this._state.sphereGroup.add(sphere);

          // add label into scene
          const text = DEFAULT_LABEL_MESSAGE;
          const sprite = ThreeUtils.makeTextSprite(text,
            {
              fontStyle: '100px Georgia',
              worldFontHeight: this._state.meshDiameter * LABEL_SIZE_COEF,
              borderThickness: 20,
              borderColor: BLACK,
              backgroundColor: LIGHT_BLUE,
              foregroundColor: 'rgb(0,0,255)',
            });
          const dir = new THREE.Vector3()
            .subVectors(point, this._state.meshCenter)
            .normalize();
          const textpos = new THREE.Vector3()
            .copy(point)
            .addScaledVector(dir, this._state.meshDiameter / 5);
          sprite.position.copy(textpos);
          this._state.spriteGroup.add(sprite);

          // add a line connecting the sphere with the label
          const lineGeo = new THREE.Geometry();
          lineGeo.vertices.push(point);
          lineGeo.vertices.push(textpos);
          const lineMat = new THREE.LineBasicMaterial({ color: BLACK });
          const line = new THREE.Line(lineGeo, lineMat);
          this._state.lineGroup.add(line);

          // keep track of the objects
          const labelObj = { sprite, sphere, line, text };
          this._state.spriteToLabelMap[sprite.uuid] = labelObj;
          this._state.sphereToLabelMap[sphere.uuid] = labelObj;

          // unhighlight the previously selected label (if any)
          if (this._state.selectedSphere !== null) {
            const sphereId = this._state.selectedSphere.uuid;
            this.unhighlightLabel(this._state.sphereToLabelMap[sphereId]);
          }
          // set this as the current selected sphere
          this._state.selectedSphere = sphere;

          // refresh scene
          this.animateForAWhile();
          // execute callback to notify parent
          this.props.selectedLabelChanged(labelObj);
        }
      }
    }
  }

  /**
   * [highlightLabel : shows label as highlighted]
   * @param  {[object]} labelObj [object with references to sphere, line, sprite and text]
   */
  highlightLabel(labelObj) {
    // highlight sphere
    labelObj.sphere.material.color.set(YELLOW);
    // highlight line
    labelObj.line.material.color.set(BLACK);
    // remove current sprite
    this._state.spriteGroup.remove(labelObj.sprite);
    delete this._state.spriteToLabelMap[labelObj.sprite.uuid];
    // create a new highlighted sprite
    const newSprite = ThreeUtils.makeTextSprite(labelObj.text,
      {
        fontStyle: '100px Georgia',
        worldFontHeight: this._state.meshDiameter * LABEL_SIZE_COEF,
        borderThickness: 20,
        borderColor: BLACK,
        backgroundColor: LIGHT_BLUE,
        foregroundColor: 'rgb(0,0,255)',
      });
    // copy the same position
    newSprite.position.copy(labelObj.sprite.position);
    // replace the old one
    this._state.spriteGroup.add(newSprite);
    this._state.spriteToLabelMap[newSprite.uuid] = labelObj;
    labelObj.sprite = newSprite;
  }

  /**
   * [unhighlightLabel : shows label as non-highlighted]
   * @param  {[object]} labelObj [object with references to sphere, line, sprite and text]
   */
  unhighlightLabel(labelObj) {
    // unhighlight sphere
    labelObj.sphere.material.color.set(GREEN_US);
    // unhighlight line
    labelObj.line.material.color.set(BLACK);
    // remove current sprite
    this._state.spriteGroup.remove(labelObj.sprite);
    delete this._state.spriteToLabelMap[labelObj.sprite.uuid];
    // create a new non-highlighted sprite
    const newSprite = ThreeUtils.makeTextSprite(labelObj.text, {
      fontStyle: '100px Georgia',
      worldFontHeight: this._state.meshDiameter * LABEL_SIZE_COEF,
      borderThickness: 20,
      borderColor: BLACK,
      backgroundColor: 'rgba(255,255,255,0.6)',
      foregroundColor: BLACK,
    });
    // copy the same position
    newSprite.position.copy(labelObj.sprite.position);
    // replace the old one
    this._state.spriteGroup.add(newSprite);
    this._state.spriteToLabelMap[newSprite.uuid] = labelObj;
    labelObj.sprite = newSprite;
  }

  /**
   * [removeLabel : removes a label]
   * @param  {[obj]} labelObj [wrapper for a label's data]
   */
  removeLabel(labelObj) {
    this._state.spriteGroup.remove(labelObj.sprite);
    this._state.lineGroup.remove(labelObj.line);
    this._state.sphereGroup.remove(labelObj.sphere);
    delete this._state.sphereToLabelMap[labelObj.sphere.uuid];
    delete this._state.spriteToLabelMap[labelObj.sprite.uuid];
  }

  /**
   * Handle mouse move events
   */
  handleMouseMove(event) {
    const viewport = this.refs.viewport;
    this._state.mouseViewportCoords.x = event.pageX - viewport.offsetLeft;
    this._state.mouseViewportCoords.y = viewport.offsetHeight + viewport.offsetTop - event.pageY;

    if (this._state.mouseLeftButtonDown) {
      this._state.mouseLeft2.x = this._state.mouseViewportCoords.x;
      this._state.mouseLeft2.y = this._state.mouseViewportCoords.y;
      this._state.updateCameraRotation = true;
      this.animateForAWhile();
    }
  }

  /**
   * Handle Mouse Up events
   */
  handleMouseUp(event) {
    console.log("====> handleMouseUp()");
    console.log("event.button = ", event.button);
    if (event.button === LEFT_BUTTON) {
      this._state.mouseLeftButtonDown = false;
      this._state.updateCameraRotation = false;
    }
  }

  /**
   * Handle Context Menu events
   */
  handleContextMenu(event) {
    event.preventDefault();
    return false;
  }

  moveLabel(dirV) {
    // check we have a selected sphere
    const sphere = this._state.selectedSphere;
    if (sphere) {
      const labelObj = this._state.sphereToLabelMap[sphere.uuid];
      // compute distance to move
      const width = this.refs.viewport.offsetWidth;
      const height = this.refs.viewport.offsetHeight;
      const v1 = ThreeUtils.unprojectFromScreenToWorld(0, 0, width, height, this._state.camera);
      const v2 = ThreeUtils.unprojectFromScreenToWorld(width / 30, 0, width, height,
        this._state.camera);
      const dist = v1.distanceTo(v2);
      // move sprite in the direction provided
      const dir = new THREE.Vector3()
        .copy(dirV)
        .applyMatrix4(this._state.camera.matrixWorld)
        .sub(this._state.camera.position)
        .normalize();
      const sprite = labelObj.sprite;
      sprite.position.addScaledVector(dir, dist);
      // update line
      const line = labelObj.line;
      line.geometry.dynamic = true;
      line.geometry.vertices.length = 0;
      line.geometry.vertices.push(sphere.position);
      line.geometry.vertices.push(sprite.position);
      line.geometry.verticesNeedUpdate = true;
      // refresh scene
      this.animateForAWhile();
    }
  }

  render() {
    return (
      <div style={styles.viewport} ref="viewport"
        onWheel={this.handleWheel} onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove} onMouseUp={this.handleMouseUp}
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
  selectedLabelChanged: React.PropTypes.func.isRequired,
};

const styles = {
  viewport: {
    backgroundColor: 'red',
    height: 500,
    width: 500,
  },
};
