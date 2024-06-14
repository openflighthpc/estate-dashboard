import { earthRotationSpeed } from '../spec.js';
import { earthGroup } from '../mesh.js'

export default class Earth {

  constructor () {
    this.groupMesh = earthGroup;
    this.groupMesh.userData.flightObj = this;
    
    this.requestRotation();
  }

  requestRotation () {
    this.animateRotation = this.getRotationAnimator();
    this.animatable = true;
  }

  notifyNextFrame(frameDuration) {
    this.animateRotation(frameDuration);
  }
  
  getRotationAnimator () {

    return (frameDuration) => {
      this.groupMesh.userData.interactiveChildren['rotationGroup'].rotation.y += frameDuration * earthRotationSpeed;
    }
  }

}