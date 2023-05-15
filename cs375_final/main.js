import * as THREE from 'three';
import "./style.css"
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

// Texture Loader
var loader = new THREE.TextureLoader();

// Scene
const scene = new THREE.Scene()

// Outer Sphere
const outerSphereGeometry = new THREE.SphereGeometry(3.5,32,32)
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
  vertexShader: `
  varying vec3 pos;

  void main() {
    pos = position; 
    gl_Position = projectionMatrix
                  * modelViewMatrix
                  * vec4(position.x, position.y, position.z, 1.0);

  }`, 
  fragmentShader: `
  varying vec3 pos;

  void main(void)
  {
    float offset = 10.0;
    float total = floor(pos.x) + floor(pos.y) + offset;
    bool isEven = mod(total, 2.0) == 0.0;
    vec4 col1 = vec4(0.0, 0.0, 0.0, 1.0);
    vec4 col2 = vec4(1.0, 1.0, 1.0, 1.0);
    gl_FragColor = (isEven) ? col1 : col2;
  }`
})
const innerSphereMesh = new THREE.Mesh(innerSphereGeometry, innerSphereMaterial)
scene.add(innerSphereMesh)

// Load an image file into a custom material
var spiralMaterial = new THREE.MeshLambertMaterial({
  map: loader.load('assets/swirl.png'),
  transparent: true
});
var spiralGeometry = new THREE.PlaneGeometry(2, 2);
var spiralMesh = new THREE.Mesh(spiralGeometry, spiralMaterial);
// set the position of the image mesh in the x,y,z dimensions
spiralMesh.position.set(0,0,3.5);
scene.add(spiralMesh);

//Sizes
const sizes = {
  width: window.innerWidth, 
  height: window.innerHeight
}

//Light
const light = new THREE.PointLight(0xffffff, 3, 0)
light.position.set(0,0,10)
scene.add(light)

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


const loop = () => {
  //geometry animations
  innerSphereGeometry.rotateY(0.002)
  outerSphereGeometry.rotateY(-0.001)
  spiralGeometry.rotateZ(0.01)

  controls.update()
  renderer.render(scene, camera)
  window.requestAnimationFrame(loop)
}
loop()