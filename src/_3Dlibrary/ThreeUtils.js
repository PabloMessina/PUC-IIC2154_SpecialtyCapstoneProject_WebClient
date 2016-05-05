import THREE from 'n3d-threejs';

//unit vectors
const UnitX_p = new THREE.Vector3(1, 0, 0);
const UnitY_p = new THREE.Vector3(0, 1, 0);
const UnitZ_p = new THREE.Vector3(0, 0, 1);
const UnitX_n = new THREE.Vector3(-1, 0, 0);
const UnitY_n = new THREE.Vector3(0, -1, 0);
const UnitZ_n = new THREE.Vector3(0, 0, -1);
const NullVector = new THREE.Vector3(0, 0, 0);

/**
 * [ThreeUtils : a namespace with several utility functions on top of THREE.js]
 */
const ThreeUtils = {

  /**
   * Find the boundingBox around a collection of meshes
   */
  getMeshesBoundingBox: (meshes) => {
    let min = null;
    let max = null;
    meshes.forEach((mesh) => {
      const geom = mesh.geometry;
      geom.computeBoundingBox();
      const iMin = geom.boundingBox.min;
      const iMax = geom.boundingBox.max;
      if (min === null) {
        min = new THREE.Vector3(iMin.x, iMin.y, iMin.z);
        max = new THREE.Vector3(iMax.x, iMax.y, iMax.z);
      } else {
        min.x = Math.min(min.x, iMin.x);
        min.y = Math.min(min.y, iMin.y);
        min.z = Math.min(min.z, iMin.z);
        max.x = Math.max(max.x, iMax.x);
        max.y = Math.max(max.y, iMax.y);
        max.z = Math.max(max.z, iMax.z);
      }
    });
    return { min, max };
  },

  /**
   * [Adjust a camera's settings so that a region delimited by a bounding boundingBox
   * appears totally within the camera's field of vision and therefore within the viewport]
   * @param  {[THREE::OrthogonalCamera]}    camera
   * @param  {[THREE::Light]}               cameraLight
   * @param  {[Object]}                     boundingBox
   * @param  {[float]}                      viewportWidth
   * @param  {[float]}                      viewportHeight
   */
  centerCameraOnBoundingBox: (camera, cameraLight, boundingBox,
    viewportWidth, viewportHeight) => {
    // compute radius and center
    const min = boundingBox.min;
    const max = boundingBox.max;
    const radius = min.distanceTo(max) * 0.5;
    const center = new THREE.Vector3()
      .copy(NullVector).addVectors(min, max).multiplyScalar(0.5);

    // set camera's position
    camera.position
      .copy(center)
      .addScaledVector(UnitZ_p, radius * 1.5);

    // set camera's light's position
    cameraLight.position.copy(camera.position);

    // correct camera's orientation
    camera.up.copy(UnitY_p);
    camera.lookAt(center);

    // recompute zoom
    const d = Math.min(viewportWidth, viewportHeight) * 0.4;
    const zoom = d / radius;

    // update camera's dimenesions, zoom and projectionMatrix
    camera.zoom = zoom;
    camera.left = -viewportWidth / 2;
    camera.right = viewportWidth / 2;
    camera.top = viewportHeight / 2;
    camera.bottom = -viewportHeight / 2;
    camera.updateProjectionMatrix();
  },

  /**
   * Convert from screen coordinates (R2) to world coordinates (R3)
   */
  unprojectFromScreenToWorld(screenX, screenY, screenWidth, screenHeight, camera) {
    const x = (screenX / screenWidth) * 2 - 1;
    const y = (screenY / screenHeight) * 2 - 1;
    const z = 1;
    const v3 = new THREE.Vector3(x, y, z);
    v3.unproject(camera);
    return v3;
  },

  /**
   * Convert from screen coordinates to world coordinates, making sure the world
   * point is placed on the camera's plane: z = 0
   */
  screenToWorldOnCameraPlane(screenX, screenY, screenWidth, screenHeight, camera) {
    const x = (screenX / screenWidth) * 2 - 1;
    const y = (screenY / screenHeight) * 2 - 1;
    const v3 = new THREE.Vector3(x, y, 1);
    const invProjMatrix = new THREE.Matrix4()
      .getInverse(camera.projectionMatrix);
    return v3.applyMatrix4(invProjMatrix)
      .setZ(0)
      .applyMatrix4(camera.matrixWorld);
  },

  /**
   * [getPlaneRayIntersection : returns intersection point between ray and plane]
   * @param  {[Vector3]} pNormal [plane's normal]
   * @param  {[Vector3]} pPos    [plane's positon]
   * @param  {[Vector3]} rDir    [ray's direction]
   * @param  {[Vector3]} rPos    [ray's position]
   */
  getPlaneRayIntersection(pNormal, pPos, rDir, rPos) {
    const m = rDir.dot(pNormal);
    const n = rPos.dot(pNormal) - pPos.dot(pNormal);
    if (m === 0) {
      console.log("WARNING: division by 0 detected");
      return null;
    }
    const t = - n / m;
    return new THREE.Vector3().copy(rPos).addScaledVector(rDir, t);
  },

  /**
   * Return whether the vector is (0,0,0) or not
   */
  isZero(v3) {
    return v3.x === 0 && v3.y === 0 && v3.z === 0;
  },

  /**
   * [makeTextSprite : given a text and some parameters, return a sprite with the text]
   * @param  {[string]} text   [the input text]
   * @param  {[object]} params [fontStyle, backgroundColor,
   * foregroundColor, borderColor, borderThickness, worldFontHeight, etc.]
   * @return {[THREE::Sprite]}
   */
  makeTextSprite(text, opacity, worldReferenceSize, params) {
    // read params
    const font = params.font || 'Georgia';
    const fontSize = params.fontSize || 50;
    const fontStyle = `${fontSize}px ${font}`;
    const foregroundColor = params.foregroundColor || 'rgb(0,0,255)';
    const backgroundColor = params.backgroundColor || 'rgb(0,255,255)';
    const borderColor = params.borderColor || 'rgb(0,0,0,0.5)';
    const borderThickness = params.borderThickness || (fontSize * 0.025);
    const worldFontSizeCoef = params.worldFontSizeCoef || 0.045;
    const worldFontSize = worldReferenceSize * worldFontSizeCoef;
    // create canvas and get its 2D context
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // setup context for text
    ctx.font = fontStyle;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = foregroundColor;
    // get text's dimensions
    const textWidth = Math.ceil(ctx.measureText(text).width);
    const textHeight = getFontHeight(fontStyle);
    const charWidth = textWidth / (text.length ? text.length : 1);
    // resize canvas to fit text
    canvas.width = textWidth + 4 * charWidth + 2 * borderThickness;
    canvas.height = textHeight * 2 + borderThickness * 2;
    // restore context's settings again after resizing
    ctx.font = fontStyle;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    // draw background and border
    roundRect(ctx,
      borderThickness * 0.5, borderThickness * 0.5,
      canvas.width - borderThickness,
      canvas.height - borderThickness,
      canvas.height * 0.35,
      backgroundColor,
      borderThickness,
      borderColor);
    // draw text
    ctx.fillStyle = foregroundColor;
    ctx.fillText(text, (canvas.width - textWidth) * 0.5, (canvas.height - textHeight) * 0.5);
    // generate texture from canvas
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    // generate texture
    const material = new THREE.SpriteMaterial({ map: texture });
    if (opacity) {
      material.transparent = true;
      material.opacity = opacity;
    }
    // generate and return sprite
    const sprite = new THREE.Sprite(material);
    const factor = worldFontSize / textHeight;
    sprite.scale.set(canvas.width * factor, canvas.height * factor, 1);
    return sprite;
  },

  /**
   * Returns a unit normal Vector3 in world coordinates pointing forward from
   * the camera's point of view
   */
  getCameraForwardNormal(camera) {
    return new THREE.Vector3(0, 0, -1)
      .applyMatrix4(camera.matrixWorld)
      .sub(camera.position)
      .normalize();
  },

  /**
   * [get the closest object (and its group) among all the intersected objects
   * from the list of object groups provided]
   */
  getClosestIntersectedObject(screenX, screenY, screenWidth, screenHeight,
    raycaster, camera, ...groups) {
    // convert from screen to clipping coordinates
    const clippingCoords = new THREE.Vector2(
      (screenX / screenWidth) * 2 - 1,
      (screenY / screenHeight) * 2 - 1
    );
    // set up raycaster
    raycaster.setFromCamera(clippingCoords, camera);
    // intersect each group and keep track of the closest object
    let closestObj = null;
    let closestGroup = null;
    let minD = null;
    groups.forEach((group) => {
      const intersects = raycaster.intersectObjects(group.children);
      if (intersects.length > 0) {
        const dist = intersects[0].distance;
        if (minD === null || minD > dist) {
          minD = dist;
          closestObj = intersects[0];
          closestGroup = group;
        }
      }
    });
    // return the object and the group it belongs to (if any)
    // otherwise return null
    return closestObj ? { object: closestObj, group: closestGroup } : null;
  },

  /**
   * [returns a plane with same dimensions, position and orientaton as
   * as the given sprite]
   * @param  {[THREE.Sprite]} sprite [the sprite]
   * @param  {[THREE.Camera]} camera [to set the orientation towards
   * the camera, as a typical sprite]
   * @return {[THREE.Mesh]}        [the plane]
   */
  createPlaneFromSprite(sprite, camera) {
    const bbox = new THREE.BoundingBoxHelper(sprite);
    bbox.update();
    const width = bbox.box.max.x - bbox.box.min.x;
    const height = bbox.box.max.y - bbox.box.min.y;
    const planeGeo = new THREE.PlaneGeometry(width, height);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const spritePlane = new THREE.Mesh(planeGeo, mat);
    spritePlane.position.copy(sprite.position);
    spritePlane.quaternion.copy(camera.quaternion);
    return spritePlane;
  },
};

