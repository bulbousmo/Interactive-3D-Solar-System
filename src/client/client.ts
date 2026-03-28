import { SceneManager } from './scene/SceneManager'
import { StarField } from './scene/StarField'
import { Sun } from './bodies/Sun'
import { Planet } from './bodies/Planet'
import { Moon } from './bodies/Moon'
import { CameraController } from './controls/CameraController'
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

const cameraController = new CameraController(sceneManager.camera, sceneManager.renderer.domElement)

sceneManager.onAnimate(delta => {
    cameraController.update(delta)
    sun.update(delta)
    planetObjects.forEach(p => p.update(delta))

    // Planets must update first so their world positions are current
    moonObjects.forEach(({ moon, parentName }) => {
        const parent = planetByName.get(parentName)!
        moon.update(delta, parent.getWorldPosition())
    })
})

sceneManager.start()
