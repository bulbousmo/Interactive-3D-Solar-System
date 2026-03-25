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

The project is scaffolded as an interactive 3D solar system but currently renders a basic rotating cube as a starting point. The scene includes:
- Perspective camera with adjustable Z position via dat.gui
- Auto-rotating object with GUI controls for rotation axes, color, and wireframe
- Window resize handler that updates camera aspect ratio and renderer dimensions

