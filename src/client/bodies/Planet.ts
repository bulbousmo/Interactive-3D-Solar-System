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

        if (data.rings) {
            const { innerRadius, outerRadius, texturePath } = data.rings

            const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 128)

            // Fix UVs: default RingGeometry wraps UVs around the ring.
            // Remap so U goes 0→1 from inner edge to outer edge (radial mapping),
            // which is what a Saturn ring strip texture expects.
            const pos = ringGeo.attributes.position as THREE.BufferAttribute
            const uv  = ringGeo.attributes.uv  as THREE.BufferAttribute
            const v   = new THREE.Vector3()
            for (let i = 0; i < pos.count; i++) {
                v.fromBufferAttribute(pos, i)
                const u = (v.length() - innerRadius) / (outerRadius - innerRadius)
                uv.setXY(i, u, 1)
            }
            uv.needsUpdate = true

            const ringTex = new THREE.TextureLoader().load(texturePath)
            const ringMat = new THREE.MeshStandardMaterial({
                map:         ringTex,
                alphaMap:    ringTex,
                transparent: true,
                side:        THREE.DoubleSide,
                depthWrite:  false,
            })

            const ring = new THREE.Mesh(ringGeo, ringMat)
            // RingGeometry lies in the XY plane — rotate to XZ so it's horizontal
            ring.rotation.x = -Math.PI / 2
            ring.receiveShadow = true
            ring.castShadow    = true

            // Parent to the mesh so it orbits and tilts with the planet
            this.mesh.add(ring)
        }

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