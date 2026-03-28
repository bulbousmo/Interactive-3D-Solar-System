import * as THREE from 'three'

export class Raycaster {
    private raycaster: THREE.Raycaster = new THREE.Raycaster()
    private camera: THREE.PerspectiveCamera
    private domElement: HTMLElement
    private meshes: THREE.Mesh[] = []
    private onHit: (name: string) => void
    private skipNextClick: boolean = false

    constructor(
        camera: THREE.PerspectiveCamera,
        domElement: HTMLElement,
        onHit: (name: string) => void
    ) {
        this.camera = camera
        this.domElement = domElement
        this.onHit = onHit

        domElement.addEventListener('click', this.onClick)
    }

    // Register meshes to test against — called once after all bodies are created
    register(meshes: THREE.Mesh[]): void {
        this.meshes.push(...meshes)
    }

    // Call this after unfocusing so the next click enters fly mode instead of selecting a body
    suppressNextClick(): void {
        this.skipNextClick = true
    }

    private onClick = (e: MouseEvent): void => {
        // Ignore clicks made while the pointer is locked (fly mode)
        if (document.pointerLockElement === this.domElement) return

        if (this.skipNextClick) {
            this.skipNextClick = false
            return
        }

        const rect = this.domElement.getBoundingClientRect()

        // Convert pixel coords to NDC — THREE.Raycaster expects [-1, 1] on both axes
        const ndc = new THREE.Vector2(
            ((e.clientX - rect.left)  / rect.width)  *  2 - 1,
            ((e.clientY - rect.top)   / rect.height) * -2 + 1
        )

        this.raycaster.setFromCamera(ndc, this.camera)

        const hits = this.raycaster.intersectObjects(this.meshes)
        if (hits.length > 0) {
            this.onHit(hits[0].object.name)
        }
    }

    dispose(): void {
        this.domElement.removeEventListener('click', this.onClick)
    }
}