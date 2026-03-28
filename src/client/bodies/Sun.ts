import * as THREE from 'three'

const SUN_RADIUS = 30
const SUN_TEXTURE = 'textures/2k_sun.jpg'
const ROTATION_SPEED = 0.05

export class Sun {
    public mesh: THREE.Mesh
    public light: THREE.PointLight  // Radiates light in all directions from the sun's position

    constructor() {
        // MeshBasicMaterial ignores all lighting — the sun is self-illuminated
        const geometry = new THREE.SphereGeometry(SUN_RADIUS, 32, 32)
        const texture = new THREE.TextureLoader().load(SUN_TEXTURE)
        const material = new THREE.MeshBasicMaterial({ map: texture })

        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.name = 'Sun'

        // Single point light at the origin — the only light source in the scene
        this.light = new THREE.PointLight(0xffffff, 3, 0, 1.2)
        this.light.castShadow = true
        this.light.shadow.mapSize.set(2048, 2048)
        this.mesh.add(this.light)   // Makes sure light moves with the sun mesh
    }

    addToScene(scene: THREE.Scene): void {
        scene.add(this.mesh)
    }

    update(delta: number): void {
        this.mesh.rotation.y += ROTATION_SPEED * delta
    }
}