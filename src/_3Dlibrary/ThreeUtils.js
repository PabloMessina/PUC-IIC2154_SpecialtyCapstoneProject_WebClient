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
    const y = - (screenY / screenHeight) * 2 + 1;
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
};

export default ThreeUtils;
