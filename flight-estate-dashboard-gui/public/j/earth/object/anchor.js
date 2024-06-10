import * as THREE from '../three.module.min.js'

export default class VDCAnchor {

  constructor (x, y, z, camera) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.camera = camera;
    
    const threePosition = new THREE.Vector3(this.x, this.y, this.z);
    threePosition.project(this.camera.camera);
    this.projection = threePosition;
  }

  /**
   * @returns Returns `true` if the updated projection is different from the original projection.
   *          Otherwise `false`.
   */
  updateProjection () {
    const threePosition = new THREE.Vector3(this.x, this.y, this.z);
    threePosition.project(this.camera.camera);

    if (this.projection.x === threePosition.x && this.projection.y === threePosition.y) {
      return false;
    }
    this.projection = threePosition;
    return true;
  }

}