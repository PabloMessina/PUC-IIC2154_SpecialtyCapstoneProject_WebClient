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
    this.animateForAWhile = this.animateForAWhile.bind(this);
    this.removeLabel = this.removeLabel.bind(this);
    this.highlightLabel = this.highlightLabel.bind(this);
    this.unhighlightLabel = this.unhighlightLabel.bind(this);
    this.updateSelectedLabel = this.updateSelectedLabel.bind(this);
    this.moveLabel = this.moveLabel.bind(this);
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

    // save variables into "this" to make them
    // accessible from other functions
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.ambientLight = ambientLight;
    this.cameraLight = cameraLight;
    this.meshGroup = null;
    this.boundingBox = null;
    this.meshCenter = new THREE.Vector3();
    this.meshDiameter = null;
    this.raycaster = raycaster;
    // label data
    this.spriteGroup = spriteGroup;
    this.lineGroup = lineGroup;
    this.sphereGroup = sphereGroup;
    this.sphereToLabelMap = {};
    this.spriteToLabelMap = {};
    // other state data
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
      selectedSphere: null,
    };

    // run animation
    this.animateForAWhile();
  }

  // function to update the scene
  threeUpdate() {
    // if no mesh has been set yet, abort updates
    if (this.meshGroup === null) return;

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

  /**
   * [threeRender : renders the scene]
   */
  threeRender() {
    this.renderer.render(this.scene, this.camera);
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
    .then((meshGroup) => {
      // on success, proceed to incorporte the meshes into the scene
      // and render them
      console.log("----------------------");
      console.log("success: meshGroup = ", meshGroup);
      // compute bounding box
      this.boundingBox = ThreeUtils.getMeshesBoundingBox(meshGroup.children);
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
      if (this.meshGroup !== null) {
        this.scene.remove(this.meshGroup);
      }
      // set the new meshGroup
      this.meshGroup = meshGroup;
      // add to scene
      this.scene.add(meshGroup);

      // run animation cycle to reflect changes on the screen
      this.animateForAWhile();
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
      if (this.meshGroup !== null) {
        this._state.mouseClipping.x = (screenX / viewport.offsetWidth) * 2 - 1;
        this._state.mouseClipping.y = (screenY / viewport.offsetHeight) * 2 - 1;
        // set up raycaster
        this.raycaster.setFromCamera(this._state.mouseClipping, this.camera);
        // intersect spheres
        const intersectedSpheres = this.raycaster.intersectObjects(this.sphereGroup.children);

        let pickedSphere = false;
        // if we intersected at least one sphere
        if (intersectedSpheres.length > 0) {
          // intersect meshes
          const intersectedMeshes = this.raycaster.intersectObjects(this.meshGroup.children);

          // if the sphere is closest intersected object
          if (intersectedMeshes.length === 0 ||
            intersectedSpheres[0].distance < intersectedMeshes[0].distance) {
            // retrieve label
            const sphere = intersectedSpheres[0].object;
            const labelObj = this.sphereToLabelMap[sphere.uuid];
            const prevSphere = this._state.selectedSphere;

            if (prevSphere === null) {
              // ----------------------------------
              // case 1: no selected sphere before
              // ---------------------------------
              // highlight label
              this.highlightLabel(labelObj);
              // set this sphere as the selectedSphere
              this._state.selectedSphere = sphere;
            } else if (sphere === prevSphere) {
              // ---------------------------------------------------------
              // case 2: this sphere and the selectedSphere are the same
              // ---------------------------------------------------------
              // we delete the whole label
              this.removeLabel(labelObj);
              this._state.selectedSphere = null;
            } else {
              // ---------------------------------------------------------
              // case 3: this sphere and the selectedSphere are different
              // ---------------------------------------------------------
              // highlight this label
              this.highlightLabel(labelObj);
              // unhighlight the previously selected label
              this.unhighlightLabel(this.sphereToLabelMap[prevSphere.uuid]);
              // update the selected sphere
              this._state.selectedSphere = sphere;
            }
            pickedSphere = true;
          }
        }

        // if no sphere picked, consider it as a normal click for rotation
        if (!pickedSphere) {
          this._state.mouseLeftButtonDown = true;
          this._state.mouseLeft1.x = event.pageX - viewport.offsetLeft;
          this._state.mouseLeft1.y = viewport.offsetHeight + viewport.offsetTop - event.pageY;
          /*
          // if there was an already selected sphere, we unhighlight its whole label
          if (this._state.selectedSphere !== null) {
            const sphereId = this._state.selectedSphere.uuid;
            this.unhighlightLabel(this.sphereToLabelMap[sphereId]);
            this._state.selectedSphere = null;
          }
          */
        }

        // refresh canvas
        this.animateForAWhile();
      }

    } else if (event.button === RIGH_BUTTON) {
      event.preventDefault();
      if (this.meshGroup !== null) {
        console.log("---------");
        console.log("right button clicked");
        // get mouse's clipping coordinates
        this._state.mouseClipping.x = (screenX / viewport.offsetWidth) * 2 - 1;
        this._state.mouseClipping.y = (screenY / viewport.offsetHeight) * 2 - 1;
        // do raycasting
        this.raycaster.setFromCamera(this._state.mouseClipping, this.camera);
        const intersects = this.raycaster.intersectObjects(this.meshGroup.children);
        // if we picked something
        if (intersects.length > 0) {
          // add sphere into scene
          const point = intersects[0].point;
          const radius = this.meshDiameter / 200;
          const sphereGeom = new THREE.SphereGeometry(radius, 32, 32);
          const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
          const sphere = new THREE.Mesh(sphereGeom, material);
          sphere.position.copy(point);
          this.sphereGroup.add(sphere);

          // add label into scene
          const text = '<EMPTY LABEL>';
          const sprite = ThreeUtils.makeTextSprite(text,
            {
              fontStyle: '100px Georgia',
              worldFontHeight: this.meshDiameter / 100,
              borderThickness: 20,
              borderColor: 'rgb(0,0,0)',
              backgroundColor: 'rgba(255,255,255,0.6)',
              foregroundColor: 'rgb(0,0,0)',
            });
          const textpos = new THREE.Vector3()
            .subVectors(point, this.meshCenter)
            .multiplyScalar(1.2)
            .add(this.meshCenter);
          sprite.position.copy(textpos);
          this.spriteGroup.add(sprite);

          // add a line connecting the sphere with the label
          const lineGeo = new THREE.Geometry();
          lineGeo.vertices.push(point);
          lineGeo.vertices.push(textpos);
          const lineMat = new THREE.LineBasicMaterial({ color: 0x00ffff });
          const line = new THREE.Line(lineGeo, lineMat);
          this.lineGroup.add(line);

          // keep track of the objects
          const labelObj = { sprite, sphere, line, text };
          this.spriteToLabelMap[sprite.uuid] = labelObj;
          this.sphereToLabelMap[sphere.uuid] = labelObj;

          // refresh scene
          this.animateForAWhile();
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
    labelObj.sphere.material.color.set(0xffff00);
    // highlight line
    labelObj.line.material.color.set(0xffff00);
    // remove current sprite
    this.spriteGroup.remove(labelObj.sprite);
    delete this.spriteToLabelMap[labelObj.sprite.uuid];
    // create a new highlighted sprite
    const newSprite = ThreeUtils.makeTextSprite(labelObj.text,
      {
        fontStyle: '100px Georgia',
        worldFontHeight: this.meshDiameter / 100,
        borderThickness: 20,
        borderColor: 'rgb(0,0,0)',
        backgroundColor: 'rgba(255,255,0,0.8)',
        foregroundColor: 'rgb(0,0,255)',
      });
    // copy the same position
    newSprite.position.copy(labelObj.sprite.position);
    // replace the old one
    this.spriteGroup.add(newSprite);
    this.spriteToLabelMap[newSprite.uuid] = labelObj;
    labelObj.sprite = newSprite;
  }

  /**
   * [unhighlightLabel : shows label as non-highlighted]
   * @param  {[object]} labelObj [object with references to sphere, line, sprite and text]
   */
  unhighlightLabel(labelObj) {
    // unhighlight sphere
    labelObj.sphere.material.color.set(0xff0000);
    // unhighlight line
    labelObj.line.material.color.set(0x00ffff);
    // remove current sprite
    this.spriteGroup.remove(labelObj.sprite);
    delete this.spriteToLabelMap[labelObj.sprite.uuid];
    // create a new non-highlighted sprite
    const newSprite = ThreeUtils.makeTextSprite(labelObj.text, {
      fontStyle: '100px Georgia',
      worldFontHeight: this.meshDiameter / 100,
      borderThickness: 20,
      borderColor: 'rgb(0,0,0)',
      backgroundColor: 'rgba(255,255,255,0.6)',
      foregroundColor: 'rgb(0,0,0)',
    });
    // copy the same position
    newSprite.position.copy(labelObj.sprite.position);
    // replace the old one
    this.spriteGroup.add(newSprite);
    this.spriteToLabelMap[newSprite.uuid] = labelObj;
    labelObj.sprite = newSprite;
  }

  /**
   * [removeLabel : removes a label]
   * @param  {[obj]} labelObj [wrapper for a label's data]
   */
  removeLabel(labelObj) {
    this.spriteGroup.remove(labelObj.sprite);
    this.lineGroup.remove(labelObj.line);
    this.sphereGroup.remove(labelObj.sphere);
    delete this.sphereToLabelMap[labelObj.sphere.uuid];
    delete this.spriteToLabelMap[labelObj.sprite.uuid];
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

  /**
   * [updateSelectedLabel : updates currently selected label in the scene
   * with the changes made to it]
   */
  updateSelectedLabel() {
    const text = this.refs.labelTextInput.value;
    const sphere = this._state.selectedSphere;
    if (sphere) {
      const labelObj = this.sphereToLabelMap[sphere.uuid];
      labelObj.text = text || '<EMPTY>';
      this.highlightLabel(labelObj);
      this.animateForAWhile();
    }
  }

  moveLabel(dirV) {
    // check we have a selected sphere
    const sphere = this._state.selectedSphere;
    if (sphere) {
      const labelObj = this.sphereToLabelMap[sphere.uuid];
      // compute distance to move
      const width = this.refs.viewport.offsetWidth;
      const height = this.refs.viewport.offsetHeight;
      const v1 = ThreeUtils.unprojectFromScreenToWorld(0, 0, width, height, this.camera);
      const v2 = ThreeUtils.unprojectFromScreenToWorld(width / 30, 0, width, height, this.camera);
      const dist = v1.distanceTo(v2);
      // move sprite in the direction provided
      const dir = new THREE.Vector3()
        .copy(dirV)
        .applyMatrix4(this.camera.matrixWorld)
        .sub(this.camera.position)
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
      <div>
        <input ref="filesInput" type="file" onChange={this.read3DFiles} multiple></input>
        <div>
          <input ref="labelTextInput" type="text" onChange={this.updateSelectedLabel}></input>
          <button onClick={() => this.moveLabel(UP_VECTOR)}>^</button>
          <button onClick={() => this.moveLabel(DOWN_VECTOR)}>v</button>
          <button onClick={() => this.moveLabel(LEFT_VECTOR)}>{'<'}</button>
          <button onClick={() => this.moveLabel(RIGHT_VECTOR)}>{'>'}</button>
          <button onClick={() => this.moveLabel(FAR_VECTOR)}>far</button>
          <button onClick={() => this.moveLabel(NEAR_VECTOR)}>near</button>
        </div>
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
