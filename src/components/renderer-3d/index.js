import React, { Component } from 'react';
import THREE from 'n3d-threejs';
import MTLLoader from '../../_3Dlibrary/MTLLoader';
import OBJLoader from '../../_3Dlibrary/OBJLoader';
import ThreeUtils from '../../_3Dlibrary/ThreeUtils';

const LEFT_BUTTON = 0;
const MIDDLE_BUTTON = 1;
const RIGH_BUTTON = 2;

export default class Renderer3D extends Component {

  constructor(props) {
    super(props);
    this.threeUpdate = this.threeUpdate.bind(this);
    this.threeRender = this.threeRender.bind(this);
    this.threeAnimate = this.threeAnimate.bind(this);
    this.read3DFiles = this.read3DFiles.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.updateAndRenderForAWhile = this.updateAndRenderForAWhile.bind(this);
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

    // initialize camera
    const camera = new THREE.OrthographicCamera(
      width / - 2, width / 2, height / 2, height / - 2, - 500, 1000);
    camera.position.set(0, 0, 50);
    camera.updateProjectionMatrix();

    // initialize raycaster
    const raycaster = new THREE.Raycaster();

    // save variables into "this" to make them
    // accessible from other functions
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.ambientLight = ambientLight;
    this.cameraLight = cameraLight;
    this.meshContainer = null;
    this.boundingBox = null;
    this.meshCenter = new THREE.Vector3();
    this.meshDiameter = null;
    this.raycaster = raycaster;
    this._state = {
      zoom: 1,
      updateCameraZoom: false,
      updateCameraRotation: false,
      mouseLeftButtonDown: false,
      mouseLeft1: { x: null, y: null },
      mouseLeft2: { x: null, y: null },
      mouseViewportCoords: { x: null, y: null },
      updateTimerRunning: false,
      mouseClipping: new THREE.Vector2(),
    };

    // run animation
    this.updateAndRenderForAWhile();
  }

