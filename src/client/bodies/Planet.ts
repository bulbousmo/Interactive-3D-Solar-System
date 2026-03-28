import * as THREE from 'three'
import { SolarBody } from './SolarBody'
import { PlanetData } from '../data/planets'

export class Planet extends SolarBody {
    private pivot: THREE.Object3D
    private orbitSpeed: number

    constructor(data: PlanetData) {
        super(data.name, data.radius, data.texturePath, data.rotationSpeed)

        this.orbitSpeed = data.orbitSpeed

        // Apply axial tilt to the mesh before placing it in the pivot
        this.mesh.rotation.z = data.tilt

        // Offset the mesh from the origin by the orbital distance
        this.mesh.position.x = data.distance

        // The pivot sits at the origin (the sun). To make the planet orbit, we rotate the pivot, which moves the planet around the sun.
        this.pivot = new THREE.Object3D()
        this.pivot.add(this.mesh)   //  Parent-child relationship: pivot -> mesh
    }

    getWorldPosition(): THREE.Vector3 {
        return this.mesh.getWorldPosition(new THREE.Vector3())
    }

    addToScene(scene: THREE.Scene): void {
        scene.add(this.pivot)
    }

    update(delta: number, orbitMultiplier: number = 1, rotationMultiplier: number = 1): void {
        super.update(delta, rotationMultiplier)
        this.pivot.rotation.y += this.orbitSpeed * delta * orbitMultiplier
    }
}