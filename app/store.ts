// store.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import * as THREE from 'three'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MouseState {
  raw: { x: number; y: number }
  normalized: { x: number; y: number }
  velocity: { x: number; y: number }
}

export interface ScrollState {
  progress: number
  velocity: number
  direction: 1 | -1
  raw: number
}

export interface CameraState {
  position: THREE.Vector3
  targetPosition: THREE.Vector3
  fov: number
  shake: number
}

export interface ProjectState {
  activeIndex: number
  hovered: number | null
  transitioning: boolean
}

export interface RenderState {
  bloom: number
  chromaticAberration: number
  distortion: number
  grainOpacity: number
}

export interface ThemeState {
  isDark: boolean
  colors: {
    background: string
    teal: string
    lavender: string
    amber: string
    text: string
    violet: string
  }
}

export interface LenisInstance {
  scroll: number
  velocity: number
  direction: 1 | -1 | 0
  raf: (time: number) => void
  destroy: () => void
  start: () => void
  stop: () => void
  scrollTo: (
    target: string | number | HTMLElement,
    options?: { offset?: number; duration?: number; immediate?: boolean; easing?: (t: number) => number },
  ) => void
}

export interface PortfolioStore {
  mouse: MouseState
  setMouseRaw: (x: number, y: number) => void
  setMouseNormalized: (x: number, y: number) => void
  setMouseVelocity: (x: number, y: number) => void

  scroll: ScrollState
  setScrollProgress: (progress: number) => void
  setScrollVelocity: (velocity: number) => void
  setScrollRaw: (raw: number) => void

  camera: CameraState
  setCameraTarget: (x: number, y: number, z: number) => void
  setCameraShake: (trauma: number) => void

  project: ProjectState
  setActiveProject: (index: number) => void
  setHoveredProject: (index: number | null) => void
  setTransitioning: (v: boolean) => void

  render: RenderState
  setBloom: (v: number) => void
  setChromaticAberration: (v: number) => void
  setDistortion: (v: number) => void
  setGrainOpacity: (v: number) => void

  theme: ThemeState
  toggleTheme: () => void

  // Lenis smooth scroll instance
  lenis: LenisInstance | null
  setLenis: (lenis: LenisInstance | null) => void

  // Active filter for sidebar
  activeFilter: string | null
  setActiveFilter: (f: string | null) => void

  // Case-study detail overlay (null = closed)
  detailProject: number | null
  setDetailProject: (i: number | null) => void

  tick: () => void
}

// Deep obsidian · brushed teal · iridescent lavender · warm amber · electric violet
const DARK_COLORS: ThemeState['colors'] = {
  background: '#000000',
  teal:       '#00F7FF',
  lavender:   '#9929EA',
  amber:      '#FF5FCF',
  text:       '#F0EAFF',
  violet:     '#FF0087',
}

const LIGHT_COLORS: ThemeState['colors'] = {
  background: '#1A0F2E',
  teal:       '#00F7FF',
  lavender:   '#9929EA',
  amber:      '#FF5FCF',
  text:       '#F0EAFF',
  violet:     '#FF0087',
}

