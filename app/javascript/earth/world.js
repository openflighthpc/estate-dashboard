import EarthScene from './scene.js'
import EarthController from './controller.js'

import { Earth } from './object.js'

export default class EarthWorld {

  constructor (wrapperId, data) {
    this.earth = new Earth();

    this.controller = new EarthController(this);
    this.scene = new EarthScene(wrapperId, this.controller);
  }

}