import React, { Component } from 'react';
import THREE from 'n3d-threejs';
import MTLLoader from '../../_3Dlibrary/MTLLoader';
import OBJLoader from '../../_3Dlibrary/OBJLoader';
import ThreeUtils from '../../_3Dlibrary/ThreeUtils';
import isEqual from 'lodash/isEqual';

// button constants
const LEFT_BUTTON = 0;
const RIGHT_BUTTON = 2;
// default message
const DEFAULT_LABEL_MESSAGE = 'empty ...';
const DEFAULT_EVALUATION_LABEL_MESSAGE = 'answer me ..';
// file extensions
const OBJ_EXT = '.obj';
const MTL_EXT = '.mtl';

const OBJ_SIZE_THRESHOLD = 1024 * 1014 * 7;
const MTL_SIZE_THRESHOLD = 1024 * 512;

const DELETE_ICON_URL = 'http://localhost:3000/img/delete_icon.png';
const MINIMIZE_ICON_URL = 'http://localhost:3000/img/minimize_icon.png';

const ICON_COEF = 1 / 40;
const ICON_RES = 256;
const LABEL_DROP_DIST_COEF = 1 / 7;

export default class Renderer3D extends Component {

  constructor(props) {
    super(props);

    this.state = {
      mode: props.mode,
    };

    this.threeUpdate = this.threeUpdate.bind(this);
    this.threeRender = this.threeRender.bind(this);
    this.threeAnimate = this.threeAnimate.bind(this);
    this.load3DModelFromFiles = this.load3DModelFromFiles.bind(this);
    this.load3DModelFromUrls = this.load3DModelFromUrls.bind(this);
    this.loadMeshGroup = this.loadMeshGroup.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onWindowMouseDown = this.onWindowMouseDown.bind(this);
    this.animateForAWhile = this.animateForAWhile.bind(this);
    this.highlightLabel = this.highlightLabel.bind(this);
    this.unhighlightLabel = this.unhighlightLabel.bind(this);

    this.onResize = this.onResize.bind(this);
    this.onKeydown = this.onKeydown.bind(this);

    this.updateSpritePlaneOrientations =
      this.updateSpritePlaneOrientations.bind(this);
    this.getViewportCoords = this.getViewportCoords.bind(this);
    this.labelsToJSON = this.labelsToJSON.bind(this);
    this.loadLabels = this.loadLabels.bind(this);
    this.clearAllLabelData = this.clearAllLabelData.bind(this);
    this.onXHRCreated = this.onXHRCreated.bind(this);
    this.onXHRDone = this.onXHRDone.bind(this);
    this.selectLabel = this.selectLabel.bind(this);
    this.loadIconsFromServer = this.loadIconsFromServer.bind(this);
    this.refreshIconsPositions = this.refreshIconsPositions.bind(this);
    this.reloadDeleteIcon = this.reloadDeleteIcon.bind(this);
    this.reloadMinimizeIcon = this.reloadMinimizeIcon.bind(this);
    this.reloadIcons = this.reloadIcons.bind(this);
    this.minimizeSelectedLabel = this.minimizeSelectedLabel.bind(this);
    this.onFileDownloadStarted = this.onFileDownloadStarted.bind(this);
    this.onHiddenTextChanged = this.onHiddenTextChanged.bind(this);
    this.checkAndCorrectLabelIds = this.checkAndCorrectLabelIds.bind(this);
    this.getNextId = this.getNextId.bind(this);

    // API functions
    this.loadModel = this.loadModel.bind(this);
    this.hideLabels = this.hideLabels.bind(this);
    this.showLabels = this.showLabels.bind(this);
    this.setNormalLabelStyle = this.setNormalLabelStyle.bind(this);
    this.setHighlightedLabelStyle = this.setHighlightedLabelStyle.bind(this);
    this.removeSelectedLabel = this.removeSelectedLabel.bind(this);
    this.refocusOnModel = this.refocusOnModel.bind(this);
    this.unselectSelectedLabel = this.unselectSelectedLabel.bind(this);
    this.setSphereRadiusCoef = this.setSphereRadiusCoef.bind(this);
    this.minimizeAllLabels = this.minimizeAllLabels.bind(this);
    this.maximizeAllLabels = this.maximizeAllLabels.bind(this);
    this.gotFocus = this.gotFocus.bind(this);
    this.lostFocus = this.lostFocus.bind(this);
  }

  componentDidMount() {
    // add event listeners
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeydown);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mousedown', this.onWindowMouseDown);

    // reference to the viewport div
    const viewport = this.refs.viewport;
    const width = viewport.offsetWidth;
    const height = viewport.offsetHeight;

