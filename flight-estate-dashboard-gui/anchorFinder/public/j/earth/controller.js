import { OrbitControls } from './a/controls/OrbitControls.js'
import * as THREE from './three.module.min.js'

export default class EarthController {

  /**
   * 
   * @param {World} world 
   */
  constructor (world) {
    this.world = world;
  }

  initializeScene () {
    this.orbitControls = new OrbitControls(this.scene.camera.camera, this.scene.domRoom);
    this.orbitControls.enablePan = false;
    this.orbitControls.enableZoom = false;
    this.scene.scene.add(this.world.earth.groupMesh);
  }

  handleClickEvent(e) {
    const viewportDimensions = e.currentTarget.getBoundingClientRect();
    const mouseX = (e.clientX - viewportDimensions.left) / viewportDimensions.width * 2 - 1;
    const mouseY = 1 - (e.clientY - viewportDimensions.top) / viewportDimensions.height * 2;
    const intersectionPoint = this.scene.raycaster.getIntersectionPoint(mouseX, mouseY, this.world.earth.groupMesh);
    console.log(intersectionPoint);
  }

  dispatchEvent (e) {
    this.scene.domRoomWrapper.dispatchEvent(e);
  }

}
