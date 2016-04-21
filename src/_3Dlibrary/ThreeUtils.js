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
  makeTextSprite(text, params) {
    // read params
    const fontStyle = params.fontStyle || '100px Georgia';
    const foregroundColor = params.foregroundColor || 'rgb(0,0,255)';
    const backgroundColor = params.backgroundColor || 'rgba(0,255,255,0.5)';
    const borderColor = params.borderColor || 'rgb(0,0,0,0.5)';
    const borderThickness = params.borderThickness || 1;
    const worldFontHeight = params.worldFontHeight || 1;
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
    // resize canvas to fit text
    canvas.width = textWidth * 1.10;
    canvas.height = textHeight * 1.10;
    // restore context's settings again after resizing
    ctx.font = fontStyle;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    // draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // draw border
    ctx.beginPath();
    ctx.lineWidth = borderThickness;
    ctx.strokeStyle = borderColor;
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.stroke();
    // draw text
    ctx.fillStyle = foregroundColor;
    ctx.fillText(text, textWidth * 0.05, textHeight * 0.05);
    // generate texture from canvas
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    // generate texture
    const material = new THREE.SpriteMaterial({ map: texture });
    // generate and return sprite
    const sprite = new THREE.Sprite(material);
    const factor = worldFontHeight / canvas.height;
    sprite.scale.set(canvas.width * factor, canvas.height * factor, 1);
    return sprite;
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
    dummy.setAttribute('style', 'font:' + fontStyle + ';position:absolute;top:0;left:0');
    body.appendChild(dummy);
    fontHeight = dummy.offsetHeight;
    body.removeChild(dummy);
    fontHeightCache[fontStyle] = fontHeight;
  }
  return fontHeight;
}

export default ThreeUtils;