    // set up instance of THREE.WebGLRenderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x4fccf2, 1);
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
    const iconSpriteGroup = new THREE.Group();
    const iconCircleGroup = new THREE.Group();
    iconCircleGroup.visible = false;
    spritePlaneGroup.visible = false;
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
      sphereRadiusCoef: this.props.sphereRadiusCoef,
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
      id2labelMap: {},
      normalLabelStyle: this.props.normalLabelStyle,
      highlightedLabelStyle: this.props.highlightedLabelStyle,
      canFocusHiddenInput: false,
      selectedLabelTextDirty: false,
      // draggable label vars
      draggingTempLabel: false,
      tempDraggableLabel: null,
      dragLastPosition: new THREE.Vector3(),
      dragPlane: { normal: null, position: null },
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
      canvasHasFocus: false,
      loadingInterrupter: {
        stop: false,
        reason: '',
      },
      pendingXHRs: new Set(),
      labelIds: new Set(),
      componentFocused: false,
      // icons
      deleteImg: null,
      deleteIconSprite: null,
      deleteIconCircle: null,
      minimizeImg: null,
      minimizeIconSprite: null,
      minimizeIconCircle: null,
      iconSpriteGroup,
      iconCircleGroup,
    };

    /** if we are receiving remoteFiles, we load the 3D model
    from the server */
    if (this.props.remoteFiles) {
      const remoteFiles = this.props.remoteFiles;
      this.load3DModelFromUrls(remoteFiles)
      .then(() => {
        this.loadLabels(this.props.labels);
        this.props.loadingCompletedCallback();
      })
      .catch(error => this.props.loadingErrorCallback(error));
    }
    // load icons
    this.loadIconsFromServer();
    // run animation
    this.animateForAWhile();
  }

  reloadDeleteIcon() {
    if (this.mystate.deleteIconSprite) {
      this.mystate.iconSpriteGroup.remove(this.mystate.deleteIconSprite);
      this.mystate.iconCircleGroup.remove(this.mystate.deleteIconCircle);
    }
    const iconLength = this.mystate.meshDiameter * ICON_COEF;
    // reload sprite
    this.mystate.deleteIconSprite = (this.mystate.deleteImg) ?
      ThreeUtils.makeImageSprite({  // from loaded image
        img: this.mystate.deleteImg,
        resX: ICON_RES, resY: ICON_RES, worldWidth: iconLength, worldHeight: iconLength }) :
      ThreeUtils.makeDeleteIconSprite({ // manual creation
        resX: ICON_RES, resY: ICON_RES, worldWidth: iconLength, worldHeight: iconLength });
    this.mystate.iconSpriteGroup.add(this.mystate.deleteIconSprite);
    // reload mesh used for collision detection
    const geo = new THREE.CircleGeometry(iconLength * 0.5, 16);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const mesh = new THREE.Mesh(geo, mat);
    this.mystate.deleteIconCircle = mesh;
    this.mystate.iconCircleGroup.add(mesh);
  }
  reloadMinimizeIcon() {
    if (this.mystate.minimizeIconSprite) {
      this.mystate.iconSpriteGroup.remove(this.mystate.minimizeIconSprite);
      this.mystate.iconCircleGroup.remove(this.mystate.minimizeIconCircle);
    }
    const iconLength = this.mystate.meshDiameter * ICON_COEF;
    // reload sprite
    this.mystate.minimizeIconSprite = (this.mystate.minimizeImg) ?
      ThreeUtils.makeImageSprite({  // from loaded image
        img: this.mystate.minimizeImg,
        resX: ICON_RES, resY: ICON_RES, worldWidth: iconLength, worldHeight: iconLength }) :
      ThreeUtils.makeMinimizeIconSprite({ // manual creation
        resX: ICON_RES, resY: ICON_RES, worldWidth: iconLength, worldHeight: iconLength });
    this.mystate.iconSpriteGroup.add(this.mystate.minimizeIconSprite);
    // reload mesh used for collision detection
    const geo = new THREE.CircleGeometry(iconLength * 0.5, 16);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const mesh = new THREE.Mesh(geo, mat);
    this.mystate.minimizeIconCircle = mesh;
    this.mystate.iconCircleGroup.add(mesh);
  }

  reloadIcons() {
    if (this.state.mode === 'EDITION') this.reloadDeleteIcon();
    this.reloadMinimizeIcon();
  }

  loadIconsFromServer() {
    // delete icon
    const deleteImg = new Image();
    deleteImg.onload = () => {
      this.mystate.deleteImg = deleteImg;
      if (this.mystate.meshGroup) this.reloadDeleteIcon();
    };
    deleteImg.src = DELETE_ICON_URL;

    // minimize icon
    const minimizeImg = new Image();
    minimizeImg.onload = () => {
      this.mystate.minimizeImg = minimizeImg;
      if (this.mystate.meshGroup) this.reloadMinimizeIcon();
    };
    minimizeImg.src = MINIMIZE_ICON_URL;
  }


  componentWillReceiveProps(nextProps) {
    console.log('====> componentWillReceiveProps()');

    if (this.state.mode === 'EDITION') {
      /** check if we are receving new remote files */
      if (nextProps.remoteFiles &&
        !isEqual(this.props.remoteFiles, nextProps.remoteFiles)) {
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
        // notify any errors
        .catch(error => this.props.loadingErrorCallback(error));
      }
    } else if (this.state.mode === 'EVALUATION') {
      /* check if we are receving new label answers */
      if (nextProps.labelAnswersDirty) this.loadLabelAnswers(nextProps.labelAnswers);
    }
  }

  /** refresh labels with the answers received **/
  loadLabelAnswers(labelAnswers) {
    // refresh each label that needs to be updated
    for (const labelAns of labelAnswers) {
      const label = this.mystate.id2labelMap[labelAns.id];
      if (!label) {
        console.log(`WARNING: no label with id = ${labelAns.id} found`);
        continue;
      }
      if (typeof labelAns.text !== 'string') continue;
      if (label.student_answer !== labelAns.text) {
        label.student_answer = labelAns.text;
        if (label === this.mystate.selectedLabel) {
          this.refs.hiddenTxtInp.value = labelAns.text;
          this.highlightLabel(label);
          this.refreshIconsPositions();
          this.mystate.selectedLabelTextDirty = false;
        } else if (!label.minimized) {
          this.unhighlightLabel(label);
        }
      }
    }
    // notify that we have consumed the labels
    this.props.labelAnswersConsumedCallback();
    // refresh scene
    this.animateForAWhile();
  }

  /** Avoid updates altogether (they are not necessary) */
  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    console.log("==> Renderer3D::componentWillUnmount()");
    // remove event listeners
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeydown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mousedown', this.onWindowMouseDown);
    // abort any pending xhr requests
    for (const xhr of this.mystate.pendingXHRs) {
      xhr.abortAndRejectPromise('Fetch interrupted because the 3d renderer has been unmounted');
    }
    // set flag to interrupt any loadings
    this.mystate.loadingInterrupter = {
      stop: true, reason: 'Loading interrupted because the 3d renderer has been unmounted' };
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

        // if there is a selected label, refresh icons
        if (this.mystate.selectedLabel) this.refreshIconsPositions();
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
    // check mtl url was provided
    if (mtlUrl === null) return Promise.reject('mtl url not found');
    // check obj url was provided
    if (objUrl === null) return Promise.reject('obj url not found');

    this.props.downloadCycleStartedCallback();
    this.onFileDownloadStarted(mtlUrl);
    return MTLLoader.loadMaterialsFromUrl(
      mtlUrl, textureUrls,
      this.mystate.loadingInterrupter,
      this.onFileDownloadStarted)
    .then(({ materials }) => {
      if (this.mystate.loadingInterrupter.stop) {
        throw new Error(this.mystate.loadingInterrupter.reason);
      }
      this.onFileDownloadStarted(objUrl);
      return OBJLoader.loadObjectsFromUrl(
        objUrl,
        materials,
        (lengthSoFar, totalLength) =>
          this.props.loadingProgressCallback(
            `Loading OBJ file from ${objUrl} ...`, lengthSoFar, totalLength),
        this.onXHRCreated,
        this.onXHRDone,
        this.mystate.loadingInterrupter
      );
    })
    .then((meshGroup) => {
      if (this.mystate.loadingInterrupter.stop) {
        throw new Error(this.mystate.loadingInterrupter.reason);
      }
      // on success, proceed to incorporte the meshes into the scene
      // and render them
      this.loadMeshGroup(meshGroup);
    });
  }

  onXHRCreated(xhr) {
    this.mystate.pendingXHRs.add(xhr);
  }
  onXHRDone(xhr) {
    this.mystate.pendingXHRs.delete(xhr);
    this.props.downloadCycleFinishedCallback();
    this.props.loadingStartingCallback();
  }
  onFileDownloadStarted(url) {
    this.props.downloadingFileCallback(url);
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
    // files we   to read
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
        texturePaths[fname] = URL.createObjectURL(file);
      }
    }

    // ---------------------------------
    // parse MTL and OBJ files
    // ---------------------------------
    if (mtlFile === null) return Promise.reject('mtl file not found');
    if (objFile === null) return Promise.reject('obj file not found');
    if (mtlFile.size > MTL_SIZE_THRESHOLD) {
      return Promise.reject(`${mtlFile.name} has ${mtlFile.size}
        bytes > ${MTL_SIZE_THRESHOLD}. It's too heavy :S`);
    }
    if (objFile.size > OBJ_SIZE_THRESHOLD) {
      return Promise.reject(`${objFile.name} has ${objFile.size}
bytes > ${OBJ_SIZE_THRESHOLD} bytes. It's too heavy :S. Maybe you should
reduce the complexity of your mesh by applying mesh simplification on it.`);
    }

    let imagePathsUsed;

    this.props.downloadCycleStartedCallback();
    this.onFileDownloadStarted(URL.createObjectURL(mtlFile));
    // use MTLLoader to load materials from MTL file
    return MTLLoader.loadMaterialsFromFile(
      mtlFile, texturePaths,
      this.mystate.loadingInterrupter,
      this.onFileDownloadStarted)
    .then(({ materials, texturePathsUsed }) => {
      imagePathsUsed = texturePathsUsed;
      if (this.mystate.loadingInterrupter.stop) {
        throw new Error(this.mystate.loadingInterrupter.reason);
      }
      this.props.downloadCycleFinishedCallback();
      // on success, proceed to use the OBJLoader to load the 3D objects from OBJ file
      return OBJLoader.loadObjectsFromFile(
        objFile, materials,
        (lengthSoFar, totalLength) =>
          this.props.loadingProgressCallback(
            `Loading OBJ file ${objFile.name} ...`, lengthSoFar, totalLength),
        this.mystate.loadingInterrupter);
    })
    .then((meshGroup) => {
      if (this.mystate.loadingInterrupter.stop) {
        throw new Error(this.mystate.loadingInterrupter.reason);
      }
      // on success, proceed to incorporte the meshes into the scene and render them
      this.loadMeshGroup(meshGroup);
      this.props.local3DFilesLoadedCallback({ mtlFile, objFile, texturePaths: imagePathsUsed });
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
    /** remove from scene both meshes and labels */
    if (this.mystate.meshGroup !== null) {
      // remove meshes
      for (let i = this.mystate.meshGroup.children.length - 1; i >= 0; --i) {
        const mesh = this.mystate.meshGroup.children[i];
        this.mystate.meshGroup.remove(mesh);
      }
      // remove labels
      this.clearAllLabelData();
      // remove icons
      this.mystate.scene.remove(this.mystate.iconSpriteGroup);
      this.mystate.scene.remove(this.mystate.iconCircleGroup);
      // notify parent of changes
      this.props.labelsChangedCallback(this.labelsToJSON());
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
    // reload icons
    this.reloadIcons();
    // run animation cycle to reflect changes on the screen
    this.animateForAWhile(0);
    // refocus the camera on the model
    setTimeout(() => !this.mystate.loadingInterrupter.stop && this.refocusOnModel(), 100);
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
          const radius = this.mystate.meshDiameter * this.mystate.sphereRadiusCoef;
          const sphereGeom = new THREE.SphereGeometry(1, 32, 32);
          const material = new THREE.MeshPhongMaterial({
            color: this.props.normalLabelStyle.sphereColor });
          const sphere = new THREE.Mesh(sphereGeom, material);
          sphere.scale.set(radius, radius, radius);
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
          this.mystate.sphereToLineMap[sphere.uuid] = line;
          if (this.state.mode !== 'EVALUATION') this.mystate.lineGroup.add(line);
        });
        /** sprite */
        const sprite = ThreeUtils.makeTextSprite({
          text: label.text || DEFAULT_LABEL_MESSAGE,
          opacity: 1,
          worldReferenceSize: this.mystate.meshDiameter,
          params: this.mystate.normalLabelStyle,
        });
        sprite.position.set(label.position.x, label.position.y, label.position.z);
        if (this.state.mode !== 'EVALUATION') this.mystate.spriteGroup.add(sprite);
        /** sprite plane */
        const spritePlane =
          ThreeUtils.createPlaneFromSprite(sprite, this.mystate.camera);
        this.mystate.spritePlaneToLabelMap[spritePlane.uuid] = labelObj;
        if (this.state.mode !== 'EVALUATION') this.mystate.spritePlaneGroup.add(spritePlane);
        /** set labelObj's fields */
        labelObj.spheres = spheres;
        labelObj.lines = lines;
        labelObj.spritePlane = spritePlane;
        labelObj.sprite = sprite;
        labelObj.text = label.text;
        labelObj.id = label.id;
        if (this.state.mode === 'EVALUATION') {
          labelObj.minimized = true;
          labelObj.student_answer = '';
        }
        /** add label to set */
        this.mystate.labelSet.add(labelObj);
      });
    }
    // correct label ids
    this.checkAndCorrectLabelIds();
    // notify parent of changes
    this.props.labelsChangedCallback(this.labelsToJSON());
    // refresh screen
    this.animateForAWhile();
  }

  getNextId() {
    let i = 0;
    while (this.mystate.labelIds.has(i)) ++i;
    this.mystate.labelIds.add(i);
    return i;
  }

  checkAndCorrectLabelIds() {
    const labelIds = this.mystate.labelIds;
    const labelSet = this.mystate.labelSet;
    labelIds.clear();
    this.mystate.id2labelMap = {};
    for (const label of labelSet) {
      if (isInt(label.id)) {
        const id = parseInt(label.id, 10);
        if (id < 0 || labelIds.has(id)) label.id = null;
        else labelIds.add(id);
      }
    }
    for (const label of labelSet) if (!isInt(label.id)) label.id = this.getNextId();
    for (const label of labelSet) this.mystate.id2labelMap[label.id] = label;
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
      this.updateSpritePlaneOrientations();
      if (this.mystate.selectedLabel) this.refreshIconsPositions();
      this.animateForAWhile();
    }
  }

  /**
   * Starts the update and render (animation) cycle for @milliseconds milliseconds
   * The purpose is to ensure that updates and rendering are performed
   * only when it's necessary, and not all the time
   */
  animateForAWhile(milliseconds = 200) {
    if (this.mystate.updateTimerRunning) return; // already running? ignore
    if (this.mystate.componentUnmounted) return; // unmounted ? ignore
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
    if (this.mystate.canvasHasFocus) {
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
  }

  /**
   * [sets the new style for normal labels and
   * refreshes the scene]
   */
  setNormalLabelStyle(style) {
    this.mystate.normalLabelStyle = style;
    if (this.mystate.labelSet.size > 0) {
      for (const label of this.mystate.labelSet) {
        if (label === this.mystate.selectedLabel || label.minimized) continue;
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
      this.refreshIconsPositions();
      this.animateForAWhile();
    }
  }

  setSphereRadiusCoef(coef) {
    this.mystate.sphereRadiusCoef = coef;
    if (this.mystate.meshGroup) {
      const r = coef * this.mystate.meshDiameter;
      for (const sphere of this.mystate.sphereGroup.children) sphere.scale.set(r, r, r);
    }
    this.animateForAWhile();
  }

  onWindowMouseDown() {
    // update canvasHasFocus
    this.mystate.canvasHasFocus = this.isMouseOverViewport();
  }

  /**
   * Handle mouse down events
   */
  onMouseDown(event) {
    console.log("====> onMouseDown()");
    const viewport = this.refs.viewport;
    const vpcoords = this.getViewportCoords(event);
    const screenX = vpcoords.x;
    const screenY = vpcoords.y;

    if (event.button === LEFT_BUTTON) {
      if (this.mystate.meshGroup !== null && !this.mystate.draggingTempLabel) {
        /**
         * Conditions:
         * 	  1) there is 3D Model already loaded
         *    2) we are not dragging a temporary label (transparent label)
         *
         * What can happen:
         * 	  1) left click on spritePlane
         * 	  	-> selects/highlight the label
         * 	  	-> unselect/unhighlight previously selected label (if any)
         * 	  	-> starts dragging this label (if in edition mode)
         * 	  2) left click on sphere
         * 	  	2.1) if the sphere belongs to a highlighted label (and in edition mode)
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
          // make sprite planes visible for intersection
          this.mystate.spritePlaneGroup.visible = true;
          this.mystate.iconCircleGroup.visible = true;
          // check intersection with sprite planes, spheres and meshes
          const intrs = ThreeUtils.getClosestIntersectedObject(
            screenX, screenY, viewport.offsetWidth, viewport.offsetHeight,
            this.mystate.raycaster, this.mystate.camera,
            this.mystate.sphereGroup, this.mystate.meshGroup,
            this.mystate.spritePlaneGroup,
            this.mystate.selectedLabel ? this.mystate.iconCircleGroup : null
          );
          // make sprite planes invisible again
          this.mystate.spritePlaneGroup.visible = false;
          this.mystate.iconCircleGroup.visible = false;

          if (intrs) {
            const pickedObj = intrs.object;
            const pickedGroup = intrs.group;
            const prevLabel = this.mystate.selectedLabel;

            // case 1) sprite plane intersected
            if (pickedGroup === this.mystate.spritePlaneGroup) {
              // select label
              const label = this.mystate.spritePlaneToLabelMap[pickedObj.object.uuid];
              this.selectLabel(label);
              if (this.state.mode === 'EDITION') {
                /** starts dragging the label */
                this.mystate.draggingSelectedLabel = true;
                // plane parameters where dragging will happen
                this.mystate.dragPlane.normal =
                  ThreeUtils.getCameraForwardNormal(this.mystate.camera);
                this.mystate.dragPlane.position = label.sprite.position;

                this.refs.hiddenTxtInp.value = label.text;
                // no orbits
                shouldOrbit = false;
              }

            // case 2) sphere intersected
            } else if (pickedGroup === this.mystate.sphereGroup) {
              const sphere = pickedObj.object;
              const label = this.mystate.sphereToLabelMap[sphere.uuid];
              // case 2.1) sphere belongs to already selected label
              if (label === prevLabel && this.state.mode === 'EDITION') {
                // remove line
                const line = this.mystate.sphereToLineMap[sphere.uuid];
                this.mystate.lineGroup.remove(line); // from scene
                label.lines.delete(line); // from label
                // remove sphere
                this.mystate.sphereGroup.remove(sphere); // from scene
                label.spheres.delete(sphere); // from label
                delete this.mystate.sphereToLineMap[sphere.uuid]; // from maps
                delete this.mystate.sphereToLabelMap[sphere.uuid];
                // if label runs out of spheres, delete label as well
                if (label.spheres.size === 0) this.removeSelectedLabel();
                else this.props.labelsChangedCallback(this.labelsToJSON());

              // case 2.2) a different label selected
              } else this.selectLabel(label);
              shouldOrbit = false;

            /* case 3) left click on icon */
            } else if (pickedGroup === this.mystate.iconCircleGroup) {
              const circle = pickedObj.object;
              /* case 3.1) minimize icon */
              if (circle === this.mystate.minimizeIconCircle) this.minimizeSelectedLabel();
              /* case 3.2) delete icon */
              else this.removeSelectedLabel();
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
        && this.state.mode === 'EDITION') {
        /**
         * Conditions:
         * 	1) there is a 3D Model already loaded
         * 	2) labels are enabled
         * 	3) edition is enabled
         *
         * What can happen:
         *  1) first right click on model:
         *  	an initial sphere is dropped in intersection point,
         *  	and a temporary, transparent label will start following the mouse cursor
         *  2) second right click (a temporary label already being dragged)
         *  	2.1) intersection with an already existing label
         *  		the new sphere and line get merged into the existing label
         *  	2.2) no intersection with existing labels
         *  		a new label gets created
         *  	In both cases the dragging cycle of temporary label finishes
         **/

        // -----------------
        // set up raycaster
        this.mystate.mouseClipping.x = (screenX / viewport.offsetWidth) * 2 - 1;
        this.mystate.mouseClipping.y = (screenY / viewport.offsetHeight) * 2 - 1;
        this.mystate.raycaster.setFromCamera(this.mystate.mouseClipping, this.mystate.camera);
        // --------------------------------------------
        // intersect against meshes, spheres, sprite planes, icons
        this.mystate.spritePlaneGroup.visible = true;
        this.mystate.iconCircleGroup.visible = true;
        const intrs = ThreeUtils.getClosestIntersectedObject(
          screenX, screenY, viewport.offsetWidth, viewport.offsetHeight,
          this.mystate.raycaster, this.mystate.camera,
          this.mystate.sphereGroup, this.mystate.meshGroup,
          this.mystate.spritePlaneGroup,
          this.mystate.selectedLabel ? this.mystate.iconCircleGroup : null
        );
        this.mystate.spritePlaneGroup.visible = false;
        this.mystate.iconCircleGroup.visible = false;

        // --------------------------------------------
        // case 2) already dragging a temporary label
        if (this.mystate.draggingTempLabel) {
          const dragLabel = this.mystate.tempDraggableLabel;
          // auxiliar pointer
          let labelToSelect;
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
            labelToSelect = intrsLabel;

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
              id: this.getNextId(),
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
            labelToSelect = labelObj;
            // add new label to set
            this.mystate.labelSet.add(labelObj);
            this.mystate.id2labelMap[labelObj.id] = labelObj;
          }
          //----------------------------------------
          // Things that happen for both cases 2.1 and 2.2
          // --------------------------------
          // select label
          this.selectLabel(labelToSelect);
          // remove dragged elements directly from scene (because they were added
          // directly into scene for temporary dragging purposes)
          this.mystate.scene.remove(dragLabel.sprite);
          this.mystate.scene.remove(dragLabel.sphere);
          this.mystate.scene.remove(dragLabel.line);
          this.mystate.scene.remove(dragLabel.spritePlane);
          // temporary dragging is over
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
            const sphereGeom = new THREE.SphereGeometry(1, 32, 32);
            const material = new THREE.MeshPhongMaterial({
              color: this.props.normalLabelStyle.sphereColor });
            const sphere = new THREE.Mesh(sphereGeom, material);
            const radius = this.mystate.meshDiameter * this.mystate.sphereRadiusCoef;
            sphere.scale.set(radius, radius, radius);
            sphere.position.copy(point);

            // ---------------------------------------------
            // get temporary, transparent label
            const sprite = ThreeUtils.makeTextSprite({
              text: DEFAULT_LABEL_MESSAGE,
              opacity: 0.5,
              worldReferenceSize: this.mystate.meshDiameter,
              params: this.mystate.normalLabelStyle,
            });
            // get camera's normal pointing forward
            const camForwardN = ThreeUtils.getCameraForwardNormal(this.mystate.camera);
            // get dir towards camera
            const dir = new THREE.Vector3()
              .copy(camForwardN)
              .multiplyScalar(-1);
            // get dist
            const dist = this.mystate.meshDiameter * LABEL_DROP_DIST_COEF;
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
            spritePlane.visible = false; // it should be invisible

            // get line connecting the sphere with the label
            const lineGeo = new THREE.Geometry();
            lineGeo.vertices.push(point);
            lineGeo.vertices.push(sprite.position);
            const lineMat = new THREE.LineBasicMaterial({
              color: this.props.normalLabelStyle.lineColor, linewidth: 2 });
            const line = new THREE.Line(lineGeo, lineMat);

            // unselect the previously selected label (if any)
            this.unselectSelectedLabel();

            // add elements into scene
            this.mystate.scene.add(line);
            this.mystate.scene.add(sprite);
            this.mystate.scene.add(sphere);
            this.mystate.scene.add(spritePlane);

            // remember that we are dragging a temporary label
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
  highlightLabel(label) {
    // set text to display according to mode
    // debugger
    let text;
    if (this.state.mode === 'EVALUATION') {
      text = label.student_answer || DEFAULT_EVALUATION_LABEL_MESSAGE;
    } else {
      text = label.text || DEFAULT_LABEL_MESSAGE;
    }
    // set style to label
    this.setLabelStyle(label, { text, worldReferenceSize: this.mystate.meshDiameter,
      style: this.mystate.highlightedLabelStyle });
  }

  /**
   * [shows label as non-highlighted]
   */
  unhighlightLabel(label) {
    // debugger
    // set text to display according to mode
    let text;
    if (this.state.mode === 'EVALUATION') {
      text = label.student_answer || DEFAULT_EVALUATION_LABEL_MESSAGE;
    } else {
      text = label.text || DEFAULT_LABEL_MESSAGE;
    }
    // set style to label
    this.setLabelStyle(label, { text, worldReferenceSize: this.mystate.meshDiameter,
      style: this.mystate.normalLabelStyle });
  }

  /**
   * [resets the color of the spheres, reset the color the lines and
   * reset the sprite's style settings of the given label object]
   */
  setLabelStyle(labelObj, labelSettings) {
    const labelStyle = labelSettings.style;
    // change spheres color
    for (const sphere of labelObj.spheres) sphere.material.color.set(labelStyle.sphereColor);
    // change lines color
    for (const line of labelObj.lines) line.material.color.set(labelStyle.lineColor);
    // remove current sprite
    this.mystate.spriteGroup.remove(labelObj.sprite);
    // create a new sprite
    const newSprite = ThreeUtils.makeTextSprite({
      text: labelSettings.text,
      opacity: labelSettings.opacity,
      worldReferenceSize: labelSettings.worldReferenceSize,
      params: labelSettings.style,
    });
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
    this.mystate.spritePlaneGroup.add(newSpritePlane);
    this.mystate.spritePlaneToLabelMap[newSpritePlane.uuid] = labelObj;
    labelObj.spritePlane = newSpritePlane;
  }

  hideLabels() {
    this.mystate.scene.remove(this.mystate.sphereGroup);
    this.mystate.scene.remove(this.mystate.lineGroup);
    this.mystate.scene.remove(this.mystate.spriteGroup);
    this.mystate.scene.remove(this.mystate.spritePlaneGroup);
    this.mystate.scene.remove(this.mystate.iconCircleGroup);
    this.mystate.scene.remove(this.mystate.iconSpriteGroup);
    this.mystate.labelsEnabled = false;
    this.animateForAWhile(0);
  }

  showLabels() {
    this.mystate.scene.add(this.mystate.sphereGroup);
    this.mystate.scene.add(this.mystate.lineGroup);
    this.mystate.scene.add(this.mystate.spriteGroup);
    this.mystate.scene.add(this.mystate.spritePlaneGroup);
    if (this.mystate.selectedLabel) {
      this.mystate.scene.add(this.mystate.iconCircleGroup);
      this.mystate.scene.add(this.mystate.iconSpriteGroup);
    }
    this.mystate.labelsEnabled = true;
    this.animateForAWhile(0);
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
    delete this.mystate.id2labelMap[label.id];
    this.props.labelsChangedCallback(this.labelsToJSON());
    // check if label was the selectedLabel
    if (label === this.mystate.selectedLabel) {
      this.mystate.selectedLabel = null;
      // interrupt any possible dragging in process
      this.mystate.draggingSelectedLabel = false;
      // remove icons from scene
      this.mystate.scene.remove(this.mystate.iconCircleGroup);
      this.mystate.scene.remove(this.mystate.iconSpriteGroup);
    }
    // refresh scene
    this.animateForAWhile();
  }

  minimizeSelectedLabel() {
    const label = this.mystate.selectedLabel;
    // unselect selected label
    this.mystate.selectedLabel = null;
    this.mystate.canFocusHiddenInput = false;
    this.unhighlightLabel(label);
    // hide everything except spheres
    this.mystate.spriteGroup.remove(label.sprite);
    this.mystate.spritePlaneGroup.remove(label.spritePlane);
    for (const line of label.lines) this.mystate.lineGroup.remove(line);
    this.mystate.scene.remove(this.mystate.iconSpriteGroup);
    this.mystate.scene.remove(this.mystate.iconCircleGroup);
    label.minimized = true; // remember it's minimized
    // reset sphere colors back to normal
    const style = this.mystate.normalLabelStyle;
    for (const sphere of label.spheres) sphere.material.color.set(style.sphereColor);
    // refresh scene
    this.animateForAWhile(0);
  }

  minimizeAllLabels() {
    // special actions for selected label
    const sl = this.mystate.selectedLabel;
    if (sl) {
      // reset sphere colors back to normal
      const style = this.mystate.normalLabelStyle;
      for (const sphere of sl.spheres) sphere.material.color.set(style.sphereColor);
      // unselect selected label
      this.mystate.selectedLabel = null;
      this.mystate.canFocusHiddenInput = false;
      this.unhighlightLabel(sl);
      // hide icons
      this.mystate.scene.remove(this.mystate.iconSpriteGroup);
      this.mystate.scene.remove(this.mystate.iconCircleGroup);
    }
    // minimize all labels
    for (const label of this.mystate.labelSet) {
      if (label.minimized) continue;
      label.minimized = true; // remember it's minimized
      this.mystate.spriteGroup.remove(label.sprite);
      this.mystate.spritePlaneGroup.remove(label.spritePlane);
      for (const line of label.lines) this.mystate.lineGroup.remove(line);
    }
    // refresh scene
    this.animateForAWhile(0);
  }

  maximizeAllLabels() {
    for (const label of this.mystate.labelSet) {
      if (label.minimized) {
        label.minimized = false;
        this.mystate.spriteGroup.add(label.sprite);
        this.mystate.spritePlaneGroup.add(label.spritePlane);
        for (const line of label.lines) this.mystate.lineGroup.add(line);
      }
    }
    // refresh scene
    this.animateForAWhile(0);
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
  onMouseMove(event) {
    this.mystate.mouseViewportCoords = this.getViewportCoords(event);
    const screenX = this.mystate.mouseViewportCoords.x;
    const screenY = this.mystate.mouseViewportCoords.y;
    const viewport = this.refs.viewport;

    // if dragging a temporary label
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
        // refresh icons
        this.refreshIconsPositions();
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
  onMouseUp(event) {
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

  onResize() {
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

  gotFocus() {
    this.mystate.componentFocused = true;
  }
  lostFocus() {
    this.mystate.componentFocused = false;
  }

  onKeydown(e) {
    if (!this.mystate.componentFocused) return;
    const key = e.keyCode;

    if (this.mystate.meshGroup) {
      if (key >= 37 && key <= 40) {
        e.preventDefault();
        let dist;
        let shift;
        const cam = this.mystate.camera;
        switch (key) {
          case 37: // key left
            dist = (cam.right - cam.left) * 0.04 / cam.zoom;
            // dist = 1;
            shift = new THREE.Vector3(dist, 0, 0)
            .applyMatrix4(this.mystate.camera.matrixWorld);
            break;
          case 38: // key up
            dist = (cam.top - cam.bottom) * 0.04 / cam.zoom;
            // dist = 1;
            shift = new THREE.Vector3(0, -dist, 0)
            .applyMatrix4(this.mystate.camera.matrixWorld);
            break;
          case 39: // key right
            dist = (cam.right - cam.left) * 0.04 / cam.zoom;
            shift = new THREE.Vector3(-dist, 0, 0)
            .applyMatrix4(this.mystate.camera.matrixWorld);
            break;
          default: // key down
            dist = (cam.top - cam.bottom) * 0.04 / cam.zoom;
            shift = new THREE.Vector3(0, dist, 0)
            .applyMatrix4(this.mystate.camera.matrixWorld);
            break;
        }
        cam.position.copy(shift);
        this.refs.hiddenTxtInp.blur();
        this.animateForAWhile();
        return;
      }
    }
    if (this.state.mode === 'READONLY' || !this.mystate.labelsEnabled) return;
    if (this.mystate.selectedLabel) {
      if (key === 13) this.unselectSelectedLabel();
      else this.refs.hiddenTxtInp.focus();
    }
  }

  onHiddenTextChanged() {
    console.log('===> onHiddenTextChanged()');
    if (this.state.mode === 'READONLY') return;
    const text = this.refs.hiddenTxtInp.value;
    const label = this.mystate.selectedLabel;
    if (label) {
      if (this.state.mode === 'EDITION') label.text = text;
      else label.student_answer = text; // EVALUATION
      this.highlightLabel(label);
      this.refreshIconsPositions();
      this.animateForAWhile();
      this.mystate.selectedLabelTextDirty = true;
    }
  }

  unselectSelectedLabel() {
    const label = this.mystate.selectedLabel;
    if (label) {
      this.unhighlightLabel(label);
      this.mystate.selectedLabel = null;
      this.mystate.canFocusHiddenInput = false;
      // remove icons from scene
      this.mystate.scene.remove(this.mystate.iconSpriteGroup);
      this.mystate.scene.remove(this.mystate.iconCircleGroup);
      // refresh scene
      this.animateForAWhile(0);
      // if text is dirty, notify parent about it (according to mode)
      if (this.mystate.selectedLabelTextDirty) {
        if (this.state.mode === 'EDTION') {
          this.props.labelsChangedCallback(this.labelsToJSON());
        } else if (this.state.mode === 'EVALUATION') {
          this.props.labelChangedCallback({ id: label.id, text: label.student_answer });
        }
        this.mystate.selectedLabelTextDirty = false;
      }
    }
  }

  selectLabel(label) {
    const prevLabel = this.mystate.selectedLabel;
    if (label !== prevLabel) {
      // unhighlight previous label
      if (prevLabel) this.unhighlightLabel(prevLabel);
      // maximize the label if it was minimized
      if (label.minimized) {
        for (const line of label.lines) this.mystate.lineGroup.add(line);
        label.minimized = false;
      }
      // highlight selected label
      this.mystate.selectedLabel = label;
      this.highlightLabel(label);
      // add icons back to scene and refresh their positions
      this.mystate.scene.add(this.mystate.iconSpriteGroup);
      this.mystate.scene.add(this.mystate.iconCircleGroup);
      this.refreshIconsPositions();
      // refresh scene
      this.animateForAWhile(0);
      // prepare hidden input for writing on it
      setTimeout(() => {
        this.mystate.canFocusHiddenInput = true;
        this.refs.hiddenTxtInp.value =
          (this.state.mode === 'EDITION') ? label.text : label.student_answer;
      }, 0);
    }
  }

  refreshIconsPositions() {
    // debugger
    const label = this.mystate.selectedLabel;
    const bbox = new THREE.BoundingBoxHelper(label.sprite);
    bbox.update();
    const w = bbox.box.max.x - bbox.box.min.x;
    const h = bbox.box.max.y - bbox.box.min.y;
    const quat = this.mystate.camera.quaternion;
    // // update minimize icon's position
    this.mystate.minimizeIconSprite.position
      .set(w * 0.5 + h * 0.02, h * 0.6, 0)
      .applyQuaternion(quat)
      .add(label.sprite.position);
    // and circle
    this.mystate.minimizeIconCircle.position
      .copy(this.mystate.minimizeIconSprite.position);
    this.mystate.minimizeIconCircle.quaternion.copy(quat);

    if (this.state.mode === 'EDITION') {
      // update delete icon's position
      this.mystate.deleteIconSprite.position
        .set(w * 0.5 + h * 0.04 + this.mystate.meshDiameter * ICON_COEF, h * 0.6, 0)
        .applyQuaternion(quat)
        .add(label.sprite.position);
      // and circle
      this.mystate.deleteIconCircle.position
        .copy(this.mystate.deleteIconSprite.position);
      this.mystate.deleteIconCircle.quaternion.copy(quat);
    }
  }

  render() {
    return (
      <div>
        <div
          style={styles.viewport} ref="viewport"
          onWheel={this.handleWheel} onMouseDown={this.onMouseDown}
          onContextMenu={this.handleContextMenu}
        >
        </div>
        <input ref="hiddenTxtInp" onChange={this.onHiddenTextChanged} style={styles.hiddenTxtInp}></input>
      </div>
    );
  }
}

Renderer3D.propTypes = {
  /* ===========================*/
  /* 1) props for for ALL modes */
  /* ===========================*/
  /* --- props to read from (INPUT) ---- */
  mode: React.PropTypes.string.isRequired,
  remoteFiles: React.PropTypes.object,
  labels: React.PropTypes.array,
  highlightedLabelStyle: React.PropTypes.object.isRequired,
  normalLabelStyle: React.PropTypes.object.isRequired,
  sphereRadiusCoef: React.PropTypes.number.isRequired,
  /* --- callback props to notify parent about changes (OUTPUT) --- */
  loadingStartingCallback: React.PropTypes.func.isRequired,
  loadingProgressCallback: React.PropTypes.func.isRequired,
  loadingErrorCallback: React.PropTypes.func.isRequired,
  loadingCompletedCallback: React.PropTypes.func.isRequired,
  downloadCycleStartedCallback: React.PropTypes.func.isRequired,
  downloadCycleFinishedCallback: React.PropTypes.func.isRequired,
  downloadingFileCallback: React.PropTypes.func.isRequired,
  /* ===========================*/
  /* 2) props for EDITION mode  */
  /* ===========================*/
  /* --- callback props to notify parent about changes (OUTPUT) --- */
  labelsChangedCallback: React.PropTypes.func,
  local3DFilesLoadedCallback: React.PropTypes.func,
  /* ==============================*/
  /* 3) props for EVALUATION mode  */
  /* ==============================*/
  /* --- props to read from (INPUT) ---- */
  labelAnswers: React.PropTypes.array,
  labelAnswersDirty: React.PropTypes.bool,
  /* --- callback props to notify parent about changes (OUTPUT) --- */
  labelAnswersConsumedCallback: React.PropTypes.func,
  labelChangedCallback: React.PropTypes.func,
};

const styles = {
  viewport: {
    height: '350px',
  },
  hiddenTxtInp: {
    position: 'absolute',
    overflow: 'hidden',
    width: 0,
    height: 0,
    top: '50%',
    left: '-9999%',
  },
};

function isInt(value) {
  let x;
  return isNaN(value) ? !1 : (x = parseFloat(value), (0 | x) === x);
}
