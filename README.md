# Interactive 3D Solar System

A browser-based, interactive 3D solar system built with Three.js and TypeScript. Explore all 8 planets, 12 moons, and the Sun in real time with a free-roam fly camera, click-to-focus, search, and per-body info cards.

---

## Features

- All 8 planets and 12 moons rendered as textured spheres with accurate axial tilts
- Saturn's rings with correct radial UV mapping
- Retrograde rotation and orbit for Venus, Uranus, and Triton
- Free-roam 6-DOF fly camera with pointer lock
- Click any body or use the search bar to focus the camera on it
- Info card panel with a live rotating 3D preview, stats, and a description for every body
- Single point light at the Sun — no ambient light, natural shadow falloff across all bodies
- 10,000-star background field
- Runtime GUI sliders for orbit speed and rotation speed
- FPS/memory stats overlay

---

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm

### Install and run

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:8080` (default webpack-dev-server port) with hot module reloading.

### Textures

Texture files are **not** bundled by webpack — they must be placed manually in `dist/client/textures/`. The following files are required:

| File | Body |
|------|------|
| `2k_sun.jpg` | Sun |
| `2k_mercury.jpg` | Mercury |
| `2k_venus_surface.jpg` | Venus |
| `2k_earth_daymap.jpg` | Earth |
| `2k_mars.jpg` | Mars |
| `2k_jupiter.jpg` | Jupiter |
| `2k_saturn.jpg` | Saturn |
| `2k_saturn_ring_alpha.png` | Saturn's rings (alpha strip) |
| `2k_uranus.jpg` | Uranus |
| `2k_neptune.jpg` | Neptune |
| `2k_moon.jpg` | All 12 moons (shared texture) |

Solar texture packs in the 2K equirectangular format are freely available from sources such as [Solar System Scope](https://www.solarsystemscope.com/textures/).

---

## Controls

### Camera (fly mode)

| Input | Action |
|-------|--------|
| Right-click canvas | Toggle pointer lock (enter/exit fly mode) |
| Mouse move | Look around |
| W / S | Fly forward / backward |
| A / D | Strafe left / right |
| E / Q | Fly up / down |
| Shift | 5× speed boost |
| Scroll wheel | Adjust base movement speed |

### Focus

| Input | Action |
|-------|--------|
| Left-click a body | Focus camera on it |
| W / A / S / D / Q / E (while focused) | Unfocus and enter fly mode instantly |
| Escape | Unfocus without entering fly mode |
| `/` | Open the search bar |

### Search bar

Type any planet or moon name to filter results. Use `↑` / `↓` to navigate the dropdown, `Enter` to select, `Escape` to clear.

### GUI sliders (top-right)

| Slider | Range | Default | Effect |
|--------|-------|---------|--------|
| Planet Orbit Speed | 0–1000 | 1 | Multiplier on planetary orbital speed |
| Moon Orbit Speed | 0–1000 | 1 | Multiplier on moon orbital speed |
| Rotation Speed | 0–10 | 1 | Multiplier on all body self-rotation |

---

## Project Structure

```
src/client/
├── client.ts                  # Entry point — wires all modules together
├── scene/
│   ├── SceneManager.ts        # Three.js scene, camera, renderer, animation loop
│   └── StarField.ts           # 10,000-point background star field
├── bodies/
│   ├── SolarBody.ts           # Base class: textured sphere, shadow flags, Y-axis rotation
│   ├── Sun.ts                 # Self-illuminated mesh + scene PointLight
│   ├── Planet.ts              # Extends SolarBody: pivot-orbit pattern, optional rings
│   └── Moon.ts                # Extends SolarBody: pivot follows parent planet each frame
├── controls/
│   ├── CameraController.ts    # Pointer-lock fly camera (6-DOF, WASD/QE, scroll speed)
│   └── FocusController.ts     # Smooth lerp/slerp to a clicked body
├── interaction/
│   └── Raycaster.ts           # Left-click ray casting; handles free and locked cursor
├── data/
│   ├── planets.ts             # PlanetData interface + all 8 planet definitions
│   ├── moons.ts               # MoonData interface + 12 moon definitions
│   └── facts.ts               # BodyFacts interface + text facts for all 22 bodies
└── ui/
    ├── InfoPanel.ts           # Trading-card overlay with live 3D preview
    └── SearchBar.ts           # Fixed search input with real-time dropdown
