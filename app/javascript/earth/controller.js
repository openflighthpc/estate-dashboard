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
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.15;
    this.scene.scene.add(this.world.earth.groupMesh);
    this.scene.addAnimatable(this.world.earth);
  }

  handleNextFrame (_frameDuration) {
    this.orbitControls.update();
    
    const viewportDimensions = this.scene.domRoomWrapper.getBoundingClientRect();
    const countryPosition = new THREE.Vector3();
    const countryMoveDetail = {};
    this.world.earth.groupMesh.userData.interactiveChildren['countryAnchors'].forEach((countryAnchor) => {
      countryAnchor.getWorldPosition(countryPosition);
      const projectCountryPosition = countryPosition.clone();
      projectCountryPosition.project(this.scene.camera.camera);
      const anchorClientX = viewportDimensions.left + (projectCountryPosition.x + 1) * viewportDimensions.width / 2;
      const anchorClientY = viewportDimensions.top - (projectCountryPosition.y - 1) * viewportDimensions.height / 2;
      const intersectionPoint = this.scene.raycaster.getIntersectionPoint(projectCountryPosition.x, projectCountryPosition.y, this.world.earth.groupMesh);
      let anchorVisible = false;
      if (intersectionPoint && intersectionPoint.distanceTo(countryPosition) < 0.001) {
        anchorVisible = true;
      }
      countryMoveDetail[countryAnchor.userData.countryCode] = {
        'clientX': anchorClientX,
        'clientY': anchorClientY,
        'isVisible': anchorVisible
      }
    });
    this.dispatchEvent(new CustomEvent('countryanchormove', {
      'detail': countryMoveDetail
    }));
  }

  dispatchEvent (e) {
    this.scene.domRoomWrapper.dispatchEvent(e);
  }

}
