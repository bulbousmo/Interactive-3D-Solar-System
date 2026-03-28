import * as THREE from 'three'

const BASE_SPEED = 50
const BOOST_MULTIPLIER = 5
const MOUSE_SENSITIVITY = 0.002
const SCROLL_SPEED_FACTOR = 0.001

export class CameraController {
    private camera: THREE.PerspectiveCamera
    private domElement: HTMLElement

    private isLocked: boolean = false
    private keys: Set<string> = new Set()
    private euler: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ')
    private speed: number = BASE_SPEED

    constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
        this.camera = camera
        this.domElement = domElement

        domElement.addEventListener('click', this.onLock)
        document.addEventListener('pointerlockchange', this.onPointerLockChange)
        document.addEventListener('mousemove', this.onMouseMove)
        document.addEventListener('keydown', this.onKeyDown)
        document.addEventListener('keyup', this.onKeyUp)
        domElement.addEventListener('wheel', this.onWheel)
    }

    // Click the canvas to capture the mouse
    private onLock = (): void => {
        this.domElement.requestPointerLock()
    }

    private onPointerLockChange = (): void => {
        this.isLocked = document.pointerLockElement === this.domElement
    }

    private onMouseMove = (e: MouseEvent): void => {
        if (!this.isLocked) return

        // Read current rotation into euler, apply mouse delta, write back
        this.euler.setFromQuaternion(this.camera.quaternion)
        this.euler.y -= e.movementX * MOUSE_SENSITIVITY
        this.euler.x -= e.movementY * MOUSE_SENSITIVITY

        // Clamp pitch so the camera can't flip upside-down
        this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x))

        this.camera.quaternion.setFromEuler(this.euler)
    }

    // Scroll wheel adjusts base movement speed so the user can tune it on the fly
    private onWheel = (e: WheelEvent): void => {
        this.speed = Math.max(1, this.speed + e.deltaY * SCROLL_SPEED_FACTOR * this.speed)
    }

    private onKeyDown = (e: KeyboardEvent): void => { this.keys.add(e.code) }
    private onKeyUp   = (e: KeyboardEvent): void => { this.keys.delete(e.code) }

    update(delta: number): void {
        if (!this.isLocked) return

        const boosted = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight')
        const frameSpeed = (boosted ? this.speed * BOOST_MULTIPLIER : this.speed) * delta

        // Camera-local axes — movement is always relative to where the camera is pointing
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion)
        const right   = new THREE.Vector3(1, 0,  0).applyQuaternion(this.camera.quaternion)
        const up      = new THREE.Vector3(0, 1,  0).applyQuaternion(this.camera.quaternion)

        if (this.keys.has('KeyW')) this.camera.position.addScaledVector(forward,  frameSpeed)
        if (this.keys.has('KeyS')) this.camera.position.addScaledVector(forward, -frameSpeed)
        if (this.keys.has('KeyA')) this.camera.position.addScaledVector(right,   -frameSpeed)
        if (this.keys.has('KeyD')) this.camera.position.addScaledVector(right,    frameSpeed)
        if (this.keys.has('KeyE')) this.camera.position.addScaledVector(up,       frameSpeed)
        if (this.keys.has('KeyQ')) this.camera.position.addScaledVector(up,      -frameSpeed)
    }

    dispose(): void {
        this.domElement.removeEventListener('click', this.onLock)
        document.removeEventListener('pointerlockchange', this.onPointerLockChange)
        document.removeEventListener('mousemove', this.onMouseMove)
        document.removeEventListener('keydown', this.onKeyDown)
        document.removeEventListener('keyup', this.onKeyUp)
        this.domElement.removeEventListener('wheel', this.onWheel)
    }
}