import * as THREE from 'three'

const LERP_SPEED = 2       // How fast the camera moves toward the target (per second)
const DISTANCE_FACTOR = 4  // Camera distance = body radius * this

const MOVE_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE'])

export class FocusController {
    private camera: THREE.PerspectiveCamera
    private domElement: HTMLElement
    private bodies: Map<string, THREE.Mesh>
    private onFocus: (name: string) => void
    private onUnfocus: () => void

    private target: THREE.Mesh | null = null
    public isActive: boolean = false

    constructor(
        camera: THREE.PerspectiveCamera,
        domElement: HTMLElement,
        bodies: Map<string, THREE.Mesh>,
        onFocus: (name: string) => void,
        onUnfocus: () => void
    ) {
        this.camera = camera
        this.domElement = domElement
        this.bodies = bodies
        this.onFocus = onFocus
        this.onUnfocus = onUnfocus

        document.addEventListener('keydown', this.onKeyDown)
    }

    focus(name: string): void {
        const mesh = this.bodies.get(name)
        if (!mesh) return

        this.target = mesh
        this.isActive = true
        this.onFocus(name)
    }

    unfocus(): void {
        this.target = null
        this.isActive = false
        this.onUnfocus()
    }

    update(delta: number): void {
        if (!this.target) return

        const bodyPos = this.target.getWorldPosition(new THREE.Vector3())

        // Compute bounding sphere radius to scale the camera offset
        this.target.geometry.computeBoundingSphere()
        const radius = this.target.geometry.boundingSphere!.radius * this.target.scale.x
        const desiredDistance = radius * DISTANCE_FACTOR

        // Approach from the camera's current direction so it doesn't snap to a fixed angle
        const direction = this.camera.position.clone().sub(bodyPos)
        if (direction.length() < 0.001) direction.set(0, 0, 1)
        direction.normalize()

        const desiredPos = bodyPos.clone().addScaledVector(direction, desiredDistance)
        this.camera.position.lerp(desiredPos, LERP_SPEED * delta)

        // Smoothly rotate camera to look at the body
        const targetQuat = new THREE.Quaternion().setFromRotationMatrix(
            new THREE.Matrix4().lookAt(this.camera.position, bodyPos, this.camera.up)
        )
        this.camera.quaternion.slerp(targetQuat, LERP_SPEED * delta)
    }

    private onKeyDown = (e: KeyboardEvent): void => {
        if (!this.isActive) return

        if (e.code === 'Escape') {
            this.unfocus()
        } else if (MOVE_KEYS.has(e.code)) {
            this.unfocus()
            // Request pointer lock immediately so flight starts without an extra click.
            // Browsers allow this from a keydown event since it's a user gesture.
            this.domElement.requestPointerLock()
        }
    }

    dispose(): void {
        document.removeEventListener('keydown', this.onKeyDown)
    }
}