// cache to store font heights
const fontHeightCache = {};
/**
 * [getFontHeight : returns the height of a given fontStyle]
 * @param  {[string]} fontStyle
 * @return {[float]}  fontHeight
 */
function getFontHeight(fontStyle) {
  let fontHeight = fontHeightCache[fontStyle];
  if (!fontHeight) {
    const body = document.getElementsByTagName('body')[0];
    const dummy = document.createElement('div');
    const dummyText = document.createTextNode('MÉq');
    dummy.appendChild(dummyText);
    dummy.setAttribute('style', `font:${fontStyle};position:absolute;top:0;left:0`);
    body.appendChild(dummy);
    fontHeight = dummy.offsetHeight;
    body.removeChild(dummy);
    fontHeightCache[fontStyle] = fontHeight;
  }
  return fontHeight;
}

/**
 * [roundRect : drawss a rectangle with rounded corners]
 */
function roundRect(ctx, x, y, width, height, radius, backgroundColor,
  borderThickness, borderColor) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.strokeStyle = borderColor;
  ctx.fillStyle = backgroundColor;
  ctx.fill();
  console.log("borderThickness = ", borderThickness);
  if (borderThickness > 0.1) {
    ctx.lineWidth = borderThickness;
    ctx.stroke();
  }
}

export default ThreeUtils;
