import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'

/* Scene manager handles the main three.js setup and animation loop, and provides a way 
for other modules to register animation callbacks. It also includes a stats overlay for performance monitoring.*/
export class SceneManager { 
    // Public so they can be accessed by other modules
    public scene: THREE.Scene
    public camera: THREE.PerspectiveCamera
    public renderer: THREE.WebGLRenderer

    private stats: Stats    // Stats overlay for monitoring performance
    private animateCallbacks: Array<(delta: number) => void> = [] // Callbacks to run each frame, with delta time in seconds
    private clock: THREE.Clock  // Clock to track time between frames for smooth animation
    private animationFrameId: number | null = null  // ID for the animation frame, used to stop the loop when needed

    constructor() {
        this.scene = new THREE.Scene()
        this.clock = new THREE.Clock()

        // Camera — wide FOV for space feel, far clip plane for solar system scale
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1_000_000
        )
        this.camera.position.set(0, 50, 200)

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap   // Soft shadows for better visuals
        document.body.appendChild(this.renderer.domElement) // Add the canvas to the document

        // Stats overlay
        this.stats = new Stats()
        document.body.appendChild(this.stats.dom)

        window.addEventListener('resize', this.onResize)
    }

    // Register a callback to run each animation frame. Receives delta time in seconds.
    public onAnimate(callback: (delta: number) => void): void {
        this.animateCallbacks.push(callback)
    }

    public start(): void {
        this.loop()
    }

    public stop(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId)
            this.animationFrameId = null
        }
    }
 
    // Main animation loop: calls registered callbacks with delta time, renders the scene, and updates stats.
    private loop = (): void => {
        this.animationFrameId = requestAnimationFrame(this.loop)
        // Time in seconds since last frame, used for smooth animation regardless of frame rate
        const delta = this.clock.getDelta()
        // Run all animation callbacks
        for (const cb of this.animateCallbacks) cb(delta)
        this.renderer.render(this.scene, this.camera)
        this.stats.update()
    }

    private onResize = (): void => {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
    }

    public dispose(): void {
        this.stop()
        window.removeEventListener('resize', this.onResize)
        this.renderer.dispose()
    }
}
