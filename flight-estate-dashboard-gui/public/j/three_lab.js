import * as THREE from './vdc/three.module.min.js'
import * as ThreeMesh from './vdc/mesh.js'
import * as ThreeSpec from './vdc/spec.js'
import * as ThreeObject from './vdc/object.js'

import { envTexture } from './vdc/mesh/env_texture.js'

import { OrbitControls } from './vdc/a/controls/OrbitControls.js'
import { EffectComposer } from './vdc/a/postprocessing/EffectComposer.js'
import { RenderPass } from './vdc/a/postprocessing/RenderPass.js'
import { UnrealBloomPass } from './vdc/a/postprocessing/UnrealBloomPass.js'
import { SVGLoader } from './vdc/a/loaders/SVGLoader.js'
import { DRACOLoader } from './vdc/a/loaders/DRACOLoader.js'
import { GLTFLoader } from './vdc/a/loaders/GLTFLoader.js'

import * as DAT from './vdc/dat.gui.module.js'

window.onload = async function () {
  const datGUI = new DAT.GUI();
  const domRoomWrapper = globalThis.document.getElementById('room-wrapper');
  const domRoom = globalThis.document.getElementById('room');
  const viewportDimensions = domRoomWrapper.getBoundingClientRect();
  const roomScene = new THREE.Scene();
  roomScene.environment = envTexture;

  const roomRenderer = new THREE.WebGLRenderer({
    'canvas': domRoom,
    'alpha': true
  });
  roomRenderer.setPixelRatio(Math.min(globalThis.devicePixelRatio, 2));
  roomRenderer.setSize(viewportDimensions.width, viewportDimensions.height);


  const roomCamera = new THREE.PerspectiveCamera(60, viewportDimensions.width / viewportDimensions.height, 0.1, 1000);
  roomCamera.position.z = 2.2;
  roomScene.add(roomCamera);
  const orbitControls = new OrbitControls(roomCamera, domRoom);

  const roomBaseLight = new THREE.AmbientLight(0x00ffff, 1.2);
  roomScene.add(roomBaseLight);
  const roomShadowLight = new THREE.DirectionalLight(0xffffff, 1.8);
  roomShadowLight.position.set(0, 5, 3);
  roomShadowLight.castShadow = true;
  roomScene.add(roomShadowLight);
  // datGUI.add(roomBaseLight, 'intensity').min(0).max(3).step(0.003);
  // datGUI.add(roomShadowLight, 'intensity').min(0).max(3).step(0.003);
  // orbitControls.autoRotate = true


  // const gridHelper = new THREE.GridHelper(400, 50);
  // roomScene.add( gridHelper );



  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/j/vdc/a/libs/draco/');

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  const gltf = await gltfLoader.loadAsync('/j/vdc/model/earth.glb');
  console.log(gltf.scene.children[0]);
  const earth = gltf.scene.children[0];
  const locUK = new THREE.Object3D();
  locUK.position.x = 0.47325107305426123;
  locUK.position.y = 0.8889425968939277;
  locUK.position.z = 0.027478318882680125;

  const locationGroup = new THREE.Group();
  locationGroup.add(earth, locUK);

  const earthGroup = new THREE.Group();
  earthGroup.add(locationGroup);
  earthGroup.rotation.z = -0.40911;
  roomScene.add(earthGroup);

  const raycaster = new THREE.Raycaster();
  $('#room-wrapper').on('click', (e) => {
    console.log('clicked');
    const viewportDimensions = e.currentTarget.getBoundingClientRect();
    const mouseX = (e.clientX - viewportDimensions.left) / viewportDimensions.width * 2 - 1;
    const mouseY = 1 - (e.clientY - viewportDimensions.top) / viewportDimensions.height * 2;
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), roomCamera);
    const firstIntersection = raycaster.intersectObjects([earthGroup])[0]
    if (firstIntersection){
      console.log(firstIntersection.point);
    }
  })

  const animate = function () {
    
    // required if controls.enableDamping or controls.autoRotate are set to true
    orbitControls.update();
    const ukPosition = new THREE.Vector3();
    locUK.getWorldPosition(ukPosition);
    const projectUKPosition = ukPosition.clone();
    projectUKPosition.project(roomCamera);
    
    const viewportDimensions = $('#room-wrapper').get(0).getBoundingClientRect();
    const anchorClientX = viewportDimensions.left + (projectUKPosition.x + 1) * viewportDimensions.width / 2;
    const anchorClientY = viewportDimensions.top - (projectUKPosition.y - 1) * viewportDimensions.height / 2;
    const menuTranslateX = anchorClientX - viewportDimensions.left;
    const menuTranslateY = anchorClientY - viewportDimensions.top;
    $('#uk').css({
      'translate': `${menuTranslateX}px ${menuTranslateY}px`,
    });


    raycaster.setFromCamera(new THREE.Vector2(projectUKPosition.x, projectUKPosition.y), roomCamera);
    const firstIntersection = raycaster.intersectObjects([earthGroup])[0]
    if (firstIntersection && firstIntersection.point.distanceTo(ukPosition) < 1e-10){
      $('#uk').css({
        'visibility': 'visible',
        'scale': '1',
        'opacity': '1',
        'transition':
          'scale 270ms cubic-bezier(.82,.08,.51,1.65),' +
          'opacity 270ms cubic-bezier(.82,.08,.51,1.65)'
      });
    } else {
      $('#uk').css({
        'visibility': '',
        'scale': '',
        'opacity': '',
        'transition': ''
      });
    }

    locationGroup.rotation.y += 0.001;
  
    roomRenderer.render( roomScene, roomCamera );
  
    requestAnimationFrame( animate );
  
  }
  
  animate();
}