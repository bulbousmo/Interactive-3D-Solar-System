# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev    # Start webpack dev server with hot module reloading
```

The dev server serves from `dist/client/` and bundles output to `dist/client/bundle.js`.

There are no build, lint, or test scripts defined — only `dev`.

## Architecture

Single-page TypeScript + Three.js client-side application:

- **Entry point**: `src/client/client.ts` — all application logic lives here
- **HTML shell**: `dist/client/index.html` — loads `bundle.js` as a module script
- **Webpack config**: split across `src/client/webpack.common.js` and `src/client/webpack.dev.js` (merged via webpack-merge)
- **TypeScript config**: `src/client/tsconfig.json`
- **Build output**: `dist/client/bundle.js` (gitignored build artifact)

## Stack

- **Three.js** (v0.183) — 3D scene, WebGL renderer, geometries, materials
- **dat.gui** — runtime GUI controls (camera, object properties)
- **three/examples/jsm/libs/stats.module** — FPS/memory overlay
- **Webpack 5** + **ts-loader** — bundling and TypeScript transpilation

## Project Description
The project that I selected is the WebGL with Three.js option. I will be implementing an interactive 3 dimensional solar system where the user can move through it. I plan on having all the planets in our solar system, the sun, any significant moons, and stars that will be randomly placed throughout the scene. An animation that I plan on including is rotating planets and moons, with the far side at any point having a shadow. If a user clicks on a planet, it will focus and there will be a pop up providing details about the planet. Another way to focus on solar bodies will be a search functionality where typing in a name will focus on the moon or planet. 
This project will differ from the provided tutorials since it will not reside on a flat plane and gravity won't have much impact. This design choice will allow the user to ideally go around planets as well as above and below them. Additionally, the idea is to not use ambient lighting and simply use the sun as a light source. This will cast shadows on the faces of objects that are not facing towards the sun at any given time. Another big difference will be the focus functionality, whether a user clicks on or searches for something, it will focus and display an informational pop up. 
    Planned Functionality:
    Sun, planets, and moons as spheres with textures
    Spinning animation of planets and moons
    Camera and movement controls
    Search or click to focus on planets/moons
    Optimized lighting + shadows
Additional resources that I plan on using are online documentation and forums discussing the tool. I will also look for good texture packs and if not try to create some on my own. The facts that I will display will come from some reliable source. 


## Current State

The following modules are implemented:

- **`scene/SceneManager.ts`** — owns the Three.js scene, camera, renderer, and animation loop. Other modules register per-frame callbacks via `sceneManager.onAnimate(delta => { ... })` and add objects via `scene.add(mesh)`. Shadow maps are enabled (`PCFSoftShadowMap`). Far clip plane is `1,000,000` for solar system scale.
- **`bodies/SolarBody.ts`** — base class for all spherical bodies. Takes `name`, `radius`, `texturePath`, `rotationSpeed`. Exposes a `mesh` and an `update(delta, rotationMultiplier?)` method that spins it on the Y axis.
- **`bodies/Sun.ts`** — not a SolarBody subclass. Uses `MeshBasicMaterial` (self-illuminated, ignores lighting). Owns the scene's only `PointLight` (intensity 2, decay 0, infinite range) as a child of the mesh. `decay: 0` means no distance falloff — all planets receive equal illumination. Shadow map resolution 2048x2048.
- **`bodies/Planet.ts`** — extends `SolarBody`. Uses a pivot `Object3D` at the origin; mesh is offset by `distance` on X. Pivot rotates on Y each frame for orbit. `update(delta, orbitMultiplier?, rotationMultiplier?)`. `getWorldPosition()` returns the mesh's world-space position for moon tracking. Tilt applied to `mesh.rotation.z`.
- **`bodies/Moon.ts`** — extends `SolarBody`. Same pivot pattern as `Planet.ts` but pivot follows parent planet's world position via `trackParent(pos)` called each frame before `update`. `castShadow` disabled. `update(delta, rotationMultiplier?)`.
- **`scene/StarField.ts`** — `Points` geometry with 10,000 vertices distributed uniformly on a sphere of radius 900,000 using spherical coordinates. `PointsMaterial` with size attenuation.
- **`controls/CameraController.ts`** — free-roam 6-DOF fly camera. Click canvas to lock pointer, Escape to release. Mouse sensitivity `0.002`, YXZ Euler order, pitch clamped to ±90°. Movement along camera-local axes. Scroll wheel adjusts base speed. Boost multiplier: 5×.
- **`controls/FocusController.ts`** — click a body to smoothly lerp/slerp the camera toward it and track it as it orbits. `isActive` flag gates `CameraController`. Press a movement key while focused to instantly unfocus and enter fly mode (requests pointer lock immediately). Press Escape to unfocus without locking.
- **`interaction/Raycaster.ts`** — wraps `THREE.Raycaster`. On click (when pointer is not locked), converts mouse coords to NDC, casts a ray, fires `onHit(name)` with the closest mesh's name. `suppressNextClick()` skips one click event — called on unfocus so Escape → first click enters fly mode rather than re-selecting.
- **`data/planets.ts`** — exports `PlanetData` interface and `planets` array with all 8 planets. Distance in scene units (~150 = 1 AU), radius exaggerated for visibility, tilt in radians.
- **`data/moons.ts`** — exports `MoonData` interface (same as `PlanetData` plus `parentPlanet: string`) and `moons` array with 12 moons across Earth, Mars, Jupiter, Saturn, Uranus, Neptune. Includes Triton's retrograde orbit (negative orbitSpeed) and Phobos's fast orbit.

### Camera Controls

| Input | Action |
|-------|--------|
| Click canvas | Lock pointer / enter fly mode |
| Escape | Release pointer / unfocus |
| Mouse move | Look around |
| W / S | Fly forward / back |
| A / D | Strafe left / right |
| E / Q | Fly up / down |
| Shift | 5× speed boost |
| Scroll wheel | Adjust base speed |
| Click body | Focus camera on it |
| W/A/S/D/Q/E while focused | Unfocus + enter fly mode instantly |

### GUI Controls
`dat.gui` panel (top-right) exposes two sliders:
- **Orbit Speed** — multiplier for all orbital movement (0–10, default 1)
- **Rotation Speed** — multiplier for all body self-rotation (0–10, default 1)

### Textures
Static assets are served directly from `dist/client/` by the webpack dev server. Textures live at `dist/client/textures/<name>.jpg`. There is no copy plugin — files must be placed there manually.

## What's Next

1. **`ui/InfoPanel.ts`** — HTML overlay that shows facts about the focused body. Hook into `FocusController`'s `onFocus`/`onUnfocus` callbacks in `client.ts`.
2. **`ui/SearchBar.ts`** — text input that calls `focusController.focus(name)` on submit.

