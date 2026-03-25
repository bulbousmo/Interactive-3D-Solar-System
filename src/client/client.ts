import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'dat.gui'

const stats = new Stats()
document.body.appendChild(stats.dom)
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 5

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', onWindowResize, false)

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)


function animate() {
    requestAnimationFrame(animate)
    cube.rotation.x += 0.01
    cube.rotation.y += 0.01
    render()
    stats.update()
}
animate()

function render() {
    renderer.render(scene, camera)
}

const gui = new GUI()
const cubeFolder = gui.addFolder('Cube')
cubeFolder.add(cube.rotation, 'x', 0, Math.PI * 2)
cubeFolder.add(cube.rotation, 'y', 0, Math.PI * 2)
cubeFolder.add(cube.rotation, 'z', 0, Math.PI * 2)
cubeFolder.open()

const cameraFolder = gui.addFolder('Camera')
cameraFolder.add(camera.position, 'z', 0, 20)
cameraFolder.open()

var cubeData = {
    color: cube.material.color.getHex()
}

cubeFolder.addColor(cubeData, 'color').onChange(() => {
    cube.material.color.setHex(Number(cubeData.color))
})
cubeFolder.add(cube.material, 'wireframe')