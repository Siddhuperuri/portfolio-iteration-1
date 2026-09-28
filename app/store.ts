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

interface LenisInstance {
  scroll: number
  raf: (time: number) => void
  destroy: () => void
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
    caseStudy:   'Travelease began as a research-first exercise — mapping how Indian tourists discover and plan trips across state borders. The platform emerged from that research as a unified layer: state-wise browsing, a gamified treasure-hunt layer that surfaces hidden destinations, a chatbot routing engine, and curated hotel + attraction cards. The visual language uses warm terracotta against deep navy to evoke the subcontinent\'s texture without resorting to cliché illustration. Every interaction was prototyped in low-fidelity first, tested with five users, then rebuilt. The final deliverable is a responsive web app with zero external dependencies — just HTML, CSS, and vanilla JS with careful progressive enhancement.',
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
    description: 'Identity and product structure for a pet-focused platform — adoption, storytelling and community. Logo, low/high-fidelity wireframes, colour & layout system in Figma & Framer.',
    tools:       'Figma · Framer',
    color:       '#FF5FCF',
    tags:        ['Brand Identity', 'UI / UX', 'Wireframes'],
    caseStudy:   'Petponks is a platform that connects animals with their forever homes — adoption, community storytelling, and ongoing pet care in one place. The brand identity was designed to feel warm, trustworthy, and slightly playful without infantilising the audience. The logomark uses a geometric paw abstracted into a modular stamp form, scalable from 16px favicon to 2m print. The colour system: a primary teal-cream duo for the app, a rich amber for emotional moments like adoption confirmations. Wireframes ran through three fidelity levels — paper sketches, annotated lo-fi in Figma, then a fully interactive Framer prototype used for stakeholder sign-off.',
  },
  {
    title:       'Vigil-88',
    subtitle:    'Cybersecurity · Brand · UI Concept',
    description: 'Brand identity and UI concept for a cybersecurity platform. Dark-system visual language, threat-visualisation dashboard wireframes and a defensive interface grammar.',
    tools:       'Figma · Illustrator',
    color:       '#FF0087',
    tags:        ['Brand Identity', 'UI / UX'],
    caseStudy:   'Vigil-88 began as a personal brand exploration: what would a cybersecurity product look like if it felt as considered as consumer design? The name references vigilance and the year aesthetic — a dark-coded system built for trust without sacrificing visual intelligence. The brand system uses a crimson-obsidian palette, sharp geometric logomark, and a typographic hierarchy borrowed from financial dashboards. Dashboard wireframes model real threat-visualisation needs: alert timelines, network maps, risk heat-grids. The UI language is deliberately minimal — information density without visual noise.',
  },
  {
    title:       'Design Collection',
    subtitle:    'Visual · Brand · Editorial',
    description: 'A curated compilation of visual design work — logos, posters, social assets and brand systems across education, lifestyle and technology sectors.',
    tools:       'Figma · Photoshop · Canva',
    color:       '#FEEE91',
    tags:        ['Brand Identity', 'Posters'],
    caseStudy:   'The Design Collection is an ongoing archive of visual work produced across different briefs, clients and contexts. It spans editorial poster design, social media graphics, logo concepts and full brand identity systems. The through-line is a commitment to craft: every piece starts with a clear creative brief, moves through structured ideation, and arrives at something that communicates precisely. Highlights include educational institution graphics for SVEC events, lifestyle branding studies, and technology-sector identity concepts. Tools span from Figma for systematic work to Photoshop and Canva for faster production cycles.',
  },
].filter(project => project.color !== '#9929EA')

export const SKILL_GROUPS = [
  {
    label: 'Design',
    items: ['UI / UX', 'Website Design', 'Logo & Branding', 'Poster · Banner', 'Visual Systems'],
  },
  {
    label: 'Tools',
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
    years:  '2023 — 2027 (Expected)',
    cgpa:   '7.19 / 10',
  },
  highlights: [
    'Branding & UI concepts for VIGIL-88 (cybersecurity) and PETPONKS (pet platform)',
    'Logos, wireframes and visual assets in Canva, Figma and Framer',
    'Grounded in colour theory, typography and layout',
    'Explores modern UI/UX — dark systems, minimal surfaces, interactive motion',
  ],
}
