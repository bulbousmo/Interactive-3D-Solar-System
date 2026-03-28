import * as THREE from 'three'
import { SolarBody } from './SolarBody'
import { MoonData } from '../data/moons'

export class Moon extends SolarBody {
    private pivot: THREE.Object3D
    private orbitSpeed: number

    constructor(data: MoonData, parentPosition: THREE.Vector3) {
        super(data.name, data.radius, data.texturePath, data.rotationSpeed)

        this.mesh.castShadow = false

        this.orbitSpeed = data.orbitSpeed

        this.mesh.rotation.z = data.tilt
        this.mesh.position.x = data.distance

        // Pivot is placed at the parent planet's current position, not the origin (sun -> earth -> moon)
        this.pivot = new THREE.Object3D()
        this.pivot.position.copy(parentPosition)
        this.pivot.add(this.mesh)
    }

    addToScene(scene: THREE.Scene): void {
        scene.add(this.pivot)
    }

    // Called each frame to keep the pivot on the parent planet as it orbits
    trackParent(parentPosition: THREE.Vector3): void {
        this.pivot.position.copy(parentPosition)
    }

    update(delta: number, rotationMultiplier: number = 1): void {
        super.update(delta, rotationMultiplier)
        this.pivot.rotation.y += this.orbitSpeed * delta
    }
}
