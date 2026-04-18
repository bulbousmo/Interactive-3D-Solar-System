import * as THREE from 'three'
import { facts, BodyFacts } from '../data/facts'
import { planets } from '../data/planets'
import { moons }   from '../data/moons'

// ─── texture path lookup ──────────────────────────────────────────────────────

const TEXTURE_PATH: Record<string, string> = { Sun: 'textures/2k_sun.jpg' }
planets.forEach(p => { TEXTURE_PATH[p.name] = p.texturePath })
moons.forEach(m =>   { TEXTURE_PATH[m.name] = m.texturePath })

// Axial tilt per body (radians) for the preview sphere
const TILT: Record<string, number> = { Sun: 0 }
planets.forEach(p => { TILT[p.name] = p.tilt })
moons.forEach(m =>   { TILT[m.name] = m.tilt })

const ORB_SIZE = 240   // px — diameter of the preview canvas

// ─── per-body card themes ────────────────────────────────────────────────────

interface CardTheme {
    headerTop:  string
    headerBot:  string
    border:     string
    glow:       string
    badgeBg:    string
    badgeText:  string
}

const THEMES: Record<string, CardTheme> = {
    Sun:     { headerTop:'#FFD700', headerBot:'#FF6B00', border:'#FFD700', glow:'rgba(255,200,0,0.6)',   badgeBg:'#FF6B00', badgeText:'#fff8dc' },
    Mercury: { headerTop:'#B0B8C8', headerBot:'#6B7280', border:'#9CA3AF', glow:'rgba(156,163,175,0.4)', badgeBg:'#6B7280', badgeText:'#e5e7eb' },
    Venus:   { headerTop:'#FCD34D', headerBot:'#D97706', border:'#F59E0B', glow:'rgba(245,158,11,0.45)', badgeBg:'#D97706', badgeText:'#fefce8' },
    Earth:   { headerTop:'#60A5FA', headerBot:'#059669', border:'#3B82F6', glow:'rgba(59,130,246,0.45)', badgeBg:'#1D4ED8', badgeText:'#dbeafe' },
    Mars:    { headerTop:'#F87171', headerBot:'#991B1B', border:'#EF4444', glow:'rgba(239,68,68,0.45)',  badgeBg:'#991B1B', badgeText:'#fee2e2' },
    Jupiter: { headerTop:'#FDE68A', headerBot:'#92400E', border:'#F59E0B', glow:'rgba(245,158,11,0.45)', badgeBg:'#92400E', badgeText:'#fef3c7' },
    Saturn:  { headerTop:'#FDE68A', headerBot:'#78350F', border:'#D4A017', glow:'rgba(212,160,23,0.45)', badgeBg:'#78350F', badgeText:'#fef3c7' },
    Uranus:  { headerTop:'#67E8F9', headerBot:'#0E7490', border:'#22D3EE', glow:'rgba(103,232,249,0.4)', badgeBg:'#0E7490', badgeText:'#cffafe' },
    Neptune: { headerTop:'#60A5FA', headerBot:'#1E3A8A', border:'#3B82F6', glow:'rgba(59,130,246,0.45)', badgeBg:'#1E3A8A', badgeText:'#dbeafe' },
    default: { headerTop:'#C4B5FD', headerBot:'#4B5563', border:'#A78BFA', glow:'rgba(167,139,250,0.4)', badgeBg:'#4B5563', badgeText:'#ede9fe' },
}

// ─── injected CSS (holographic shimmer only — no blur) ────────────────────────

const CARD_CSS = `
@keyframes holo-shift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
.solar-card { position: relative; overflow: hidden; }
.solar-card .holo-layer {
    pointer-events: none; position: absolute; inset: 0; border-radius: 18px;
    opacity: 0; transition: opacity 0.4s;
    background: linear-gradient(135deg,
        rgba(255,0,128,0.07) 0%, rgba(255,165,0,0.07) 20%,
        rgba(255,255,0,0.07) 40%, rgba(0,255,128,0.07) 60%,
        rgba(0,128,255,0.07) 80%, rgba(160,0,255,0.07) 100%
    );
    background-size: 300% 300%;
    animation: holo-shift 5s ease infinite;
    mix-blend-mode: screen;
}
.solar-card:hover .holo-layer { opacity: 1; }
`

// ─── InfoPanel ────────────────────────────────────────────────────────────────

export class InfoPanel {
    private backdrop: HTMLDivElement

