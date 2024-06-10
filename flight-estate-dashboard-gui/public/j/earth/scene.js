import * as THREE from './three.module.min.js'

import {
  EarthCamera,
  EarthCameraRaycaster
} from './object.js'
import EarthController from './controller.js';

export default class EarthScene {

  /**
   * @param {string} wrapperId 
   * @param {EarthController} controller
   */
  constructor (wrapperId, controller) {
    this.controller = controller;
    this.controller.scene = this;

    this.domRoomWrapper = globalThis.document.getElementById(wrapperId);
    this.domRoom = document.createElement('canvas');
    this.domRoom.style.position = 'absolute';
    this.domRoom.style.top = '0';
    this.domRoom.style.left = '0';
    this.domRoom.style.zIndex = 900;
    this.domRoom.style.filter = "drop-shadow(-6px -6px 9px #B3D4FF)";
    this.domRoomWrapper.appendChild(this.domRoom);

    const viewportDimensions = this.domRoomWrapper.getBoundingClientRect();
    this.renderer = new THREE.WebGLRenderer({
      'canvas': this.domRoom,
      'alpha': true,
      'antialias': true
    });
    this.renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio, 2));
    this.renderer.setSize(viewportDimensions.width, viewportDimensions.height);

    this.scene = new THREE.Scene();

    this.camera = new EarthCamera(viewportDimensions);
    this.raycaster = new EarthCameraRaycaster(this.camera);

    const baseLight = new THREE.AmbientLight(0x00ffff, 1.2);
    this.scene.add(baseLight);
    const shadowLight = new THREE.DirectionalLight(0xffffff, 1.8);
    shadowLight.position.set(0, 5, 3);
    shadowLight.castShadow = true;
    this.scene.add(shadowLight);
    this.animatables = new Set();
    this.controller.initializeScene();

    this.sizeOutdated = false;

    this.frameClock = new THREE.Clock();
    this.lastFrameTime = this.frameClock.getElapsedTime();
    this.renderNextFrame();

    const resizeObserver = new ResizeObserver((_e) => {
      this.sizeOutdated = true;
    });
    resizeObserver.observe(this.domRoomWrapper);
  }

  getFrameDuration () {
    const currentFrameTime = this.frameClock.getElapsedTime();
    const frameDuration = currentFrameTime - this.lastFrameTime;
    this.lastFrameTime = currentFrameTime;

    return frameDuration;
  }

  renderNextFrame () {
    requestAnimationFrame(() => {

    this.frameDuration = this.getFrameDuration();
    this.animatables.forEach((animatable) => {
      animatable.notifyNextFrame(this.frameDuration);
      if (!animatable.animatable) {
        this.animatables.delete(animatable);
      }
    })

    this.controller.handleNextFrame(this.frameDuration);

    if (this.sizeOutdated) {
      this.updateSize();
    }
    this.renderer.render(this.scene, this.camera.camera);
    this.renderNextFrame();
  
  });}

  /**
   * Add an object that has implemented the `notifyNextFrame` method into the set of animatables.
   * Or, doing nothing if the given animatable already exists in the set.
   * @param {object} animatable The object that has implemented the `notifyNextFrame` method.
   */
  addAnimatable(animatable) {
    this.animatables.add(animatable);
  }

  /**
   * Remove the given object from the set of animatables.
   * @param {object} animatable The object that has implemented the `notifyNextFrame` method.
   */
  deleteAnimatable(animatable) {
    this.animatables.delete(animatable);
  }

  updateSize () {
    const viewportDimensions = this.domRoomWrapper.getBoundingClientRect();
    this.renderer.setSize(viewportDimensions.width, viewportDimensions.height);
    this.camera.camera.aspect = viewportDimensions.width / viewportDimensions.height;
    this.camera.camera.updateProjectionMatrix();
    this.sizeOutdated = false;
  }

}