  // function to update the scene
  threeUpdate() {
    // if no mesh has been set yet, abort updates
    if (this.meshContainer === null) return;

    if (this._state.updateCameraZoom) {
      // get viewport's dimensions
      const width = this.refs.viewport.offsetWidth;
      const height = this.refs.viewport.offsetHeight;
      // get mouse's world coords before zoom update
      const mw1 = ThreeUtils.unprojectFromScreenToWorld(
        this._state.mouseViewportCoords.x,
        this._state.mouseViewportCoords.y,
        width, height, this.camera
      );
      // update zoom
      this.camera.zoom = this._state.zoom;
      this.camera.updateProjectionMatrix();
      this._state.updateCameraZoom = false;
      // get mouse's world coords after zoom update
      const mw2 = ThreeUtils.unprojectFromScreenToWorld(
        this._state.mouseViewportCoords.x,
        this._state.mouseViewportCoords.y,
        width, height, this.camera
      );
      // get shift vector to update camera's position, light and target
      const shift = mw1.sub(mw2);
      this.camera.position.add(shift);
      this.cameraLight.position.copy(this.camera.position);
      const target = (new THREE.Vector3(0, 0, -1)).applyMatrix4(this.camera.matrixWorld);
      target.add(shift);
      this.camera.lookAt(target);
    }
    if (this._state.updateCameraRotation) {
      // get viewport's dimensions
      const width = this.refs.viewport.offsetWidth;
      const height = this.refs.viewport.offsetHeight;
      // convert previous mouse screen coords into world coords
      const w1 = ThreeUtils.unprojectFromScreenToWorld(
        this._state.mouseLeft1.x,
        this._state.mouseLeft1.y,
        width, height, this.camera
      );
      // convert current mouse screen coords into world coords
      const w2 = ThreeUtils.unprojectFromScreenToWorld(
        this._state.mouseLeft2.x,
        this._state.mouseLeft2.y,
        width, height, this.camera
      );
      // get diff vectors
      const v01 = (new THREE.Vector3()).subVectors(w1, this.meshCenter);
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
        this.camera.position
          .sub(this.meshCenter)
          .applyQuaternion(quat)
          .add(this.meshCenter);

        // rotate camera's target
        const target = (new THREE.Vector3(0, 0, -1)).applyMatrix4(this.camera.matrixWorld);
        target
          .sub(this.meshCenter)
          .applyQuaternion(quat)
          .add(this.meshCenter);

        // rotate camera's up
        const up = (new THREE.Vector3(0, 1, 0)).applyMatrix4(this.camera.matrixWorld);
        up.sub(this.meshCenter)
        .applyQuaternion(quat)
        .add(this.meshCenter)
        .sub(this.camera.position);

        this.camera.up.copy(up);
        this.camera.lookAt(target);

        // update camera's light's position
        this.cameraLight.position.copy(this.camera.position);
      }

      this._state.mouseLeft1.x = this._state.mouseLeft2.x;
      this._state.mouseLeft1.y = this._state.mouseLeft2.y;
      this._state.updateCameraRotation = false;
    }
  }

  // function to render the scene
  threeRender() {
    this.renderer.render(this.scene, this.camera);
  }

  threeAnimate() {
    if (this._state.updateTimerRunning) {
      requestAnimationFrame(this.threeAnimate);
      this.threeUpdate();
      this.threeRender();
    }
  }

  /**
   * Reads the files that are expected to contain all the information
   * necessary to render a 3D Model, and then renders that model.
   * It expects to receive 1 OBJ file, 1 MTL file and 0 or more image files (jpg, png, etc.)
   */
  read3DFiles() {
    // retrieve files from input button
    const input = this.refs.filesInput;
    const files = input.files;

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
      alert('mtl file not found'); // TODO: test and improve error handling
      return;
    }
    if (objFile === null) { // check obj file was provided
      alert('mtl file not found'); // TODO: test and improe error handling
      return;
    }
    // use MTLLoader to load materials from MTL file
    MTLLoader.loadMaterials(mtlFile, texturePaths)
    .then((materials) => {
      console.log("-----------------------");
      console.log("success: materials = ", materials);
      // on success, proceed to use the OBJLoader to load the 3D objects
      // from OBJ file
      return OBJLoader.loadObjects(objFile, materials);
    })
    .then((meshContainer) => {
      // on success, proceed to incorporte the meshes into the scene
      // and render them
      console.log("----------------------");
      console.log("success: meshContainer = ", meshContainer);
      // compute bounding box
      this.boundingBox = ThreeUtils.getMeshesBoundingBox(meshContainer.children);
      // compute the center
      this.meshCenter
        .copy(this.boundingBox.min)
        .add(this.boundingBox.max)
        .multiplyScalar(0.5);
      // compute the mesh diameter
      this.meshDiameter = this.boundingBox.min.distanceTo(this.boundingBox.max);
      // center the camera on boundingBox
      ThreeUtils.centerCameraOnBoundingBox(
        this.camera,
        this.cameraLight,
        this.boundingBox,
        this.refs.viewport.offsetWidth,
        this.refs.viewport.offsetHeight
      );
      this._state.zoom = this.camera.zoom; // keep the zoom up to date

      // remove from scene the previous meshes, if any
      if (this.meshContainer !== null) {
        this.scene.remove(this.meshContainer);
      }
      // set the new meshContainer
      this.meshContainer = meshContainer;
      // add to scene
      this.scene.add(meshContainer);

      // run animation cycle to reflect changes on the screen
      this.updateAndRenderForAWhile();
    })
    .catch((error) => {
      console.log("-----------------------");
      console.log("unexpected error after last then()");
      console.log("catch: error = ", error);
      // TODO: improve error handling
    });
  }

  /**
   * Starts the update and render (animation) cycle for @milliseconds milliseconds
   * The purpose is to ensure that updates and rendering are performed
   * only when it's necessary, and not all the time
   */
  updateAndRenderForAWhile(milliseconds = 500) {
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
    this.updateAndRenderForAWhile();
  }

  /**
   * Handle mouse down events
   */
  handleMouseDown(event) {
    console.log("====> handleMouseDown()");
    console.log("event.button = ", event.button);
    if (event.button === LEFT_BUTTON) {
      const viewport = this.refs.viewport;
      this._state.mouseLeftButtonDown = true;
      this._state.mouseLeft1.x = event.pageX - viewport.offsetLeft;
      this._state.mouseLeft1.y = viewport.offsetHeight + viewport.offsetTop - event.pageY;
      this.updateAndRenderForAWhile();
    } else if (event.button === RIGH_BUTTON) {
      event.preventDefault();
      if (this.meshContainer !== null) {
        console.log("---------");
        console.log("right button clicked");
        // get mouse's clipping coordinates
        const viewport = this.refs.viewport;
        const x = event.pageX - viewport.offsetLeft;
        const y = viewport.offsetHeight + viewport.offsetTop - event.pageY;
        this._state.mouseClipping.x = (x / viewport.offsetWidth) * 2 - 1;
        this._state.mouseClipping.y = (y / viewport.offsetHeight) * 2 - 1;
        console.log("x = ", x, " y = ", y);
        // do raycasting
        this.raycaster.setFromCamera(this._state.mouseClipping, this.camera);
        const intersects = this.raycaster.intersectObjects(this.meshContainer.children);
        console.log("intersects = ", intersects);
        // if we picked something
        if (intersects.length > 0) {
          console.log("intersection detected");

          // add sphere into scene
          const point = intersects[0].point;
          const radius = this.meshDiameter / 200;
          const sphereGeom = new THREE.SphereGeometry(radius, 32, 32);
          const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
          const sphereMesh = new THREE.Mesh(sphereGeom, material);
          sphereMesh.position.copy(point);
          this.scene.add(sphereMesh);

          // add label into scene
          const text = 'COMENTARIO RANDOM';
          const fontStyle = '100px Georgia';
          const sprite = ThreeUtils.makeTextSprite(text,
            {
              fontStyle,
              referenceLength: this.meshDiameter,
            });
          const textpos = new THREE.Vector3()
            .subVectors(point, this.meshCenter)
            .multiplyScalar(1.2)
            .add(this.meshCenter);
          sprite.position.copy(textpos);
          this.scene.add(sprite);
          this.updateAndRenderForAWhile();
        }
      }
    }
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
      this.updateAndRenderForAWhile();
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

  render() {
    return (
      <div>
        <input ref="filesInput" type="file" onChange={this.read3DFiles} multiple></input>
        <div style={styles.viewport} ref="viewport"
          onWheel={this.handleWheel} onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove} onMouseUp={this.handleMouseUp}
          onContextMenu={this.handleContextMenu}
        >
        </div>
      </div>
    );
  }
}

const styles = {
  viewport: {
    backgroundColor: 'red',
    height: 500,
    width: 500,
  },
};