export const usePortfolioStore = create<PortfolioStore>()(
  subscribeWithSelector((set, get) => ({

    mouse: {
      raw:        { x: 0, y: 0 },
      normalized: { x: 0, y: 0 },
      velocity:   { x: 0, y: 0 },
    },

    setMouseRaw: (x, y) =>
      set(s => ({
        mouse: {
          ...s.mouse,
          velocity: { x: x - s.mouse.raw.x, y: y - s.mouse.raw.y },
          raw: { x, y },
        },
      })),

    setMouseNormalized: (x, y) =>
      set(s => ({ mouse: { ...s.mouse, normalized: { x, y } } })),

    setMouseVelocity: (x, y) =>
      set(s => ({ mouse: { ...s.mouse, velocity: { x, y } } })),

    scroll: {
      progress:  0,
      velocity:  0,
      direction: 1,
      raw:       0,
    },

    setScrollProgress: (progress) =>
      set(s => ({
        scroll: { ...s.scroll, progress: Math.max(0, Math.min(1, progress)) },
      })),

    setScrollVelocity: (velocity) =>
      set(s => ({
        scroll: { ...s.scroll, velocity, direction: velocity >= 0 ? 1 : -1 },
      })),

    setScrollRaw: (raw) =>
      set(s => ({ scroll: { ...s.scroll, raw } })),

    camera: {
      position:       new THREE.Vector3(0, 0, 5),
      targetPosition: new THREE.Vector3(0, 0, 5),
      fov:            45,
      shake:          0,
    },

    setCameraTarget: (x, y, z) =>
      set(s => ({
        camera: { ...s.camera, targetPosition: new THREE.Vector3(x, y, z) },
      })),

    setCameraShake: (trauma) =>
      set(s => ({
        camera: { ...s.camera, shake: Math.max(0, Math.min(1, trauma)) },
      })),

    project: {
      activeIndex:   0,
      hovered:       null,
      transitioning: false,
    },

    setActiveProject:  (index) => set(s => ({ project: { ...s.project, activeIndex: index } })),
    setHoveredProject: (index) => set(s => ({ project: { ...s.project, hovered: index } })),
    setTransitioning:  (v)     => set(s => ({ project: { ...s.project, transitioning: v } })),

    render: {
      bloom:               0.55,
      chromaticAberration: 0.0015,
      distortion:          0,
      grainOpacity:        0.28,
    },

    setBloom:               (v) => set(s => ({ render: { ...s.render, bloom: v } })),
    setChromaticAberration: (v) => set(s => ({ render: { ...s.render, chromaticAberration: v } })),
    setDistortion:          (v) => set(s => ({ render: { ...s.render, distortion: v } })),
    setGrainOpacity:        (v) => set(s => ({ render: { ...s.render, grainOpacity: v } })),

    theme: {
      isDark:  true,
      colors:  DARK_COLORS,
    },

    toggleTheme: () =>
      set(s => ({
        theme: {
          isDark: !s.theme.isDark,
          colors: s.theme.isDark ? LIGHT_COLORS : DARK_COLORS,
        },
      })),

    lenis: null,
    setLenis: (lenis) => set({ lenis }),

    activeFilter: null,
    setActiveFilter: (f) => set(s => ({ activeFilter: s.activeFilter === f ? null : f })),

    detailProject: null,
    setDetailProject: (i) => set({ detailProject: i }),

    tick: () => {
      const s = get()
      const DECAY = 0.92
      const vx  = s.mouse.velocity.x * DECAY
      const vy  = s.mouse.velocity.y * DECAY
      const sv  = s.scroll.velocity  * DECAY
      const absVel = Math.abs(sv)
      const t1     = Math.min(absVel / 40, 1)
      const t2     = Math.min(absVel / 60, 1)
      const bloom  = 0.45 + (1.1  - 0.45)  * t1
      const ca     = 0.0008 + (0.005 - 0.0008) * t1
      const dist   = 0.28 * t2
      set(state => ({
        mouse:  { ...state.mouse,  velocity: { x: vx, y: vy } },
        scroll: { ...state.scroll, velocity: sv },
        render: { ...state.render, bloom, chromaticAberration: ca, distortion: dist },
      }))
    },
  }))
)

export const selectMouse          = (s: PortfolioStore) => s.mouse
export const selectScroll         = (s: PortfolioStore) => s.scroll
export const selectCamera         = (s: PortfolioStore) => s.camera
export const selectProject        = (s: PortfolioStore) => s.project
export const selectRender         = (s: PortfolioStore) => s.render
export const selectTheme          = (s: PortfolioStore) => s.theme
export const selectScrollProgress = (s: PortfolioStore) => s.scroll.progress
export const selectScrollVelocity = (s: PortfolioStore) => s.scroll.velocity
export const selectMouseNorm      = (s: PortfolioStore) => s.mouse.normalized

// ─── Content (from résumé) ────────────────────────────────────────────────────

export interface ProjectDatum {
  title: string
  subtitle: string
  description: string
  tools: string
  color: string
  tags: string[]
  caseStudy: string
}

