export interface MoonData {
    name: string
    parentPlanet: string
    radius: number
    distance: number       // Distance from parent planet in scene units
    rotationSpeed: number
    orbitSpeed: number
    texturePath: string
    tilt: number
}

export const moons: MoonData[] = [
    // Earth
    {
        name: 'Moon',
        parentPlanet: 'Earth',
        radius: 2.5,
        distance: 20,
        rotationSpeed: 0.1,
        orbitSpeed: 0.5,
        texturePath: 'textures/2k_moon.jpg',
        tilt: 0.027
    },

    // Mars
    {
        name: 'Phobos',
        parentPlanet: 'Mars',
        radius: 1.5,
        distance: 8,
        rotationSpeed: 0.3,
        orbitSpeed: 2.0,    // Orbits Mars faster than Mars rotates
        texturePath: 'textures/phobos.jpg',
        tilt: 0.018
    },
    {
        name: 'Deimos',
        parentPlanet: 'Mars',
        radius: 1.2,
        distance: 13,
        rotationSpeed: 0.2,
        orbitSpeed: 0.8,
        texturePath: 'textures/deimos.jpg',
        tilt: 0.034
    },

    // Jupiter — Galilean moons
    {
        name: 'Io',
        parentPlanet: 'Jupiter',
        radius: 3.0,
        distance: 35,
        rotationSpeed: 0.4,
        orbitSpeed: 1.5,
        texturePath: 'textures/io.jpg',
        tilt: 0.0
    },
    {
        name: 'Europa',
        parentPlanet: 'Jupiter',
        radius: 2.5,
        distance: 46,
        rotationSpeed: 0.3,
        orbitSpeed: 0.8,
        texturePath: 'textures/europa.jpg',
        tilt: 0.008
    },
    {
        name: 'Ganymede',
        parentPlanet: 'Jupiter',
        radius: 3.5,
        distance: 60,
        rotationSpeed: 0.2,
        orbitSpeed: 0.4,
        texturePath: 'textures/ganymede.jpg',
        tilt: 0.003
    },
    {
        name: 'Callisto',
        parentPlanet: 'Jupiter',
        radius: 3.3,
        distance: 75,
        rotationSpeed: 0.1,
        orbitSpeed: 0.2,
        texturePath: 'textures/callisto.jpg',
        tilt: 0.003
    },

    // Saturn
    {
        name: 'Titan',
        parentPlanet: 'Saturn',
        radius: 3.5,
        distance: 45,
        rotationSpeed: 0.1,
        orbitSpeed: 0.3,
        texturePath: 'textures/titan.jpg',
        tilt: 0.0
    },
    {
        name: 'Enceladus',
        parentPlanet: 'Saturn',
        radius: 1.5,
        distance: 28,
        rotationSpeed: 0.3,
        orbitSpeed: 1.0,
        texturePath: 'textures/enceladus.jpg',
        tilt: 0.0
    },

    // Uranus
    {
        name: 'Titania',
        parentPlanet: 'Uranus',
        radius: 2.0,
        distance: 28,
        rotationSpeed: 0.2,
        orbitSpeed: 0.4,
        texturePath: 'textures/titania.jpg',
        tilt: 0.0
    },
    {
        name: 'Oberon',
        parentPlanet: 'Uranus',
        radius: 2.0,
        distance: 36,
        rotationSpeed: 0.2,
        orbitSpeed: 0.25,
        texturePath: 'textures/oberon.jpg',
        tilt: 0.0
    },

    // Neptune
    {
        name: 'Triton',
        parentPlanet: 'Neptune',
        radius: 2.5,
        distance: 35,
        rotationSpeed: 0.2,
        orbitSpeed: -0.35,  // Retrograde orbit — opposite direction to Neptune's rotation
        texturePath: 'textures/triton.jpg',
        tilt: 2.749          // 157.6 degrees — highly inclined retrograde orbit
    },
]
