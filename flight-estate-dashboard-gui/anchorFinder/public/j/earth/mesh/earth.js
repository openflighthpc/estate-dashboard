import * as THREE from '../three.module.min.js'
import { GLTFLoader } from '../a/loaders/GLTFLoader.js'
import { DRACOLoader } from '../a/loaders/DRACOLoader.js'
import {
  ObliquityOfTheEcliptic,
  gbrPositionX,
  gbrPositionY,
  gbrPositionZ
} from '../spec.js'

const gltfLoader = new GLTFLoader();

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/j/earth/a/libs/draco/');

gltfLoader.setDRACOLoader(dracoLoader);

const earthScene = await gltfLoader.loadAsync('/r/3d/model/earth.glb');
const earth = earthScene.scene.children[0];

const gbrAnchor = new THREE.Object3D();
gbrAnchor.position.x = gbrPositionX;
gbrAnchor.position.y = gbrPositionY;
gbrAnchor.position.z = gbrPositionZ; 
gbrAnchor.userData.countryCode = 'GBR';

const rotationGroup = new THREE.Group();
rotationGroup.add(
  earth, 
  gbrAnchor
);

const earthGroup = new THREE.Group();
earthGroup.add(rotationGroup);
earthGroup.userData.interactiveChildren = {
  'rotationGroup': rotationGroup,
  'countryAnchors': [gbrAnchor]
}

export {
  earthGroup
}
