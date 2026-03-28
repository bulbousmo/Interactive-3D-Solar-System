export interface PlanetData {
    name: string
    radius: number
    distance: number
    rotationSpeed: number
    orbitSpeed: number
    texturePath: string
    tilt: number
}

export const planets: PlanetData[] = [
    {
        name: 'Mercury',
        radius: 2.44,
        distance: 58,
        rotationSpeed: 0.01,
        orbitSpeed: 0.04,
        texturePath: 'textures/2k_mercury.jpg',
        tilt: 0.03
    },
    {
        name: 'Venus',
        radius: 6.05,
        distance: 108,
        rotationSpeed: -0.004, // Retrograde rotation
        orbitSpeed: 0.015,
        texturePath: 'textures/2k_venus_surface.jpg',
        tilt: 3.096 // Nearly upside-down, retrograde tilt
    },
    {
        name: 'Earth',
        radius: 6.37,
        distance: 150,
        rotationSpeed: 0.5,
        orbitSpeed: 0.01,
        texturePath: 'textures/2k_earth_daymap.jpg',
        tilt: 0.408 // 23.4 degrees
    },
    {
        name: 'Mars',
        radius: 3.39,
        distance: 228,
        rotationSpeed: 0.48,
        orbitSpeed: 0.008,
        texturePath: 'textures/2k_mars.jpg',
        tilt: 0.439 // 25.2 degrees
    },
    {
        name: 'Jupiter',
        radius: 20,
        distance: 400,
        rotationSpeed: 1.2,
        orbitSpeed: 0.004,
        texturePath: 'textures/2k_jupiter.jpg',
        tilt: 0.054 // 3.1 degrees
    },
    {
        name: 'Saturn',
        radius: 17,
        distance: 600,
        rotationSpeed: 1.0,
        orbitSpeed: 0.003,
        texturePath: 'textures/2k_saturn.jpg',
        tilt: 0.467 // 26.7 degrees
    },
    {
        name: 'Uranus',
        radius: 10,
        distance: 850,
        rotationSpeed: -0.7, // Retrograde rotation
        orbitSpeed: 0.002,
        texturePath: 'textures/2k_uranus.jpg',
        tilt: 1.706 // 97.8 degrees — rotates nearly on its side
    },
    {
        name: 'Neptune',
        radius: 9.7,
        distance: 1100,
        rotationSpeed: 0.75,
        orbitSpeed: 0.001,
        texturePath: 'textures/2k_neptune.jpg',
        tilt: 0.494 // 28.3 degrees
    },
]