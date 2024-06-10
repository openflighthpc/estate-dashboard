import * as THREE from '../three.module.min.js'
import {
  cameraFOV,
  defaultCameraPositionX,
  defaultCameraPositionY,
  defaultCameraPositionZ
} from '../spec.js'

export default class EarthCamera {

  /**
   * @param {DOMRect} viewportDimensions The dimensions of the scene.
   */
  constructor (viewportDimensions) {
    this.camera = new THREE.PerspectiveCamera(cameraFOV, viewportDimensions.width / viewportDimensions.height, 0.1, 1000);
    this.camera.position.x = defaultCameraPositionX;
    this.camera.position.y = defaultCameraPositionY;
    this.camera.position.z = defaultCameraPositionZ;
    this.camera.lookAt(0, 0, 0);
  }

}

