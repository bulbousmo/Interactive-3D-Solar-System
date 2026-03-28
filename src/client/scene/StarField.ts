import * as THREE from 'three'

const STAR_COUNT = 10_000
const FIELD_RADIUS = 900_000   // Just inside the far clip plane (1,000,000)

export class StarField {
    private points: THREE.Points

    constructor() {
        // Need three components (x, y, z) for each star
        const positions = new Float32Array(STAR_COUNT * 3)

        for (let i = 0; i < STAR_COUNT; i++) {
            // Random point on a sphere surface using spherical coordinates
            const theta = Math.random() * 2 * Math.PI
            const phi = Math.acos(2 * Math.random() - 1)
            const r = FIELD_RADIUS * (0.8 + 0.2 * Math.random())

            // Convert spherical to Cartesian coordinates
            positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            positions[i * 3 + 2] = r * Math.cos(phi)
        }

        // GPU-friendly format for rendering points
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 300,          // World-space size — large because the sphere is huge
            sizeAttenuation: true,
        })

        this.points = new THREE.Points(geometry, material)
    }

    addToScene(scene: THREE.Scene): void {
        scene.add(this.points)
    }
}