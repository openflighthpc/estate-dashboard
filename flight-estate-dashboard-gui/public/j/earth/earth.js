import { default as EarthWorld } from './world.js'

/**
 * Initialize the three world.
 * @function initEarth
 * @param {string} wrapperId The id of the DOM element to hold the VDC.
 * @param {string} data The init data of the VDC.
 */
globalThis.initEarth = function (wrapperId, data) {
  new EarthWorld(wrapperId, data);
};

document.dispatchEvent(new CustomEvent('earthready'));