```

---

## Architecture

### Scene setup (`client.ts`)

`client.ts` is the composition root. It constructs every module in dependency order, hands references between them, and registers a single `onAnimate` callback with `SceneManager` that drives all per-frame updates.

Update order each frame:
1. `CameraController.update` (skipped while focus is active)
2. `FocusController.update` (lerp/slerp toward the focused body)
3. `Sun.update` (self-rotation)
4. `Planet.update` for each planet (self-rotation + pivot orbit)
5. `Moon.trackParent` + `Moon.update` for each moon (sync pivot to parent planet, then self-rotate and orbit)

### Orbit pattern

Both `Planet` and `Moon` use a **pivot-at-origin** pattern. The body mesh is offset along the X axis by its orbital distance, then the invisible pivot `Object3D` is rotated around the Y axis each frame — this moves the mesh in a circle without translating it directly.

Moon pivots follow their parent planet's world position every frame via `trackParent(pos)`, so moons orbit their planet regardless of where the planet currently is in its own orbit.

### Lighting

The `Sun` holds the scene's only `PointLight` as a child of its mesh (`decay: 0` — no distance falloff at solar system scale). No ambient light is added, so the dark side of every body is fully shadowed. Shadow maps are `PCFSoftShadowMap` at 2048×2048.

### Focus + raycasting

`Raycaster` listens for left-clicks. When pointer lock is active it uses the centre NDC `(0, 0)` (crosshair aim); when the pointer is free it uses the actual cursor position. On a hit it calls `FocusController.focus(name)`.

`FocusController` lerps the camera position toward a point `radius × 4` away from the body, and slerpss the camera quaternion to face the body. While active it sets `isActive = true`, which `client.ts` checks to gate `CameraController.update`.

Pressing any movement key while focused calls `unfocus()` and immediately requests pointer lock so the user transitions seamlessly into fly mode.

### InfoPanel

`InfoPanel` builds a themed HTML card for each body. It contains a dedicated `THREE.WebGLRenderer` targeting a `<canvas>` — one renderer is created at startup and reused for every body (only the texture is swapped). Textures are cached in a `Map<string, THREE.Texture>` to avoid re-fetching. The Sun uses `MeshBasicMaterial`; all other bodies use `MeshStandardMaterial` lit by a `DirectionalLight` from the right. The preview sphere's `rotation.z` is set from the body's axial tilt.

---

## Bodies Reference

### Planets

| Planet | Radius | Distance | Notes |
|--------|--------|----------|-------|
| Mercury | 2.44 | 58 | Near-zero tilt |
| Venus | 6.05 | 108 | Retrograde rotation, near-inverted tilt (~177°) |
| Earth | 6.37 | 150 | 23.4° tilt |
| Mars | 3.39 | 228 | 25.2° tilt |
| Jupiter | 20 | 400 | Fastest rotation |
| Saturn | 17 | 600 | Rings (inner r=22, outer r=42), 26.7° tilt |
| Uranus | 10 | 850 | Retrograde rotation, 97.8° tilt (rotates on its side) |
| Neptune | 9.7 | 1100 | 28.3° tilt |

### Moons

| Moon | Parent | Notes |
|------|--------|-------|
| Moon | Earth | |
| Phobos | Mars | Fast orbit (faster than Mars rotates) |
| Deimos | Mars | |
| Io | Jupiter | Galilean moon |
| Europa | Jupiter | Galilean moon |
| Ganymede | Jupiter | Galilean moon, largest moon |
| Callisto | Jupiter | Galilean moon |
| Titan | Saturn | |
| Enceladus | Saturn | |
| Titania | Uranus | |
| Oberon | Uranus | |
| Triton | Neptune | Retrograde orbit (negative `orbitSpeed`), 157.6° inclination |

---

## Tech Stack

| Library | Version | Role |
|---------|---------|------|
| [Three.js](https://threejs.org/) | 0.183 | 3D scene, WebGL renderer, geometries, materials, lighting |
| [dat.gui](https://github.com/dataarts/dat.gui) | 0.7.9 | Runtime GUI sliders |
| three/examples `stats.module` | — | FPS / memory overlay |
| Webpack 5 | 5.105 | Bundling (`webpack-merge` for dev/common split) |
| TypeScript | 6.0 | Static typing, `ts-loader` transpilation |

---

## Known Limitations

- All moons share a single grey crater texture (`2k_moon.jpg`) — individual moon textures are not available.
- Orbital distances and radii are not to scale; they are chosen for visual clarity.
- The `setPanelWidth` method on `SceneManager` (for a split-screen info panel layout) exists but is not currently called — the info card floats over the scene instead.
- There is no build or production bundle script — only `npm run dev`.
