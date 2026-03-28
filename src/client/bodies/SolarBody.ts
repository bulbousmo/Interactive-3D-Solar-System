import * as THREE from 'three'

export class SolarBody {
    public mesh: THREE.Mesh
    private rotationSpeed: number

    /* Create a solar body with a given name, radius, texture, and rotation speed. 
    The mesh is a sphere with the texture applied, and it casts and receives shadows for better visuals.*/
    constructor(name: string, radius: number, texturePath: string, rotationSpeed: number) {
        const geometry = new THREE.SphereGeometry(radius, 32, 32)
        const texture = new THREE.TextureLoader().load(texturePath)
        const material = new THREE.MeshStandardMaterial({ map: texture })
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.name = name
        this.mesh.castShadow = true
        this.mesh.receiveShadow = true
        this.rotationSpeed = rotationSpeed
    }

    update(delta: number, rotationMultiplier: number = 1): void {
        this.mesh.rotation.y += this.rotationSpeed * delta * rotationMultiplier
    }
}
