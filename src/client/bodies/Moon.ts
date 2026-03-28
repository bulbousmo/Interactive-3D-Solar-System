import * as THREE from 'three'
import { SolarBody } from './SolarBody'
import { MoonData } from '../data/moons'

export class Moon extends SolarBody {
    private pivot: THREE.Object3D
    private orbitSpeed: number

    constructor(data: MoonData, parentPosition: THREE.Vector3) {
        super(data.name, data.radius, data.texturePath, data.rotationSpeed)

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

    // Called each frame with delta and the parent planet's latest world position
    update(delta: number, parentPosition?: THREE.Vector3): void {
        super.update(delta)
        this.pivot.rotation.y += this.orbitSpeed * delta

        // Track the parent planet as it moves along its own orbit
        if (parentPosition) this.pivot.position.copy(parentPosition)
    }
}
