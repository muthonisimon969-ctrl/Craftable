import type { CreativeCategory } from '../types/project';

export interface CreativeBlueprint {
  id: string;
  name: string;
  badgeLabel: string;
  category: CreativeCategory;
  shortSummary: string;
  starterPrompt: string;
  blueprintHint: string;
  accentHex: string;
  surfaceHex: string;
  canvasHex: string;
}

export const CREATIVE_BLUEPRINTS: CreativeBlueprint[] = [
  {
    id: 'kenyan_3d_rally',
    name: 'Kenyan Savanna Rally 3D',
    badgeLabel: '3D Racing Game',
    category: '3d_game',
    shortSummary: 'Three.js Rift Valley highway & red murram rally racer with acacia trees, matatu traffic & touch steer',
    starterPrompt:
      'Create a 3D racing game with Kenyan roads, Rift Valley mountains, acacia trees, red murram shoulders, nitro boost, speedometer HUD, and mobile touch controls.',
    blueprintHint:
      'Use Three.js PerspectiveCamera chase cam, asphalt highway with dashed yellow lane lines and red terracotta murram shoulders, procedural umbrella acacia trees, distant Rift Valley escarpment, rally car + oncoming traffic vehicles, dust particles, nitro boost, keyboard + touch steer/nitro controls.',
    canvasHex: '#18100C',
    surfaceHex: '#291B14',
    accentHex: '#F97316',
  },
  {
    id: 'neon_sky_obby_3d',
    name: 'Skyline Obby 3D',
    badgeLabel: '3D Platformer',
    category: '3d_game',
    shortSummary: 'Three.js floating sky islands, jumping physics, rotating obstacles, glowing orbs & shadow markers',
    starterPrompt:
      'Build an interactive 3D sky platformer game in Three.js with floating islands, rotating beam obstacles, collectible glowing crystals, jump physics, and D-pad touch controls.',
    blueprintHint:
      'Use Three.js chase camera, box/cylinder floating platforms with metallic borders, player character mesh with jump arc + ground drop-shadow disc, rotating hazard bars, collectible crystals, keyboard + mobile D-pad & Jump.',
    canvasHex: '#081024',
    surfaceHex: '#121E3D',
    accentHex: '#38BDF8',
  },
  {
    id: 'solar_system_3d',
    name: 'Orbital Atlas 3D',
    badgeLabel: '3D Environment',
    category: '3d_environment',
    shortSummary: 'Three.js interactive solar system with OrbitControls, starfield, ringed planets & camera focus',
    starterPrompt:
      'Create an interactive 3D solar system explorer using Three.js OrbitControls with glowing sun lighting, orbiting planets, Saturn rings, starfield, and planet focus selector.',
    blueprintHint:
      'Use Three.js OrbitControls, glowing emissive sun + PointLight, procedural CanvasTexture planets, orbital ring paths, starfield Points, smooth camera focus selector, speed slider, and pause/play toggle.',
    canvasHex: '#050814',
    surfaceHex: '#10162F',
    accentHex: '#FBBF24',
  },
  {
    id: 'kinetic_wave_studio',
    name: 'Kinetic Wave 3D',
    badgeLabel: '3D Animation',
    category: 'animation',
    shortSummary: 'Real-time Three.js 3D instanced kinetic wave matrix with pointer ripples & palette switcher',
    starterPrompt:
      'Build an interactive 3D kinetic wave and particle sculpture animation in Three.js with OrbitControls, color themes, amplitude sliders, and mouse/touch ripple interaction.',
    blueprintHint:
      'Use Three.js InstancedMesh or animated vertex wave grid, additive star particles, OrbitControls, theme swatches, wave speed/amplitude sliders, and pointer ripple impulse.',
    canvasHex: '#090D18',
    surfaceHex: '#151B30',
    accentHex: '#A855F7',
  },
];

export const CREATIVE_QUICK_PROMPTS: string[] = [
  'Create a 3D racing game with Kenyan roads.',
  'Build an interactive 3D solar system explorer with planets you can inspect.',
  'Create a 3D endless space tunnel shooter with laser bursts.',
  'Design a 3D kinetic aurora wave visualizer synced to mouse & touch.',
];