    // Mini Three.js scene — created once, reused for every planet view
    private miniCanvas:   HTMLCanvasElement
    private miniRenderer: THREE.WebGLRenderer
    private miniScene:    THREE.Scene
    private miniCamera:   THREE.PerspectiveCamera
    private miniSphere:   THREE.Mesh<THREE.SphereGeometry, THREE.Material>
    private miniBasicMat: THREE.MeshBasicMaterial   // used for the Sun
    private miniStdMat:   THREE.MeshStandardMaterial // used for all other bodies
    private miniAnimId:   number | null = null
    private miniLoader =  new THREE.TextureLoader()
    private loadedTextures: Map<string, THREE.Texture> = new Map()

    constructor() {
        const style = document.createElement('style')
        style.textContent = CARD_CSS
        document.head.appendChild(style)

        // ── card wrapper — no backdrop, floats over the live scene ───────────
        this.backdrop = document.createElement('div')
        Object.assign(this.backdrop.style, {
            position:       'fixed',
            top:            '50%',
            left:           '24px',
            transform:      'translateX(calc(-100% - 24px)) translateY(-50%)',
            transition:     'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease',
            opacity:        '0',
            pointerEvents:  'none',
            zIndex:         '100',
        })
        document.body.appendChild(this.backdrop)

        // ── mini Three.js renderer ─────────────────────────────────────────
        this.miniCanvas = document.createElement('canvas')
        this.miniCanvas.width  = ORB_SIZE
        this.miniCanvas.height = ORB_SIZE

        this.miniRenderer = new THREE.WebGLRenderer({
            canvas:    this.miniCanvas,
            antialias: true,
        })
        this.miniRenderer.setSize(ORB_SIZE, ORB_SIZE)
        this.miniRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.miniRenderer.setClearColor(0x00000a, 1)  // deep space black

        this.miniScene  = new THREE.Scene()
        this.miniCamera = new THREE.PerspectiveCamera(38, 1, 0.1, 30)
        this.miniCamera.position.set(0, 0, 3.2)

        // Light from the right to match the Sun's position in the main scene
        const dirLight = new THREE.DirectionalLight(0xffffff, 2.8)
        dirLight.position.set(4, 2, 3)
        this.miniScene.add(dirLight)
        this.miniScene.add(new THREE.AmbientLight(0xffffff, 0.06))

        // Starfield — large sphere that surrounds the camera so stars appear in all directions
        const starCount = 1200
        const starPos   = new Float32Array(starCount * 3)
        for (let i = 0; i < starCount; i++) {
            const theta = Math.random() * Math.PI * 2
            const phi   = Math.acos(2 * Math.random() - 1)
            const r     = 15 + Math.random() * 5
            starPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
            starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            starPos[i * 3 + 2] = r * Math.cos(phi)
        }
        const starGeo = new THREE.BufferGeometry()
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
        this.miniScene.add(new THREE.Points(
            starGeo,
            new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, sizeAttenuation: true })
        ))

        this.miniStdMat   = new THREE.MeshStandardMaterial({ roughness: 0.82, metalness: 0 })
        this.miniBasicMat = new THREE.MeshBasicMaterial()

        const geo = new THREE.SphereGeometry(1, 48, 48)
        this.miniSphere = new THREE.Mesh(geo, this.miniStdMat)
        this.miniScene.add(this.miniSphere)
    }

    show(name: string): void {
        const data = facts[name]
        if (!data) return

        this.stopMiniAnimation()

        const t = THEMES[name] ?? THEMES['default']
        this.backdrop.innerHTML = this.buildCard(name, data, t)
        this.backdrop.style.transform = 'translateX(0) translateY(-50%)'
        this.backdrop.style.opacity = '1'
        this.backdrop.style.pointerEvents = 'auto'

        // Mount the canvas into the art slot that buildCard left in the DOM
        const slot = this.backdrop.querySelector('#planet-art-slot') as HTMLDivElement | null
        if (slot) {
            Object.assign(this.miniCanvas.style, {
                borderRadius: '50%',
                display:      'block',
                boxShadow:    `0 0 36px ${t.glow}, inset 0 0 8px rgba(255,255,255,0.08)`,
                border:       '2px solid rgba(255,255,255,0.18)',
            })
            slot.appendChild(this.miniCanvas)
        }

        // Swap material: Sun is self-illuminated, everything else is lit
        if (name === 'Sun') {
            this.miniSphere.material = this.miniBasicMat
        } else {
            this.miniSphere.material = this.miniStdMat
            this.miniStdMat.map = null
            this.miniStdMat.needsUpdate = true
        }

        // Apply axial tilt
        this.miniSphere.rotation.z = TILT[name] ?? 0
        this.miniSphere.rotation.y = 0

        // Load (or reuse cached) texture
        const texPath = TEXTURE_PATH[name]
        if (texPath) {
            const cached = this.loadedTextures.get(texPath)
            if (cached) {
                this.applyTexture(name, cached)
            } else {
                this.miniLoader.load(texPath, tex => {
                    tex.colorSpace = THREE.SRGBColorSpace
                    this.loadedTextures.set(texPath, tex)
                    this.applyTexture(name, tex)
                })
            }
        }

        this.startMiniAnimation()
    }

    hide(): void {
        this.stopMiniAnimation()
        this.backdrop.style.transform = 'translateX(calc(-100% - 24px)) translateY(-50%)'
        this.backdrop.style.opacity = '0'
        this.backdrop.style.pointerEvents = 'none'
    }

    private applyTexture(name: string, tex: THREE.Texture): void {
        if (name === 'Sun') {
            this.miniBasicMat.map = tex
            this.miniBasicMat.needsUpdate = true
        } else {
            this.miniStdMat.map = tex
            this.miniStdMat.needsUpdate = true
        }
    }

    private startMiniAnimation(): void {
        const loop = (): void => {
            this.miniAnimId = requestAnimationFrame(loop)
            this.miniSphere.rotation.y += 0.004
            this.miniRenderer.render(this.miniScene, this.miniCamera)
        }
        loop()
    }

    private stopMiniAnimation(): void {
        if (this.miniAnimId !== null) {
            cancelAnimationFrame(this.miniAnimId)
            this.miniAnimId = null
        }
    }

    private buildCard(name: string, data: BodyFacts, t: CardTheme): string {
        const subtitle  = data.parent ? `${data.type} · ${data.parent}` : data.type

        const statRows = (
            [
                ['Diameter',       data.diameter],
                ['Distance',       data.distance],
                ['Orbital period', data.orbitalPeriod],
                ['Day length',     data.dayLength],
            ] as [string, string][]
        ).map(([label, value]) => `
            <div style="
                display:flex; justify-content:space-between; align-items:baseline;
                padding:10px 0; border-bottom:1px solid rgba(0,0,0,0.12);
                font-size:15px; gap:12px;
            ">
                <span style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:0.6px;white-space:nowrap">${label}</span>
                <span style="color:#111;font-weight:500;text-align:right">${value}</span>
            </div>`
        ).join('')

        return `
        <div class="solar-card" style="
            width: min(560px, calc(100vw - 48px));
            border-radius: 20px;
            border: 3px solid ${t.border};
            box-shadow: 0 0 0 1px rgba(0,0,0,0.6), 0 0 48px ${t.glow}, 0 24px 64px rgba(0,0,0,0.7);
            background: #1a1a2e;
            font-family: sans-serif;
            overflow: hidden;
            user-select: none;
        ">
            <div class="holo-layer"></div>

            <!-- header -->
            <div style="
                background: linear-gradient(160deg, ${t.headerTop}, ${t.headerBot});
                padding: 24px 24px 20px;
                display: flex; justify-content: space-between; align-items: flex-start;
            ">
                <div>
                    <div style="font-size:32px;font-weight:800;color:#fff;
                        text-shadow:0 1px 4px rgba(0,0,0,0.5);letter-spacing:-0.5px;line-height:1.1">${name}</div>
                    <div style="margin-top:8px;display:inline-block;
                        background:${t.badgeBg};color:${t.badgeText};
                        font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;
                        padding:4px 12px;border-radius:20px;border:1px solid rgba(255,255,255,0.25)">${subtitle}</div>
                </div>
                <div style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.85);
                    text-shadow:0 1px 3px rgba(0,0,0,0.4);white-space:nowrap;padding-top:2px;text-align:right">
                    ⌀ ${data.diameter}
                </div>
            </div>

            <!-- art area — canvas is appended here by show() -->
            <div style="
                background: #00000a;
                padding: 24px; display: flex; justify-content: center; align-items: center;
            ">
                <div id="planet-art-slot" style="width:${ORB_SIZE}px;height:${ORB_SIZE}px"></div>
            </div>

            <!-- stats -->
            <div style="background:#f0ede8;padding:16px 22px 12px;border-top:3px solid ${t.border}">
                ${statRows}
            </div>

            <!-- flavour text -->
            <div style="background:#e8e4dc;padding:16px 22px;
                font-size:14px;color:#333;font-style:italic;
                line-height:1.7;border-top:1px solid rgba(0,0,0,0.15)">${data.description}</div>

            <!-- footer -->
            <div style="background:#1a1a2e;padding:9px 22px;
                display:flex;justify-content:space-between;align-items:center">
                <span style="color:#444;font-size:10px;letter-spacing:0.5px">SOLAR SYSTEM · ${data.type.toUpperCase()}</span>
                <span style="color:#555;font-size:11px">✦ ✦ ✦</span>
            </div>
        </div>`
    }
}