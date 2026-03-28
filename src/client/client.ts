import { GUI } from 'dat.gui'
import { SceneManager } from './scene/SceneManager'
import { StarField } from './scene/StarField'
import { Sun } from './bodies/Sun'
import { Planet } from './bodies/Planet'
import { Moon } from './bodies/Moon'
import { CameraController } from './controls/CameraController'
import { FocusController } from './controls/FocusController'
import { Raycaster } from './interaction/Raycaster'
import { planets } from './data/planets'
import { moons } from './data/moons'

// Instantiate the scene manager and start animation loop
const sceneManager = new SceneManager()

// Add a star field background
const starField = new StarField()
starField.addToScene(sceneManager.scene)

// Sun at the origin — also the scene's only light source
const sun = new Sun()
sun.addToScene(sceneManager.scene)

// Create planet objects from data and add them to the scene
const planetObjects = planets.map(data => {
    const planet = new Planet(data)
    planet.addToScene(sceneManager.scene)
    return planet
})

// Build a name -> Planet lookup so moons can find their parent
// O(1) lookup by name instead of O(n) search each frame
const planetByName = new Map(planetObjects.map((p, i) => [planets[i].name, p]))

// Create moon objects — each starts at its parent planet's initial position
const moonObjects = moons.map(data => {
    const parent = planetByName.get(data.parentPlanet)!
    const moon = new Moon(data, parent.getWorldPosition())
    moon.addToScene(sceneManager.scene)
    return { moon, parentName: data.parentPlanet }
})

// Collect all clickable meshes and build a name -> mesh map for focus tracking
const allMeshes = [
    sun.mesh,
    ...planetObjects.map(p => p.mesh),
    ...moonObjects.map(({ moon }) => moon.mesh)
]
const bodyByName = new Map(allMeshes.map(m => [m.name, m]))

const cameraController = new CameraController(sceneManager.camera, sceneManager.renderer.domElement)

// Declare first so both closures below can reference each other without circular init errors.
// JS closures capture the variable reference, so both will be assigned by the time any click fires.
let raycaster: Raycaster
let focusController: FocusController

raycaster = new Raycaster(
    sceneManager.camera,
    sceneManager.renderer.domElement,
    (name) => focusController.focus(name)
)
raycaster.register(allMeshes)

focusController = new FocusController(
    sceneManager.camera,
    sceneManager.renderer.domElement,
    bodyByName,
    (name) => { console.log(`Focused: ${name}`) },  // onFocus — InfoPanel hooks in here
    ()     => { raycaster.suppressNextClick() }      // onUnfocus — next click enters fly mode
)

const simParams = { orbitSpeed: 1, rotationSpeed: 1 }
const gui = new GUI({ width: 250 })
gui.add(simParams, 'orbitSpeed',    0, 10, 0.1).name('Orbit Speed')
gui.add(simParams, 'rotationSpeed', 0, 10, 0.1).name('Rotation Speed')

sceneManager.onAnimate(delta => {
    // Disable free-fly while the camera is tracking a body
    if (!focusController.isActive) cameraController.update(delta)
    focusController.update(delta)
    sun.update(delta * simParams.rotationSpeed)
    planetObjects.forEach(p => p.update(delta, simParams.orbitSpeed, simParams.rotationSpeed))

    // Planets must update first so their world positions are current
    moonObjects.forEach(({ moon, parentName }) => {
        const parent = planetByName.get(parentName)!
        moon.trackParent(parent.getWorldPosition())
        moon.update(delta * simParams.orbitSpeed, simParams.rotationSpeed)
    })
})

sceneManager.start()
