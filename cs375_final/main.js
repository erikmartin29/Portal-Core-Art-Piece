import * as THREE from 'three';
import "./style.css"
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

var clock = new THREE.Clock()
console.log(clock.startTime)

// Texture Loader
var loader = new THREE.TextureLoader();

// Scene
const scene = new THREE.Scene()

// Uniforms 
const uniformData = {
  u_time: {
    type: 'f', 
    data: clock.getElapsedTime()
  }
}

// Outer Sphere
const outerSphereGeometry = new THREE.SphereGeometry(3.25,32,32)
const outerSphereMaterial = new THREE.ShaderMaterial({
  wireframe: true,
  vertexShader: `
  void main() {
    //projectionMatrix, modelViewMatrix, position -> passed in from Three.js
    gl_Position = projectionMatrix
                  * modelViewMatrix
                  * vec4(position.x, position.y, position.z, 1.0);
  }`, 
  fragmentShader: `
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }`
})
const outerSphereMesh = new THREE.Mesh(outerSphereGeometry, outerSphereMaterial)
scene.add(outerSphereMesh)

//Inner Sphere
const innerSphereGeometry = new THREE.SphereGeometry(3,64,64)
const innerSphereMaterial = new THREE.ShaderMaterial({
  uniforms: uniformData,
  vertexShader: `
  varying vec3 pos;

  void main() {
    pos = position; 
    gl_Position = projectionMatrix
                  * modelViewMatrix
                  * vec4(position.x, position.y, position.z, 1.0);

  }`, 
  fragmentShader: `
  uniform float u_time;
  varying vec3 pos;

  void main(void)
  {
    float offset = u_time;
    float total = floor(pos.x + offset) + floor(pos.y + offset);
    bool isEven = mod(total, 2.0) == 0.0;
    vec4 col1 = vec4(0.0, 0.0, 0.0, 1.0);
    vec4 col2 = vec4(1.0, 1.0, 1.0, 1.0);
    gl_FragColor = (isEven) ? col1 : col2;
  }`
})
const innerSphereMesh = new THREE.Mesh(innerSphereGeometry, innerSphereMaterial)
scene.add(innerSphereMesh)

// Spiral 
var spiralMaterial = new THREE.MeshBasicMaterial({
  map: loader.load('assets/swirl.png'),
  transparent: true
});
var spiralGeometry = new THREE.CircleGeometry(1.75, 32);
var spiralMesh = new THREE.Mesh(spiralGeometry, spiralMaterial);
spiralMesh.position.set(0,0,3.51);
scene.add(spiralMesh);

// Blink 
var blinkMaterial = new THREE.ShaderMaterial({
  uniforms: uniformData,
  vertexShader: `
  varying vec3 pos;

  void main() {
    pos = position; 
    gl_Position = projectionMatrix
                  * modelViewMatrix
                  * vec4(position.x, position.y, position.z, 1.0);

  }`, 
  fragmentShader: `
  uniform float u_time;
  varying vec3 pos;

  void main(void)
  {
    float offset = 2.0;
    bool isEven = pos.y > offset || pos.y < (offset * -1.0);
    vec4 col1 = vec4(0.0, 0.0, 0.0, 1.0);
    vec4 col2 = vec4(0.0, 0.0, 0.0, 0.0);
    gl_FragColor = (isEven) ? col1 : col2;
  }`,
  transparent: true
});
var blinkGeometry = new THREE.CircleGeometry(1.75, 32);
var blinkMesh = new THREE.Mesh(blinkGeometry, blinkMaterial);
blinkMesh.position.set(0,0,3.52);
scene.add(blinkMesh);

//Outer Cone
const outerConeGeometry = new THREE.ConeGeometry(3.5/2 - 0.05, 3.5/2, 32); 
const outerConeMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff, wireframe:true} );
const outerConeMesh = new THREE.Mesh(outerConeGeometry, outerConeMaterial ); 
outerConeMesh.translateZ(2.59);
outerConeMesh.rotateX(-1.55);
scene.add(outerConeMesh);

//Inner Cone
const innerConeGeometry = new THREE.ConeGeometry(3.5/2 - 0.1, 3.5/2, 32); 
const innerConeMaterial = new THREE.MeshBasicMaterial( {color: 0x000000} );
const innerConeMesh = new THREE.Mesh(innerConeGeometry, innerConeMaterial ); 
innerConeMesh.translateZ(2.59);
innerConeMesh.rotateX(-1.55);
scene.add(innerConeMesh);

//Sizes
const sizes = {
  width: window.innerWidth, 
  height: window.innerHeight
}

//Light
const light = new THREE.PointLight(0xffffff, 3, 0)
light.position.set(0,0,10)
//scene.add(light)

//Camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 19)
camera.position.z = 20
scene.add(camera)

//Renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)

//Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

//Resize
window.addEventListener('resize', () => {
  //update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  //update camera
  camera.aspect = sizes.width/sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
})

var previousFrameBlinked = false;

const loop = () => {
  //geometry rotations
  outerSphereGeometry.rotateY(-0.001)
  spiralGeometry.rotateZ(0.01)

  uniformData.u_time.value = clock.getElapsedTime()
  controls.update()
  renderer.render(scene, camera)
  window.requestAnimationFrame(loop)
}
loop()