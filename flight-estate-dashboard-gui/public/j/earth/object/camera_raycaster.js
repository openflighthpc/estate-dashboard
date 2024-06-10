import * as THREE from '../three.module.min.js'

export default class EarthCameraRaycaster {

  /**
   * @param {Camera} camera The camera that is used as the of the origin of the raycaster.
   */
  constructor (camera) {
    this.raycaster = new THREE.Raycaster();
    this.camera = camera;
    this.projectVector = new THREE.Vector2();
  }

  getIntersectionPoint(projectVectorX, projectVectorY, ...objects) {
    this.projectVector.x = projectVectorX;
    this.projectVector.y = projectVectorY;
    this.raycaster.setFromCamera(this.projectVector, this.camera.camera);
    const firstIntersection = this.raycaster.intersectObjects(objects)[0];
    if (firstIntersection) {
      return firstIntersection.point;
    }
    return null;
  }
}

