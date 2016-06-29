/* eslint no-param-reassign:0, react/sort-comp:0, no-console:0 */
import React, { Component } from 'react';
import THREE from 'three';
import MTLLoader from '../../utils/MTLLoader';
import OBJLoader from '../../utils/OBJLoader';
import ThreeUtils from '../../utils/ThreeUtils';
import TouchUtils from '../../utils/touch-utils';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import clone from 'lodash/clone';

// button constants
const LEFT_BUTTON = 0;
const RIGHT_BUTTON = 2;
// default message
const DEFAULT_LABEL_MESSAGE = '...';
const DEFAULT_EVALUATION_LABEL_MESSAGE = '...';
// file extensions
const OBJ_EXT = '.obj';
const MTL_EXT = '.mtl';

const DELETE_ICON_URL = '/img/delete_icon.png';
const MINIMIZE_ICON_URL = '/img/minimize_icon.png';

const ICON_COEF = 1 / 40;
const ICON_RES = 256;
const LABEL_DROP_DIST_COEF = 1 / 7;

// modes
const EVALUATION = 'EVALUATION';
const EDITION = 'EDITION';
const READONLY = 'READONLY';

export default class Renderer3D extends Component {

  static get defaultProps() {
    return {
      filesActuallyUsedCallback: () => {}, // (files) => console.log('files used: ', files),
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
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onWindowMouseDown = this.onWindowMouseDown.bind(this);
    this.animateForAWhile = this.animateForAWhile.bind(this);
    this.highlightLabel = this.highlightLabel.bind(this);
    this.unhighlightLabel = this.unhighlightLabel.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
    this.updateSpritePlaneOrientations = this.updateSpritePlaneOrientations.bind(this);
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

    /* --- Touch Event Handlers --- */
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.orbitCamera = this.orbitCamera.bind(this);

    /* --- API FUNCTIONS (to be used by the parent wrapper component) --- */
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

    // EVALUATION mode
    this.updateLabelAnswers = this.updateLabelAnswers.bind(this);
  }

  componentDidMount() {
    // add event listeners
    window.addEventListener('resize', this.onWindowResize);
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
    renderer.setClearColor(0xecf0f1, 1);
    viewport.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    // initialize scene
    const scene = new THREE.Scene();

    // ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    // camera light
    const cameraLight = new THREE.PointLight(0xffffff, 0.1);
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
    // that we don't want to expose to the client code nor want
    // to imply a re-render of the component into "this._"
    this._ = {
      mode: this.props.mode,
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
      normalLabelStyle: clone(this.props.normalLabelStyle),
      highlightedLabelStyle: clone(this.props.highlightedLabelStyle),
      canFocusHiddenInput: false,
      selectedLabelTextDirty: false,
      lastLabelsJSONScreenshot: null,
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
      // touch state data,
      orbitingCamera_touch: false,
      orbitingCamera_touch_updatePending: false,
      draggingCamera_touch: false,
      draggingCamera_touch_updatePending: false,
      pinching: false,
      pinching_updatePending: false,
      touchCoords1: { x: null, y: null },
      touchCoords2: { x: null, y: null },
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

    /* load source, it must be either remoteFiles (JSON object with urls) or
     localFiles (an array of File objects, e.g: [objFile, mtlFile, imgFile1, imgFile2, ... ]) */
    const { source, labels } = this.props;
    // remote files
    if (source.remoteFiles) {
      this.load3DModelFromUrls(source.remoteFiles)
      .then(() => {
        this.loadLabels(labels);
        this.props.loadingCompletedCallback();
      })
      .catch(error => this.props.loadingErrorCallback(error));
    // local files
    } else if (source.localFiles) {
      this.load3DModelFromFiles(source.localFiles)
      .then(() => {
        this.loadLabels(labels);
        this.props.loadingCompletedCallback();
      })
      .catch(error => this.props.loadingErrorCallback(error));
    // error
    } else {
      throw new Error('No remoteFiles nor localFiles found in this.props.source');
    }
    /* load icons */
    this.loadIconsFromServer();
    /* run animation */
    this.animateForAWhile();
  }

  reloadDeleteIcon() {
    if (this._.deleteIconSprite) {
      this._.iconSpriteGroup.remove(this._.deleteIconSprite);
      this._.iconCircleGroup.remove(this._.deleteIconCircle);
    }
    const iconLength = this._.meshDiameter * ICON_COEF;
    // reload sprite
    this._.deleteIconSprite = (this._.deleteImg) ?
      ThreeUtils.makeImageSprite({  // from loaded image
        img: this._.deleteImg,
        resX: ICON_RES, resY: ICON_RES, worldWidth: iconLength, worldHeight: iconLength }) :
      ThreeUtils.makeDeleteIconSprite({ // manual creation
        resX: ICON_RES, resY: ICON_RES, worldWidth: iconLength, worldHeight: iconLength });
    this._.iconSpriteGroup.add(this._.deleteIconSprite);
    // reload mesh used for collision detection
    const geo = new THREE.CircleGeometry(iconLength * 0.5, 16);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const mesh = new THREE.Mesh(geo, mat);
    this._.deleteIconCircle = mesh;
    this._.iconCircleGroup.add(mesh);
  }

  reloadMinimizeIcon() {
    if (this._.minimizeIconSprite) {
      this._.iconSpriteGroup.remove(this._.minimizeIconSprite);
      this._.iconCircleGroup.remove(this._.minimizeIconCircle);
    }
    const iconLength = this._.meshDiameter * ICON_COEF;
    // reload sprite
    this._.minimizeIconSprite = (this._.minimizeImg) ?
      ThreeUtils.makeImageSprite({  // from loaded image
        img: this._.minimizeImg,
        resX: ICON_RES, resY: ICON_RES, worldWidth: iconLength, worldHeight: iconLength }) :
      ThreeUtils.makeMinimizeIconSprite({ // manual creation
        resX: ICON_RES, resY: ICON_RES, worldWidth: iconLength, worldHeight: iconLength });
    this._.iconSpriteGroup.add(this._.minimizeIconSprite);
    // reload mesh used for collision detection
    const geo = new THREE.CircleGeometry(iconLength * 0.5, 16);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const mesh = new THREE.Mesh(geo, mat);
    this._.minimizeIconCircle = mesh;
    this._.iconCircleGroup.add(mesh);
  }

  reloadIcons() {
    if (this._.mode === EDITION) this.reloadDeleteIcon();
    this.reloadMinimizeIcon();
  }

  loadIconsFromServer() {
    // delete icon
    const deleteImg = new Image();
    deleteImg.onload = () => {
      this._.deleteImg = deleteImg;
      if (this._.meshGroup) this.reloadDeleteIcon();
    };
    deleteImg.src = DELETE_ICON_URL;

    // minimize icon
    const minimizeImg = new Image();
    minimizeImg.onload = () => {
      this._.minimizeImg = minimizeImg;
      if (this._.meshGroup) this.reloadMinimizeIcon();
    };
    minimizeImg.src = MINIMIZE_ICON_URL;
  }

  /** refresh labels with the answers received **/
  updateLabelAnswers(labelAnswers) {
    // refresh each label that needs to be updated
    for (const labelAns of labelAnswers) {
      const label = this._.id2labelMap[labelAns.id];
      if (!label) {
        console.warn(`WARNING: no label with id = ${labelAns.id} found`);
        continue;
      }
      if (typeof labelAns.text !== 'string') continue;
      if (label.student_answer !== labelAns.text) {
        label.student_answer = labelAns.text;
        if (label === this._.selectedLabel) {
          this.refs.hiddenTxtInp.value = labelAns.text;
          this.highlightLabel(label);
          this.refreshIconsPositions();
          this._.selectedLabelTextDirty = false;
        } else {
          this.unhighlightLabel(label);
        }
      }
    }
    // refresh scene
    this.animateForAWhile();
  }

  componentWillReceiveProps(nextProps) {
    if (this._.mode === EDITION && this._.meshGroup) {
      /* check for changes in labels */
      // debugger
      if (!isEqual(this._.lastLabelsJSONScreenshot, nextProps.labels)) {
        this._.highlightedLabelStyle = nextProps.highlightedLabelStyle;
        this._.normalLabelStyle = nextProps.normalLabelStyle;
        this.loadLabels(nextProps.labels);
      } else {
        /* check for changes in highlightedLabelStyle */
        if (!isEqual(this._.highlightedLabelStyle, nextProps.highlightedLabelStyle)) {
          this.setHighlightedLabelStyle(nextProps.highlightedLabelStyle);
        }
        /* check for changes in normalLabelStyle */
        if (!isEqual(this._.normalLabelStyle, nextProps.normalLabelStyle)) {
          this.setNormalLabelStyle(nextProps.normalLabelStyle);
        }
      }
      /* check for changes in SphereRadiusCoef */
      if (this.props.sphereRadiusCoef !== nextProps.sphereRadiusCoef &&
        this._.sphereRadiusCoef !== nextProps.sphereRadiusCoef) {
        this.setSphereRadiusCoef(nextProps.sphereRadiusCoef);
      }
    }
  }

  /** avoid updates altogether (they are not necessary) */
  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    // remove event listeners
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('keydown', this.onKeydown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mousedown', this.onWindowMouseDown);
    // abort any pending xhr requests
    for (const xhr of this._.pendingXHRs) {
      xhr.abortAndRejectPromise('Fetch interrupted because the 3d renderer has been unmounted');
    }
    // set flag to interrupt any loadings
    this._.loadingInterrupter = {
      stop: true, reason: 'Loading interrupted because the 3d renderer has been unmounted' };
  }

  /** function to update the 3D scene */
  threeUpdate() {
    // if no mesh has been set yet, abort updates
    if (this._.meshGroup === null) return;

    /* ============= */
    /* MOUSE UPDATES */
    /* ============= */

    /* zoom */
    if (this._.updateCameraZoom) {
      // get viewport's dimensions
      const width = this.refs.viewport.offsetWidth;
      const height = this.refs.viewport.offsetHeight;
      // get mouse's world coords before zoom update
      const mw1 = ThreeUtils.unprojectFromScreenToWorld(
        this._.mouseViewportCoords.x,
        this._.mouseViewportCoords.y,
        width, height, this._.camera
      );
      // update zoom
      this._.camera.zoom = this._.zoom;
      this._.camera.updateProjectionMatrix();
      this._.updateCameraZoom = false;
      // get mouse's world coords after zoom update
      const mw2 = ThreeUtils.unprojectFromScreenToWorld(
        this._.mouseViewportCoords.x,
        this._.mouseViewportCoords.y,
        width, height, this._.camera
      );
      // get shift vector to update camera's position, light and target
      const shift = mw1.sub(mw2);
      this._.camera.position.add(shift);
      this._.cameraLight.position.copy(this._.camera.position);
      const target = (new THREE.Vector3(0, 0, -1)).applyMatrix4(this._.camera.matrixWorld);
      target.add(shift);
      this._.camera.lookAt(target);

    /* orbit */
    } else if (this._.cameraOrbitUpdatePending) {
      this.orbitCamera(this._.mouseLeft1, this._.mouseLeft2);
      this._.mouseLeft1.x = this._.mouseLeft2.x;
      this._.mouseLeft1.y = this._.mouseLeft2.y;
      this._.cameraOrbitUpdatePending = false;
    }

    /* ============= */
    /* TOUCH UPDATES */
    /* ============= */

    /* pinching (zoom) */
    if (this._.pinching_updatePending) {
      const deltaDist = this._.pinchDist2 - this._.pinchDist1;
      // get viewport's dimensions
      const width = this.refs.viewport.offsetWidth;
      const height = this.refs.viewport.offsetHeight;
      // get viewport coords of pinch center
      const center = this._.pinchCenter;
      const coords = this.getViewportCoords(center.x, center.y);
      // get mouse's world coords before zoom update
      const mw1 = ThreeUtils.unprojectFromScreenToWorld(
        coords.x, coords.y, width, height, this._.camera);
      // update zoom
      let minD = Math.min(width, height);
      minD *= minD;
      const factor = 1 + deltaDist / minD;
      let zoom = this._.camera.zoom;
      zoom *= factor;
      if (zoom < 0.01) zoom = 0.01;
      this._.camera.zoom = zoom;
      this._.camera.updateProjectionMatrix();
      this._.updateCameraZoom = false;
      // get mouse's world coords after zoom update
      const mw2 = ThreeUtils.unprojectFromScreenToWorld(
        coords.x, coords.y, width, height, this._.camera);
      // get shift vector to update camera's position, light and target
      const shift = mw1.sub(mw2);
      this._.camera.position.add(shift);
      this._.cameraLight.position.copy(this._.camera.position);
      const target = (new THREE.Vector3(0, 0, -1)).applyMatrix4(this._.camera.matrixWorld);
      target.add(shift);
      this._.camera.lookAt(target);

      this._.pinching_updatePending = false;

    /* orbiting camera */
    } else if (this._.orbitingCamera_touch_updatePending) {
      this.orbitCamera(this._.touchCoords1, this._.touchCoords2);
      this._.touchCoords1.x = this._.touchCoords2.x;
      this._.touchCoords1.y = this._.touchCoords2.y;
      this._.orbitingCamera_touch_updatePending = false;

    /* dragging camera */
    } else if (this._.draggingCamera_touch_updatePending) {
      const cam = this._.camera;
      const dx = (this._.touchCoords2.x - this._.touchCoords1.x) * 0.08 / cam.zoom;
      const dy = (this._.touchCoords2.y - this._.touchCoords1.y) * 0.08 / cam.zoom;
      cam.position.set(-dx, dy, 0).applyMatrix4(cam.matrixWorld);
      this._.draggingCamera_touch_updatePending = false;
    }
  }

  orbitCamera(coords1, coords2) {
    // get viewport's dimensions
    const width = this.refs.viewport.offsetWidth;
    const height = this.refs.viewport.offsetHeight;
    // convert previous screen coords into world coords
    const w1 = ThreeUtils.unprojectFromScreenToWorld(
      coords1.x, coords1.y, width, height, this._.camera);
    // convert current screen coords into world coords
    const w2 = ThreeUtils.unprojectFromScreenToWorld(
      coords2.x, coords2.y, width, height, this._.camera);
    // get diff vectors
    const v01 = (new THREE.Vector3()).subVectors(w1, this._.meshCenter);
    const v12 = (new THREE.Vector3()).subVectors(w2, w1);

    if (!ThreeUtils.isZero(v01) && !ThreeUtils.isZero(v12)) {
      // compute axis
      const axis = (new THREE.Vector3()).crossVectors(v01, v12);
      axis.normalize();

      // compute angle
      let xx = (coords2.x - coords1.x);
      xx *= xx;
      let yy = (coords2.y - coords1.y);
      yy *= yy;
      const angle = 0.003 + Math.min(0.4, (xx + yy) / 100);

      // set quaternion
      const quat = new THREE.Quaternion();
      quat.setFromAxisAngle(axis, angle);

      // rotate camera's position
      this._.camera.position
        .sub(this._.meshCenter)
        .applyQuaternion(quat)
        .add(this._.meshCenter);

      // rotate camera's target
      const target = (new THREE.Vector3(0, 0, -1)).applyMatrix4(this._.camera.matrixWorld);
      target
        .sub(this._.meshCenter)
        .applyQuaternion(quat)
        .add(this._.meshCenter);

      // rotate camera's up
      const up = (new THREE.Vector3(0, 1, 0)).applyMatrix4(this._.camera.matrixWorld);
      up.sub(this._.meshCenter)
      .applyQuaternion(quat)
      .add(this._.meshCenter)
      .sub(this._.camera.position);

      // set camera's up and target
      this._.camera.up.copy(up);
      this._.camera.lookAt(target);

      // update camera's light's position
      this._.cameraLight.position.copy(this._.camera.position);

      // update orientation of sprite planes
      this.updateSpritePlaneOrientations();

      // if there is a selected label, refresh icons
      if (this._.selectedLabel) this.refreshIconsPositions();
    }
  }

  /**
   * [threeRender : renders the scene]
   */
  threeRender() {
    const renderer = this._.renderer;
    const camera = this._.camera;
    // render scene
    renderer.render(this._.scene, camera);
  }

  /**
   * [threeAnimate : updates and renders the scene]
   */
  threeAnimate() {
    if (this._.updateTimerRunning) {
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
      this._.loadingInterrupter,
      this.onFileDownloadStarted)
    .then(({ materials }) => {
      if (this._.loadingInterrupter.stop) {
        throw new Error(this._.loadingInterrupter.reason);
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
        this._.loadingInterrupter
      );
    })
    .then((meshGroup) => {
      if (this._.loadingInterrupter.stop) {
        throw new Error(this._.loadingInterrupter.reason);
      }
      // on success, proceed to incorporte the meshes into the scene
      // and render them
      this.loadMeshGroup(meshGroup);
    });
  }

  onXHRCreated(xhr) {
    this._.pendingXHRs.add(xhr);
  }
  onXHRDone(xhr) {
    this._.pendingXHRs.delete(xhr);
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
    const textureFiles = {};

    // ------------------------------------------------
    // iterate through files and select them according
    // to their file extension
    files.forEach(file => {
      const fname = file.name;

      if (fname.length > OBJ_EXT.length &&
        fname.substr(fname.length - OBJ_EXT.length, fname.length)
        .toLowerCase() === OBJ_EXT) {
        objFile = file.blob; // obj file
      } else if (fname.length > MTL_EXT.length &&
        fname.substr(fname.length - MTL_EXT.length, fname.length)
        .toLowerCase() === MTL_EXT) {
        mtlFile = file.blob; // mtl file
      } else {
        // map filename to file and path
        textureFiles[fname] = file.blob;
        texturePaths[fname] = URL.createObjectURL(file.blob);
      }
    });

    // ---------------------------------
    // parse MTL and OBJ files
    // ---------------------------------
    if (mtlFile === null) return Promise.reject('mtl file not found');
    if (objFile === null) return Promise.reject('obj file not found');

    let textureFilesUsed;

    this.props.downloadCycleStartedCallback();
    this.onFileDownloadStarted(URL.createObjectURL(mtlFile));
    // use MTLLoader to load materials from MTL file
    return MTLLoader.loadMaterialsFromFile(
      mtlFile, texturePaths,
      this._.loadingInterrupter,
      this.onFileDownloadStarted)
    .then(({ materials, textureNamesUsed }) => {
      // collect files actually used
      textureFilesUsed = textureNamesUsed.map(name => textureFiles[name]);
      if (this._.loadingInterrupter.stop) {
        throw new Error(this._.loadingInterrupter.reason);
      }
      this.props.downloadCycleFinishedCallback();
      // on success, proceed to use the OBJLoader to load the 3D objects from OBJ file
      return OBJLoader.loadObjectsFromFile(
        objFile, materials,
        (lengthSoFar, totalLength) =>
          this.props.loadingProgressCallback(
            `Loading OBJ file ${objFile.name} ...`, lengthSoFar, totalLength),
        this._.loadingInterrupter);
    })
    .then((meshGroup) => {
      if (this._.loadingInterrupter.stop) {
        throw new Error(this._.loadingInterrupter.reason);
      }
      // load the meshes into the scene and render them
      this.loadMeshGroup(meshGroup);
      this.props.filesActuallyUsedCallback({ obj: objFile, mtl: mtlFile, images: textureFilesUsed });
    });
  }

  loadMeshGroup(meshGroup) {
    // compute bounding box
    this._.boundingBox = ThreeUtils.getMeshesBoundingBox(meshGroup.children);
    // compute the center
    this._.meshCenter
      .copy(this._.boundingBox.min)
      .add(this._.boundingBox.max)
      .multiplyScalar(0.5);
    // compute the mesh diameter
    this._.meshDiameter =
      this._.boundingBox.min.distanceTo(this._.boundingBox.max);
    /** remove from scene both meshes and labels */
    if (this._.meshGroup !== null) {
      // remove meshes
      for (let i = this._.meshGroup.children.length - 1; i >= 0; --i) {
        const mesh = this._.meshGroup.children[i];
        this._.meshGroup.remove(mesh);
      }
      // remove labels
      this.clearAllLabelData();
      // notify parent of changes in labels
      if (this._.mode === EDITION) this.onLabelsChanged();
    }
    // set the new meshGroup
    this._.meshGroup = meshGroup;
    // add to scene
    this._.scene.add(meshGroup);
    // reenable labels
    this._.scene.remove(this._.sphereGroup);
    this._.scene.remove(this._.lineGroup);
    this._.scene.remove(this._.spriteGroup);
    this._.scene.remove(this._.spritePlaneGroup);
    this._.scene.add(this._.sphereGroup);
    this._.scene.add(this._.lineGroup);
    this._.scene.add(this._.spriteGroup);
    this._.scene.add(this._.spritePlaneGroup);
    this._.labelsEnabled = true;
    // reload icons
    this.reloadIcons();
    // run animation cycle to reflect changes on the screen
    this.animateForAWhile(0);
    // refocus the camera on the model
    setTimeout(() => !this._.loadingInterrupter.stop && this.refocusOnModel(), 100);
  }

  /**
   * [Clear all data structures used internally for labels]
   */
  clearAllLabelData() {
    // clear lines
    for (let i = this._.lineGroup.children.length - 1; i >= 0; --i) {
      const line = this._.lineGroup.children[i];
      this._.lineGroup.remove(line);
    }
    // clear sprites
    for (let i = this._.spriteGroup.children.length - 1; i >= 0; --i) {
      const sprite = this._.spriteGroup.children[i];
      this._.spriteGroup.remove(sprite);
    }
    // clear sprite planes
    for (let i = this._.spritePlaneGroup.children.length - 1; i >= 0; --i) {
      const splane = this._.spritePlaneGroup.children[i];
      this._.spritePlaneGroup.remove(splane);
    }
    // clear spheres
    for (let i = this._.sphereGroup.children.length - 1; i >= 0; --i) {
      const sphere = this._.sphereGroup.children[i];
      this._.sphereGroup.remove(sphere);
    }
    // clear icons
    this._.scene.remove(this._.iconSpriteGroup);
    this._.scene.remove(this._.iconCircleGroup);
    // clear other structures
    this._.labelSet.clear();
    this._.spritePlaneToLabelMap = {};
    this._.sphereToLineMap = {};
    this._.sphereToLabelMap = {};
    // no selected label anymore
    this._.selectedLabel = null;
    this.draggingSelectedLabel = false;
  }

  /**
   * Receives an array of labels in JSON format, and then loads them
   * as 3D labels that show up on the screen
   */
  loadLabels(labels) {
    // remove all existing labels
    this.clearAllLabelData();
    // update last screen
    this._.lastLabelsJSONScreenshot = labels ? cloneDeep(labels) : [];

    /* stop all dragging related interactivity */
    if (this._.draggingTempLabel) {
      const dragLabel = this._.tempDraggableLabel;
      // remove dragged elements from scene
      this._.scene.remove(dragLabel.sprite);
      this._.scene.remove(dragLabel.sphere);
      this._.scene.remove(dragLabel.line);
      this._.scene.remove(dragLabel.spritePlane);
      // temporary dragging is over
      this._.tempDraggableLabel = null;
      this._.draggingTempLabel = false;
    }
    this._.selectedLabelPositionDirty = false;
    this._.draggingSelectedLabel = false;

    // load new labels
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
          const radius = this._.meshDiameter * this._.sphereRadiusCoef;
          const sphereGeom = new THREE.SphereGeometry(1, 32, 32);
          const material = new THREE.MeshPhongMaterial({
            color: this.props.normalLabelStyle.sphereColor });
          const sphere = new THREE.Mesh(sphereGeom, material);
          sphere.scale.set(radius, radius, radius);
          sphere.position.copy(point);
          spheres.add(sphere);
          this._.sphereGroup.add(sphere);
          this._.sphereToLabelMap[sphere.uuid] = labelObj;
          // line
          const lineGeo = new THREE.Geometry();
          lineGeo.vertices.push(point);
          lineGeo.vertices.push(label.position);
          const lineMat = new THREE.LineBasicMaterial({
            color: this.props.normalLabelStyle.lineColor, linewidth: 2 });
          const line = new THREE.Line(lineGeo, lineMat);
          lines.add(line);
          this._.sphereToLineMap[sphere.uuid] = line;
          if (this._.mode !== EVALUATION) this._.lineGroup.add(line);
        });
        /** sprite */
        const text = (this._.mode === EVALUATION) ? '' : label.text;
        const sprite = ThreeUtils.makeTextSprite({
          text: text || DEFAULT_LABEL_MESSAGE,
          opacity: 1,
          worldReferenceSize: this._.meshDiameter,
          params: this._.normalLabelStyle,
        });
        sprite.position.set(label.position.x, label.position.y, label.position.z);
        if (this._.mode !== EVALUATION) this._.spriteGroup.add(sprite);
        /** sprite plane */
        const spritePlane =
          ThreeUtils.createPlaneFromSprite(sprite, this._.camera);
        this._.spritePlaneToLabelMap[spritePlane.uuid] = labelObj;
        if (this._.mode !== EVALUATION) this._.spritePlaneGroup.add(spritePlane);
        /** set labelObj's fields */
        labelObj.spheres = spheres;
        labelObj.lines = lines;
        labelObj.spritePlane = spritePlane;
        labelObj.sprite = sprite;
        labelObj.text = label.text;
        labelObj.id = label.id;
        if (this._.mode === EVALUATION) {
          labelObj.minimized = true;
          labelObj.student_answer = '';
        }
        /** add label to set */
        this._.labelSet.add(labelObj);
      });
    }
    // correct label ids
    this.checkAndCorrectLabelIds();
    // refresh screen
    this.animateForAWhile();
  }

  getNextId() {
    let i = 0;
    while (this._.labelIds.has(i)) ++i;
    this._.labelIds.add(i);
    return i;
  }

  checkAndCorrectLabelIds() {
    const labelIds = this._.labelIds;
    const labelSet = this._.labelSet;
    labelIds.clear();
    this._.id2labelMap = {};
    for (const label of labelSet) {
      if (isInt(label.id)) {
        const id = parseInt(label.id, 10);
        if (id < 0 || labelIds.has(id)) label.id = null;
        else labelIds.add(id);
      }
    }
    for (const label of labelSet) if (!isInt(label.id)) label.id = this.getNextId();
    for (const label of labelSet) this._.id2labelMap[label.id] = label;
  }

  // ======================================================

  // ==============
  // API FUNCTIONS
  // ==============

  /**
   * [refocusOnModel : center camera on model]
   */
  refocusOnModel() {
    if (this._.meshGroup !== null) {
      ThreeUtils.centerCameraOnBoundingBox(
        this._.camera,
        this._.cameraLight,
        this._.boundingBox,
        this.refs.viewport.offsetWidth,
        this.refs.viewport.offsetHeight
      );
      this._.zoom = this._.camera.zoom; // keep the zoom up to date
      this.updateSpritePlaneOrientations();
      if (this._.selectedLabel) this.refreshIconsPositions();
      this.animateForAWhile();
    }
  }

  /**
   * Starts the update and render (animation) cycle for @milliseconds milliseconds
   * The purpose is to ensure that updates and rendering are performed
   * only when it's necessary, and not all the time
   */
  animateForAWhile(milliseconds = 200) {
    if (this._.updateTimerRunning) return; // already running? ignore
    if (this._.componentUnmounted) return; // unmounted ? ignore
    this._.updateTimerRunning = true;
    // start the animation cycle
    this.threeAnimate();
    // start timer to stop the animation cycle when time is over
    setTimeout(() => {
      this._.updateTimerRunning = false;
    }, milliseconds);
  }

  /**
   * Handle wheel events
   */
  handleWheel(event) {
    if (this._.canvasHasFocus) {
      event.preventDefault();
      if (event.deltaY < 0) { // zoom in
        this._.zoom *= 1.05;
      } else { // zoom out
        this._.zoom *= 0.95;
        if (this._.zoom < 0.01) this._.zoom = 0.01;
      }
      this._.updateCameraZoom = true;
      this.animateForAWhile();
    }
  }

  /**
   * [sets the new style for normal labels and
   * refreshes the scene]
   */
  setNormalLabelStyle(style) {
    this._.normalLabelStyle = clone(style);
    if (this._.labelSet.size > 0) {
      for (const label of this._.labelSet) {
        if (label === this._.selectedLabel || label.minimized) continue;
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
    this._.highlightedLabelStyle = clone(style);
    if (this._.selectedLabel) {
      this.highlightLabel(this._.selectedLabel);
      this.refreshIconsPositions();
      this.animateForAWhile();
    }
  }

  setSphereRadiusCoef(coef) {
    this._.sphereRadiusCoef = coef;
    if (this._.meshGroup) {
      const r = coef * this._.meshDiameter;
      for (const sphere of this._.sphereGroup.children) sphere.scale.set(r, r, r);
    }
    this.animateForAWhile();
  }

  onLabelsChanged() {
    const json = this.labelsToJSON();
    this._.lastLabelsJSONScreenshot = json;
    this.props.labelsChangedCallback(json);
  }

  onWindowMouseDown() {
    // update canvasHasFocus
    this._.canvasHasFocus = this.isMouseOverViewport();
  }

  /**
   * Handle mouse down events
   */
  onMouseDown(event) {
    const viewport = this.refs.viewport;
    const vpcoords = this.getViewportCoords(event.clientX, event.clientY);
    const screenX = vpcoords.x;
    const screenY = vpcoords.y;

    if (event.button === LEFT_BUTTON) {
      if (this._.meshGroup !== null && !this._.draggingTempLabel) {
        // we check if the click interacts we existing labels only
        // if they are enabled, otherwise the default behaviour
        // is to start orbiting the camera
        let shouldOrbit = true;
        if (this._.labelsEnabled) {
          // make sprite planes visible for intersection
          this._.spritePlaneGroup.visible = true;
          this._.iconCircleGroup.visible = true;
          // check intersection with sprite planes, spheres and meshes
          const intrs = ThreeUtils.getClosestIntersectedObject(
            screenX, screenY, viewport.offsetWidth, viewport.offsetHeight,
            this._.raycaster, this._.camera,
            this._.sphereGroup, this._.meshGroup,
            this._.spritePlaneGroup,
            this._.selectedLabel ? this._.iconCircleGroup : null
          );
          // make sprite planes invisible again
          this._.spritePlaneGroup.visible = false;
          this._.iconCircleGroup.visible = false;

          if (intrs) {
            const pickedObj = intrs.object;
            const pickedGroup = intrs.group;
            const prevLabel = this._.selectedLabel;

            // case 1) sprite plane intersected
            if (pickedGroup === this._.spritePlaneGroup) {
              // select label
              const label = this._.spritePlaneToLabelMap[pickedObj.object.uuid];
              this.selectLabel(label);
              if (this._.mode === EDITION) {
                /** starts dragging the label */
                this._.draggingSelectedLabel = true;
                // plane parameters where dragging will happen
                this._.dragPlane.normal =
                  ThreeUtils.getCameraForwardNormal(this._.camera);
                this._.dragPlane.position = label.sprite.position;

                this.refs.hiddenTxtInp.value = label.text;
                // no orbits
                shouldOrbit = false;
              }

            // case 2) sphere intersected
            } else if (pickedGroup === this._.sphereGroup) {
              const sphere = pickedObj.object;
              const label = this._.sphereToLabelMap[sphere.uuid];
              // case 2.1) sphere belongs to already selected label
              if (label === prevLabel && this._.mode === EDITION) {
                // remove line
                const line = this._.sphereToLineMap[sphere.uuid];
                this._.lineGroup.remove(line); // from scene
                label.lines.delete(line); // from label
                // remove sphere
                this._.sphereGroup.remove(sphere); // from scene
                label.spheres.delete(sphere); // from label
                delete this._.sphereToLineMap[sphere.uuid]; // from maps
                delete this._.sphereToLabelMap[sphere.uuid];
                // if label runs out of spheres, delete label as well
                if (label.spheres.size === 0) this.removeSelectedLabel();
                else this.onLabelsChanged();

              // case 2.2) a different label selected
              } else this.selectLabel(label);
              shouldOrbit = false;

            /* case 3) left click on icon */
            } else if (pickedGroup === this._.iconCircleGroup) {
              const circle = pickedObj.object;
              /* case 3.1) minimize icon */
              if (circle === this._.minimizeIconCircle) this.minimizeSelectedLabel();
              /* case 3.2) delete icon */
              else this.removeSelectedLabel();
              shouldOrbit = false;
            }
          }
        }
        if (shouldOrbit) {
          // initiate a camera orbit around 3D Model
          this._.orbitingCamera = true;
          this._.mouseLeft1.x = screenX;
          this._.mouseLeft1.y = screenY;
        }
        // refresh canvas
        this.animateForAWhile();
      }
    } else if (event.button === RIGHT_BUTTON) {
      if (this._.meshGroup !== null && this._.labelsEnabled
        && this._.mode === EDITION) {
        // -----------------
        // set up raycaster
        this._.mouseClipping.x = (screenX / viewport.offsetWidth) * 2 - 1;
        this._.mouseClipping.y = (screenY / viewport.offsetHeight) * 2 - 1;
        this._.raycaster.setFromCamera(this._.mouseClipping, this._.camera);
        // --------------------------------------------
        // intersect against meshes, spheres, sprite planes, icons
        this._.spritePlaneGroup.visible = true;
        this._.iconCircleGroup.visible = true;
        const intrs = ThreeUtils.getClosestIntersectedObject(
          screenX, screenY, viewport.offsetWidth, viewport.offsetHeight,
          this._.raycaster, this._.camera,
          this._.sphereGroup, this._.meshGroup,
          this._.spritePlaneGroup,
          this._.selectedLabel ? this._.iconCircleGroup : null
        );
        this._.spritePlaneGroup.visible = false;
        this._.iconCircleGroup.visible = false;

        // --------------------------------------------
        // case 1) already dragging a temporary label
        if (this._.draggingTempLabel) {
          const dragLabel = this._.tempDraggableLabel;
          // auxiliar pointer
          let labelToSelect;
          // ----------------------------------------
          // case 1.1) existing label intersected:
          // temp label gets merged into it
          if (intrs && intrs.group === this._.spritePlaneGroup) {
            // -----
            const splane = intrs.object.object; // intesected plane
            // we get label from plane
            const intrsLabel = this._.spritePlaneToLabelMap[splane.uuid];
            // add sphere and line into intersected label
            intrsLabel.spheres.add(dragLabel.sphere);
            intrsLabel.lines.add(dragLabel.line);
            // match sphere with the intersected label and line
            this._.sphereToLabelMap[dragLabel.sphere.uuid] = intrsLabel;
            this._.sphereToLineMap[dragLabel.sphere.uuid] = dragLabel.line;
            // update line so that it points to the intersected label
            const lineGeo = dragLabel.line.geometry;
            lineGeo.dynamic = true;
            lineGeo.vertices.length = 1;
            lineGeo.vertices.push(intrsLabel.sprite.position);
            lineGeo.verticesNeedUpdate = true;
            // add elements into structures so they show up in scene
            this._.sphereGroup.add(dragLabel.sphere);
            this._.lineGroup.add(dragLabel.line);
            // set label to highlight
            labelToSelect = intrsLabel;

          // -----------------------------------------
          // case 1.2) no existing label intersected:
          // temp label becomes a brand new label
          } else {
            // set up spheres and lines as sets
            const spheres = new Set();
            spheres.add(dragLabel.sphere);
            const lines = new Set();
            lines.add(dragLabel.line);
            // update spritePlane
            dragLabel.spritePlane.position.copy(dragLabel.sprite.position);
            dragLabel.spritePlane.quaternion.copy(this._.camera.quaternion);
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
            this._.sphereToLabelMap[dragLabel.sphere.uuid] = labelObj;
            this._.sphereToLineMap[dragLabel.sphere.uuid] = dragLabel.line;
            this._.spritePlaneToLabelMap[dragLabel.spritePlane.uuid] = labelObj;
            // add elements into structures so they show up in scene
            this._.spritePlaneGroup.add(dragLabel.spritePlane);
            this._.spriteGroup.add(dragLabel.sprite);
            this._.sphereGroup.add(dragLabel.sphere);
            this._.lineGroup.add(dragLabel.line);
            // set label to highlight
            labelToSelect = labelObj;
            // add new label to set
            this._.labelSet.add(labelObj);
            this._.id2labelMap[labelObj.id] = labelObj;
          }
          //----------------------------------------
          // Things that happen for both cases 1.1 and 1.2
          // --------------------------------
          // select label
          this.selectLabel(labelToSelect);
          // remove dragged elements directly from scene (because they were added
          // directly into scene for temporary dragging purposes)
          this._.scene.remove(dragLabel.sprite);
          this._.scene.remove(dragLabel.sphere);
          this._.scene.remove(dragLabel.line);
          this._.scene.remove(dragLabel.spritePlane);
          // temporary dragging is over
          this._.tempDraggableLabel = null;
          this._.draggingTempLabel = false;
          // and notify parent of changes in labels
          this.onLabelsChanged();
          // refresh scene
          this.animateForAWhile();

        // ------------------------------------------
        // Case 2): we were not dragging anything
        // so this is the first right click to start
        // adding a new label
        } else {
          // if we intersected a mesh
          if (intrs && intrs.group === this._.meshGroup) {
            // -------------
            // get sphere
            const point = intrs.object.point;
            const sphereGeom = new THREE.SphereGeometry(1, 32, 32);
            const material = new THREE.MeshPhongMaterial({
              color: this.props.normalLabelStyle.sphereColor });
            const sphere = new THREE.Mesh(sphereGeom, material);
            const radius = this._.meshDiameter * this._.sphereRadiusCoef;
            sphere.scale.set(radius, radius, radius);
            sphere.position.copy(point);

            // ---------------------------------------------
            // get temporary, transparent label
            const sprite = ThreeUtils.makeTextSprite({
              text: DEFAULT_LABEL_MESSAGE,
              opacity: 0.5,
              worldReferenceSize: this._.meshDiameter,
              params: this._.normalLabelStyle,
            });
            // get camera's normal pointing forward
            const camForwardN = ThreeUtils.getCameraForwardNormal(this._.camera);
            // get dir towards camera
            const dir = new THREE.Vector3()
              .copy(camForwardN)
              .multiplyScalar(-1);
            // get dist
            const dist = this._.meshDiameter * LABEL_DROP_DIST_COEF;
            // position sprite
            sprite.position
              .copy(point)
              .addScaledVector(dir, dist);

            // save plane's parameters where label was dropped,
            // intended to be used for dragging purposes
            this._.dragPlane.normal = camForwardN;
            this._.dragPlane.position = sprite.position;

            // get plane from sprite (for intersection purposes),
            // not the same as the previous one
            const spritePlane = ThreeUtils.createPlaneFromSprite(sprite, this._.camera);
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
            this._.scene.add(line);
            this._.scene.add(sprite);
            this._.scene.add(sphere);
            this._.scene.add(spritePlane);

            // remember that we are dragging a temporary label
            const labelObj = { sprite, spritePlane, sphere, line, text: '' };
            this._.tempDraggableLabel = labelObj;
            this._.draggingTempLabel = true;

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
    const quat = this._.camera.quaternion;
    this._.spritePlaneGroup.children.forEach((p) => p.quaternion.copy(quat));
  }

  /**
   * [shows label as highlighted]
   */
  highlightLabel(label) {
    // set text to display according to mode
    // debugger
    let text;
    if (this._.mode === EVALUATION) {
      text = label.student_answer || DEFAULT_EVALUATION_LABEL_MESSAGE;
    } else {
      text = label.text || DEFAULT_LABEL_MESSAGE;
    }
    // set style to label
    this.setLabelStyle(label, { text, worldReferenceSize: this._.meshDiameter,
      style: this._.highlightedLabelStyle });
  }

  /**
   * [shows label as non-highlighted]
   */
  unhighlightLabel(label) {
    // debugger
    // set text to display according to mode
    let text;
    if (this._.mode === EVALUATION) {
      text = label.student_answer || DEFAULT_EVALUATION_LABEL_MESSAGE;
    } else {
      text = label.text || DEFAULT_LABEL_MESSAGE;
    }
    // set style to label
    this.setLabelStyle(label, { text, worldReferenceSize: this._.meshDiameter,
      style: this._.normalLabelStyle });
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
    // create a new sprite
    const newSprite = ThreeUtils.makeTextSprite({
      text: labelSettings.text,
      opacity: labelSettings.opacity,
      worldReferenceSize: labelSettings.worldReferenceSize,
      params: labelSettings.style,
    });
    // copy previous position
    newSprite.position.copy(labelObj.sprite.position);
    // create new spritePlane
    const newSpritePlane =
      ThreeUtils.createPlaneFromSprite(newSprite, this._.camera);
    // replace old with new
    if (!labelObj.minimized) {
      this._.spriteGroup.remove(labelObj.sprite);
      this._.spritePlaneGroup.remove(labelObj.spritePlane);
      this._.spritePlaneGroup.add(newSpritePlane);
      this._.spriteGroup.add(newSprite);
    }
    delete this._.spritePlaneToLabelMap[labelObj.spritePlane.uuid];
    this._.spritePlaneToLabelMap[newSpritePlane.uuid] = labelObj;
    labelObj.spritePlane = newSpritePlane;
    labelObj.sprite = newSprite;
  }

  hideLabels() {
    this._.scene.remove(this._.sphereGroup);
    this._.scene.remove(this._.lineGroup);
    this._.scene.remove(this._.spriteGroup);
    this._.scene.remove(this._.spritePlaneGroup);
    this._.scene.remove(this._.iconCircleGroup);
    this._.scene.remove(this._.iconSpriteGroup);
    this._.labelsEnabled = false;
    this.animateForAWhile(0);
  }

  showLabels() {
    this._.scene.add(this._.sphereGroup);
    this._.scene.add(this._.lineGroup);
    this._.scene.add(this._.spriteGroup);
    this._.scene.add(this._.spritePlaneGroup);
    if (this._.selectedLabel) {
      this._.scene.add(this._.iconCircleGroup);
      this._.scene.add(this._.iconSpriteGroup);
    }
    this._.labelsEnabled = true;
    this.animateForAWhile(0);
  }

  removeSelectedLabel() {
    this.removeLabel(this._.selectedLabel);
  }

  removeLabel(label) {
    if (!label) return;
    // remove sprite
    this._.spriteGroup.remove(label.sprite);
    // remove sprite plane
    this._.spritePlaneGroup.remove(label.spritePlane);
    delete this._.spritePlaneToLabelMap[label.spritePlane.uuid];
    // remove spheres
    for (const sphere of label.spheres) {
      this._.sphereGroup.remove(sphere);
      delete this._.sphereToLineMap[sphere.uuid];
      delete this._.sphereToLabelMap[sphere.uuid];
    }
    // remove lines
    for (const line of label.lines) {
      this._.lineGroup.remove(line);
    }
    // remove label
    this._.labelSet.delete(label);
    delete this._.id2labelMap[label.id];
    this.onLabelsChanged();
    // check if label was the selectedLabel
    if (label === this._.selectedLabel) {
      this._.selectedLabel = null;
      // interrupt any possible dragging in process
      this._.draggingSelectedLabel = false;
      // remove icons from scene
      this._.scene.remove(this._.iconCircleGroup);
      this._.scene.remove(this._.iconSpriteGroup);
    }
    // refresh scene
    this.animateForAWhile();
  }

  minimizeSelectedLabel() {
    const label = this._.selectedLabel;
    // unselect selected label
    this._.selectedLabel = null;
    this._.canFocusHiddenInput = false;
    this.unhighlightLabel(label);
    // hide everything except spheres
    this._.spriteGroup.remove(label.sprite);
    this._.spritePlaneGroup.remove(label.spritePlane);
    for (const line of label.lines) this._.lineGroup.remove(line);
    this._.scene.remove(this._.iconSpriteGroup);
    this._.scene.remove(this._.iconCircleGroup);
    label.minimized = true; // remember it's minimized
    // reset sphere colors back to normal
    const style = this._.normalLabelStyle;
    for (const sphere of label.spheres) sphere.material.color.set(style.sphereColor);
    // refresh scene
    this.animateForAWhile(0);
  }

  minimizeAllLabels() {
    // special actions for selected label
    const sl = this._.selectedLabel;
    if (sl) {
      // reset sphere colors back to normal
      const style = this._.normalLabelStyle;
      for (const sphere of sl.spheres) sphere.material.color.set(style.sphereColor);
      // unselect selected label
      this._.selectedLabel = null;
      this._.canFocusHiddenInput = false;
      this.unhighlightLabel(sl);
      // hide icons
      this._.scene.remove(this._.iconSpriteGroup);
      this._.scene.remove(this._.iconCircleGroup);
    }
    // minimize all labels
    for (const label of this._.labelSet) {
      if (label.minimized) continue;
      label.minimized = true; // remember it's minimized
      this._.spriteGroup.remove(label.sprite);
      this._.spritePlaneGroup.remove(label.spritePlane);
      for (const line of label.lines) this._.lineGroup.remove(line);
    }
    // refresh scene
    this.animateForAWhile(0);
  }

  maximizeAllLabels() {
    for (const label of this._.labelSet) {
      if (label.minimized) {
        label.minimized = false;
        this._.spriteGroup.add(label.sprite);
        this._.spritePlaneGroup.add(label.spritePlane);
        for (const line of label.lines) this._.lineGroup.add(line);
      }
    }
    // refresh scene
    this.animateForAWhile(0);
  }

  labelsToJSON() {
    const labelsArray = [];
    for (const label of this._.labelSet) {
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
        id: label.id,
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
    this._.mouseViewportCoords = this.getViewportCoords(event.clientX, event.clientY);
    const screenX = this._.mouseViewportCoords.x;
    const screenY = this._.mouseViewportCoords.y;
    const viewport = this.refs.viewport;

    // if dragging a temporary label
    if (this._.draggingTempLabel) {
      // get world coords from screen coords
      const worldPos = ThreeUtils.unprojectFromScreenToWorld(
        screenX, screenY,
        viewport.offsetWidth,
        viewport.offsetHeight,
        this._.camera
      );
      // intersect dragPlane with ray thrown from camera
      const intersPoint = ThreeUtils.getPlaneRayIntersection(
        this._.dragPlane.normal, // plane's normal
        this._.dragPlane.position, // plane's position
        this._.dragPlane.normal, // ray's normal (same as plane)
        worldPos); // ray's position
      // if correct intersection detected
      if (intersPoint) {
        // update sprite's position
        const tmpLabel = this._.tempDraggableLabel;
        tmpLabel.sprite.position.copy(intersPoint);
        // update line's position
        const lineGeo = tmpLabel.line.geometry;
        lineGeo.dynamic = true;
        lineGeo.vertices.length = 1;
        lineGeo.vertices.push(intersPoint);
        lineGeo.verticesNeedUpdate = true;
        // update spritePlane
        tmpLabel.spritePlane.position.copy(intersPoint);
        tmpLabel.spritePlane.quaternion.copy(this._.camera.quaternion);
        this.animateForAWhile();
      }
    }

    if (this._.draggingSelectedLabel) {
      // get world coords from screen coords
      const worldPos = ThreeUtils.unprojectFromScreenToWorld(
        screenX, screenY,
        viewport.offsetWidth,
        viewport.offsetHeight,
        this._.camera
      );
      // intersect dragPlane with ray thrown from camera
      const intersPoint = ThreeUtils.getPlaneRayIntersection(
        this._.dragPlane.normal, // plane's normal
        this._.dragPlane.position, // plane's position
        this._.dragPlane.normal, // ray's normal (same as plane)
        worldPos); // ray's position
      // if correct intersection detected
      if (intersPoint) {
        // update sprite's position
        const selectedLabel = this._.selectedLabel;
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
        selectedLabel.spritePlane.quaternion.copy(this._.camera.quaternion);
        // remember position is dirty
        this._.selectedLabelPositionDirty = true;
        // refresh icons
        this.refreshIconsPositions();
        this.animateForAWhile();
      }
    }

    if (this._.orbitingCamera) {
      // initiate a camera orbit
      this._.mouseLeft2.x = screenX;
      this._.mouseLeft2.y = screenY;
      this._.cameraOrbitUpdatePending = true;
      this.animateForAWhile();
    }
  }

  getViewportCoords(clientX, clientY) {
    const vp = this.refs.viewport;
    const bcr = vp.getBoundingClientRect();
    const ans = {
      x: clientX - bcr.left,
      y: vp.offsetHeight + bcr.top - clientY,
    };
    return ans;
  }

  /**
   * Handle Mouse Up events
   */
  onMouseUp(event) {
    if (event.button === LEFT_BUTTON) {
      // notify parent of labels changed if we were dragging one
      if (this._.selectedLabelPositionDirty) {
        this.onLabelsChanged();
      }
      this._.selectedLabelPositionDirty = false;
      this._.orbitingCamera = false;
      this._.cameraOrbitUpdatePending = false;
      this._.draggingSelectedLabel = false;
    }
  }

  /**
   * Handle Context Menu events
   */
  handleContextMenu(event) {
    event.preventDefault();
    return false;
  }

  onWindowResize() {
    if (this._.meshGroup !== null) {
      const viewport = this.refs.viewport;
      const w = viewport.offsetWidth;
      const h = viewport.offsetHeight;
      const cam = this._.camera;
      // update the camera
      cam.left = -w / 2;
      cam.right = w / 2;
      cam.top = h / 2;
      cam.bottom = -h / 2;
      cam.updateProjectionMatrix();
      // update the renderer's size
      this._.renderer.setSize(w, h);
      this.animateForAWhile();
    }
  }

  isMouseOverViewport() {
    const w = this.refs.viewport.offsetWidth;
    const h = this.refs.viewport.offsetHeight;
    const mvpc = this._.mouseViewportCoords;
    return (mvpc.x >= 0 && mvpc.x <= w && mvpc.y >= 0 && mvpc.y <= h);
  }

  gotFocus() {
    this._.componentFocused = true;
  }
  lostFocus() {
    this._.componentFocused = false;
  }

  onKeydown(e) {
    // debugger
    if (!this._.componentFocused) return;
    const key = e.keyCode;

    if (this._.meshGroup) {
      if (key >= 37 && key <= 40) {
        e.preventDefault();
        let dist;
        let shift;
        const cam = this._.camera;
        switch (key) {
          case 37: // key left
            dist = (cam.right - cam.left) * 0.04 / cam.zoom;
            shift = new THREE.Vector3(dist, 0, 0)
            .applyMatrix4(this._.camera.matrixWorld);
            break;
          case 38: // key up
            dist = (cam.top - cam.bottom) * 0.04 / cam.zoom;
            shift = new THREE.Vector3(0, -dist, 0)
            .applyMatrix4(this._.camera.matrixWorld);
            break;
          case 39: // key right
            dist = (cam.right - cam.left) * 0.04 / cam.zoom;
            shift = new THREE.Vector3(-dist, 0, 0)
            .applyMatrix4(this._.camera.matrixWorld);
            break;
          default: // key down
            dist = (cam.top - cam.bottom) * 0.04 / cam.zoom;
            shift = new THREE.Vector3(0, dist, 0)
            .applyMatrix4(this._.camera.matrixWorld);
            break;
        }
        cam.position.copy(shift);
        this.refs.hiddenTxtInp.blur();
        this.animateForAWhile();
        return;
      }
    }
    if (this._.mode === READONLY || !this._.labelsEnabled) return;
    if (this._.selectedLabel) {
      if (key === 13) this.unselectSelectedLabel();
      else this.refs.hiddenTxtInp.focus();
    }
  }

  onHiddenTextChanged() {
    if (this._.mode === READONLY) return;
    const text = this.refs.hiddenTxtInp.value;
    const label = this._.selectedLabel;
    if (label) {
      if (this._.mode === EDITION) label.text = text;
      else label.student_answer = text; // EVALUATION
      this.highlightLabel(label);
      this.refreshIconsPositions();
      this.animateForAWhile();
      this._.selectedLabelTextDirty = true;
    }
  }

  unselectSelectedLabel() {
    const label = this._.selectedLabel;
    if (label) {
      this.unhighlightLabel(label);
      this._.selectedLabel = null;
      this._.canFocusHiddenInput = false;
      // remove icons from scene
      this._.scene.remove(this._.iconSpriteGroup);
      this._.scene.remove(this._.iconCircleGroup);
      // refresh scene
      this.animateForAWhile(0);
      // if text is dirty, notify parent about it (according to mode)
      if (this._.selectedLabelTextDirty) {
        if (this._.mode === EDITION) {
          this.onLabelsChanged();
        } else if (this._.mode === EVALUATION) {
          this.props.labelAnswerChangedCallback({ id: label.id, text: label.student_answer });
        }
        this._.selectedLabelTextDirty = false;
      }
    }
  }

  selectLabel(label) {
    const prevLabel = this._.selectedLabel;
    if (label !== prevLabel) {
      // unselect previous selected label
      this.unselectSelectedLabel();
      // maximize the label if it was minimized
      if (label.minimized) {
        for (const line of label.lines) this._.lineGroup.add(line);
        label.minimized = false;
      }
      // highlight selected label
      this._.selectedLabel = label;
      this.highlightLabel(label);
      // add icons back to scene and refresh their positions
      this._.scene.add(this._.iconSpriteGroup);
      this._.scene.add(this._.iconCircleGroup);
      this.refreshIconsPositions();
      // refresh scene
      this.animateForAWhile(0);
    }
    // prepare hidden input for writing on it
    this._.canFocusHiddenInput = true;
    this.refs.hiddenTxtInp.value =
      (this._.mode === EDITION) ? label.text : label.student_answer;
    this.refs.hiddenTxtInp.focus();
  }

  refreshIconsPositions() {
    // debugger
    const label = this._.selectedLabel;
    const w = label.sprite.scale.x;
    const h = label.sprite.scale.y;
    const quat = this._.camera.quaternion;
    // // update minimize icon's position
    this._.minimizeIconSprite.position
      .set(w * 0.5 + h * 0.02, h * 0.6, 0)
      .applyQuaternion(quat)
      .add(label.sprite.position);
    // and circle
    this._.minimizeIconCircle.position
      .copy(this._.minimizeIconSprite.position);
    this._.minimizeIconCircle.quaternion.copy(quat);

    if (this._.mode === EDITION) {
      // update delete icon's position
      this._.deleteIconSprite.position
        .set(w * 0.5 + h * 0.04 + this._.meshDiameter * ICON_COEF, h * 0.6, 0)
        .applyQuaternion(quat)
        .add(label.sprite.position);
      // and circle
      this._.deleteIconCircle.position
        .copy(this._.deleteIconSprite.position);
      this._.deleteIconCircle.quaternion.copy(quat);
    }
  }

  onTouchStart(e) {
    e.preventDefault();
    const touches = e.touches;

    /* 1 finger */
    if (touches.length === 1) {
      const viewport = this.refs.viewport;
      const vpcoords = this.getViewportCoords(touches[0].clientX, touches[0].clientY);
      const screenX = vpcoords.x;
      const screenY = vpcoords.y;
      if (this._.labelsEnabled) {
        // make sprite planes visible for intersection
        this._.spritePlaneGroup.visible = true;
        this._.iconCircleGroup.visible = true;
        // check intersection with sprite planes, spheres and meshes
        const intrs = ThreeUtils.getClosestIntersectedObject(
          screenX, screenY, viewport.offsetWidth, viewport.offsetHeight,
          this._.raycaster, this._.camera,
          this._.sphereGroup, this._.meshGroup,
          this._.spritePlaneGroup,
          this._.selectedLabel ? this._.iconCircleGroup : null
        );
        // make sprite planes invisible again
        this._.spritePlaneGroup.visible = false;
        this._.iconCircleGroup.visible = false;

        if (intrs) {
          const pickedObj = intrs.object;
          const pickedGroup = intrs.group;

          // case 1) sprite plane intersected
          if (pickedGroup === this._.spritePlaneGroup) {
            // select label
            const label = this._.spritePlaneToLabelMap[pickedObj.object.uuid];
            this.selectLabel(label);

          // case 2) sphere intersected
          } else if (pickedGroup === this._.sphereGroup) {
            const sphere = pickedObj.object;
            const label = this._.sphereToLabelMap[sphere.uuid];
            this.selectLabel(label);

          /* case 3) minimize icon intersected */
          } else if (pickedGroup === this._.iconCircleGroup
            && pickedObj.object === this._.minimizeIconCircle) {
            this.minimizeSelectedLabel();
          }
        }
      }
      // initiate a camera orbit around 3D Model
      this._.orbitingCamera_touch = true;
      this._.touchCoords1.x = screenX;
      this._.touchCoords1.y = screenY;
    }
    // save initial position
    const center = TouchUtils.touchesClientCenter(touches);
    this._.touchCoords1.x = center.x;
    this._.touchCoords1.y = center.y;
    // save initial pinch distance
    this._.pinchDist1 = TouchUtils.touchesAvgSquareDistanceToCenter(touches);

    // refresh canvas
    this.animateForAWhile();
  }

  onTouchMove(e) {
    e.preventDefault();
    const touches = e.touches;
    /* 1 finger -> orbit camera*/
    if (touches.length === 1) {
      const vpcoords = this.getViewportCoords(touches[0].clientX, touches[0].clientY);
      const screenX = vpcoords.x;
      const screenY = vpcoords.y;
      if (this._.orbitingCamera_touch) {
        this._.touchCoords2.x = screenX;
        this._.touchCoords2.y = screenY;
        this._.orbitingCamera_touch_updatePending = true;
      } else {
        this._.orbitingCamera_touch = true;
        this._.touchCoords1.x = screenX;
        this._.touchCoords1.y = screenY;
      }
      this._.draggingCamera_touch = false;
      this._.pinching = false;
    /* 2 or more fingers */
    } else {
      /* pinching -> zoom camera */
      const center = TouchUtils.touchesClientCenter(touches);
      this._.touchCoords2.x = center.x;
      this._.touchCoords2.y = center.y;
      this._.draggingCamera_touch_updatePending = true;
      /* pinching -> zoom camera */
      const pinchDist = TouchUtils.touchesAvgSquareDistanceToCenter(touches);
      this._.pinchDist2 = pinchDist;
      this._.pinchCenter = TouchUtils.touchesClientCenter(touches);
      this._.pinching_updatePending = true;
    }
    this.animateForAWhile();
  }

  onTouchEnd() {
    this._.orbitingCamera_touch = false;
    this._.draggingCamera_touch = false;
    this._.pinching = false;
  }

  render() {
    return (
      <div style={styles.root}>
        <div
          style={styles.viewport} ref="viewport"
          onWheel={this.handleWheel}
          onMouseDown={this.onMouseDown}
          onContextMenu={this.handleContextMenu}
          onTouchStart={this.onTouchStart}
          onTouchMove={this.onTouchMove}
          onTouchEnd={this.onTouchEnd}
        >
        </div>
        <input ref="hiddenTxtInp" onChange={this.onHiddenTextChanged} style={styles.hiddenTxtInp}></input>
      </div>
    );
  }
}

Renderer3D.propTypes = {
  /* ===========================*/
  /* 1) props for ALL modes */
  /* ===========================*/
  /* --- props to read from (INPUT) ---- */
  mode: React.PropTypes.string.isRequired,
  source: React.PropTypes.object.isRequired,
  labels: React.PropTypes.array.isRequired,
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
  filesActuallyUsedCallback: React.PropTypes.func,
  /* ==============================*/
  /* 3) props for EVALUATION mode  */
  /* ==============================*/
  /* --- callback props to notify parent about changes (OUTPUT) --- */
  labelAnswerChangedCallback: React.PropTypes.func,
};

const styles = {
  root: {
    width: '100%',
    height: '100%',
  },
  viewport: {
    width: '100%',
    height: '100%',
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