export const PROJECTS: ProjectDatum[] = [
  {
    title:       'Travelease',
    subtitle:    'Tourism planning · UX · Front-end',
    description: 'Interactive tourism platform with state-wise exploration, treasure-hunt rewards, chatbot-guided routing and curated hotel & attraction suggestions.',
    tools:       'HTML · CSS · JavaScript',
    color:       '#00F7FF',
    tags:        ['Websites', 'UI / UX'],
    caseStudy:   'Travelease started with research into how Indian tourists find and plan trips across state borders. The platform brings the answers together: state-wise browsing, a treasure-hunt layer that surfaces hidden destinations, a chatbot that suggests routes, and curated hotel and attraction cards. Warm terracotta against deep navy gives it a sense of place without cliché illustration. Every interaction was prototyped in low fidelity first, tested with five users, then rebuilt. It ships as a responsive web app in plain HTML, CSS and JavaScript, with no external dependencies.',
  },
  {
    title:       'SVEC · Modern Interactive Site',
    subtitle:    'Education · Motion · Visual Identity',
    description: 'Visually rich educational website. Bold red-black system, particle backgrounds, custom cursor, scroll animations across courses, faculty, placements and achievements.',
    tools:       'HTML · CSS · JavaScript',
    color:       '#9929EA',
    tags:        ['Websites', 'UI / UX'],
    caseStudy:   'Sri Vasavi Engineering College needed a digital presence that matched its ambition. The brief was clear: bold, motion-forward, unmistakably modern. The solution: a monochromatic red-black system with typographic hierarchy borrowed from editorial design. Particle backgrounds add depth without competing with content. A custom cursor reinforces the interactive personality. Scroll-triggered animations on courses, faculty bios, placement statistics and achievement walls guide the eye without feeling mechanical. The site loads under 2 seconds on 4G through progressive image loading and deferred non-critical scripts.',
  },
  {
    title:       'Petponks',
    subtitle:    'Brand · Logo · Wireframes',
    description: 'Identity and product structure for a pet platform covering adoption, storytelling and community. Logo, low and high-fidelity wireframes, colour and layout system in Figma and Framer.',
    tools:       'Figma · Framer',
    color:       '#FF5FCF',
    tags:        ['Brand Identity', 'UI / UX', 'Wireframes'],
    caseStudy:   'Petponks is a pet platform that covers adoption, community storytelling and ongoing pet care in one place. The brand needed to feel warm, trustworthy and a little playful without talking down to its audience. The logomark is a geometric paw reduced to a modular stamp, and it holds up from a 16px favicon to a 2m print. The app uses a teal and cream pair, with amber reserved for emotional moments like adoption confirmations. Wireframes went through three stages: paper sketches, annotated low-fidelity frames in Figma, and an interactive Framer prototype used for stakeholder sign-off.',
  },
  {
    title:       'Vigil-88',
    subtitle:    'Cybersecurity · Brand · UI Concept',
    description: 'Brand identity and UI concept for a cybersecurity platform: a dark visual language and threat-visualisation dashboard wireframes.',
    tools:       'Figma · Illustrator',
    color:       '#FF0087',
    tags:        ['Brand Identity', 'UI / UX'],
    caseStudy:   'Vigil-88 began as a personal brand exploration: what would a cybersecurity product look like if it felt as considered as consumer design? The name nods to vigilance, and the system is dark-coded to read as trustworthy. It uses a crimson and obsidian palette, a sharp geometric logomark and a type hierarchy borrowed from financial dashboards. The dashboard wireframes cover alert timelines, network maps and risk heat grids. The interface stays minimal so a lot of information fits without visual noise.',
  },
  {
    title:       'Design Collection',
    subtitle:    'Visual · Brand · Editorial',
    description: 'A collection of visual design work: logos, posters, social assets and brand systems across education, lifestyle and technology.',
    tools:       'Figma · Photoshop · Canva',
    color:       '#FEEE91',
    tags:        ['Brand Identity', 'Posters'],
    caseStudy:   'The Design Collection is an ongoing archive of visual work from different briefs, clients and contexts. It includes editorial posters, social media graphics, logo concepts and full brand identity systems. Each piece starts from a clear creative brief and goes through structured ideation. Highlights include graphics for SVEC events, lifestyle branding studies and technology-sector identity concepts. I use Figma for systematic work and Photoshop or Canva when production needs to move faster.',
  },
].filter(project => project.color !== '#9929EA')

export const SKILL_GROUPS = [
  {
    label: 'Design',
    items: ['UI / UX', 'Website Design', 'Logo & Branding', 'Poster · Banner', 'Visual Systems'],
  },
  {
    label: 'Software',
    items: ['Figma', 'Photoshop', 'Illustrator', 'Lightroom', 'Canva'],
  },
  {
    label: 'Web',
    items: ['Framer', 'HTML', 'CSS', 'Responsive Design'],
  },
]

export const LOOKING_FOR = [
  'Websites',
  'Brand Identity',
  'UI / UX',
  'Wireframes',
  'Posters',
]

export const PROFILE = {
  name:      'Peruri Jai Sai Siddhartha',
  short:     'Siddhartha',
  role:      'Creative Designer',
  location:  'Andhra Pradesh, IN',
  email:     'siddharthaperuri12@gmail.com',
  phone:     '+91 99599 96529',
  linkedin:  'https://www.linkedin.com/in/siddharthaperuri/',
  github:    'https://github.com/Siddhuperuri',
  education: {
    school: 'Sri Vasavi Engineering College',
    degree: 'B.Tech, Computer Science & Engineering',
    track:  'Cybersecurity · Blockchain · IoT',
    years:  '2023 to 2027 (expected)',
    cgpa:   '7.19 / 10',
  },
  highlights: [
    'Branding & UI concepts for VIGIL-88 (cybersecurity) and PETPONKS (pet platform)',
    'Logos, wireframes and visual assets in Canva, Figma and Framer',
    'Grounded in colour theory, typography and layout',
    'Exploring modern UI/UX: dark systems, minimal surfaces, interactive motion',
  ],
}
