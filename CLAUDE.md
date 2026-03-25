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

The cube demo has been replaced. The following modules are implemented:

- **`scene/SceneManager.ts`** — owns the Three.js scene, camera, renderer, and animation loop. Other modules register per-frame callbacks via `sceneManager.onAnimate(delta => { ... })` and add objects via `scene.add(mesh)`. Shadow maps are enabled (`PCFSoftShadowMap`). Far clip plane is `1,000,000` for solar system scale.
- **`bodies/SolarBody.ts`** — base class for all spherical bodies. Takes `name`, `radius`, `texturePath`, `rotationSpeed`. Exposes a `mesh` (caller adds it to the scene) and an `update(delta)` method that spins it on the Y axis.
- **`data/planets.ts`** — exports a `PlanetData` interface and a `planets` array with all 8 planets. Distance is in scene units (~150 = 1 AU). Radius is exaggerated for visibility. Tilt is in radians.

## What's Next

Build these in order:

1. **`Planet.ts`** — extends `SolarBody`. Reads from `PlanetData`. Handles orbital movement around the sun (use a pivot `Object3D` at the origin, add the mesh to it offset by `distance`, rotate the pivot each frame by `orbitSpeed * delta`). Apply `tilt` to `mesh.rotation.z`.
2. **`Sun.ts`** — extends `SolarBody`. Adds a `PointLight` at the origin (the sun is the only light source). Use `MeshBasicMaterial` instead of `MeshStandardMaterial` so it isn't affected by its own light.
3. **`data/moons.ts`** — same pattern as `planets.ts`. Add a `parentPlanet: string` field to link moons to their parent.
4. **`Moon.ts`** — extends `SolarBody`. Same pivot orbit pattern as `Planet.ts` but pivots around its parent planet's position instead of the origin.
5. **`scene/StarField.ts`** — creates a `Points` geometry with randomly distributed vertices across a large sphere for the background star field.
6. **`controls/CameraController.ts`** — free-roam 3D movement (no flat plane constraint).
7. **`interaction/Raycaster.ts`**, **`controls/FocusController.ts`**, **`ui/InfoPanel.ts`**, **`ui/SearchBar.ts`** — click/search to focus and display planet facts.

