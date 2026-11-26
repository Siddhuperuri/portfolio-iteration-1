export interface CaseSection {
  title: string
  paragraphs?: string[]
  points?: string[]
}

export interface Project {
  slug: string
  title: string
  kind: string
  summary: string
  role?: string
  tools: string[]
  tags: string[]
  /** Shown on the home page and in the hero strip. */
  featured?: boolean
  /** Cover colours, taken from each project's own palette. */
  bg: string
  fg: string
  accent: string
  sections: CaseSection[]
  /** Real screenshots only. Files live in public/images/projects. */
  images?: { src: string; alt: string; width: number; height: number }[]
}

export const PROJECTS: Project[] = [
  {
    slug: 'gravity-playground',
    title: 'Gravity Playground',
    kind: 'Interactive physics simulation',
    summary:
      'An interactive physics simulation platform powered by a custom-built Cosmos Engine: create bodies, change the conditions and watch the system respond in real time.',
    role: 'Designer and developer',
    tools: ['HTML', 'CSS', 'JavaScript'],
    tags: ['Interactive', 'Development'],
    featured: true,
    bg: '#2A1A66',
    fg: '#F6F2FF',
    accent: '#FF9440',
    sections: [
      {
        title: 'The challenge',
        paragraphs: [
          "Make an advanced gravity simulation approachable enough to explore while keeping the system's real-time behaviour legible.",
        ],
      },
      {
        title: 'What I built',
        points: [
          'A custom Cosmos Engine that calculates gravitational forces, velocity, acceleration and orbital trajectories in real time.',
          'Dynamic body generation, collision handling, zoom, pan and interactive simulation controls.',
          'A responsive environment in HTML, CSS and JavaScript that works across screen sizes.',
        ],
      },
      {
        title: 'Design decisions',
        points: [
          'A dark simulation field keeps celestial bodies and trajectories readable.',
          'Controls work like an instrument panel, separating creation, observation and navigation.',
          'Motion is functional: it reveals gravitational behaviour instead of decorating it.',
        ],
      },
      {
        title: 'Results',
        points: [
          'A fully responsive environment for creating and exploring gravity-based systems.',
          'A working simulation with custom physics logic, interactive controls, particles and collision behaviour.',
        ],
      },
    ],
  },
  {
    slug: 'travelease',
    title: 'Travelease',
    kind: 'Tourism planning, UX, front-end',
    summary:
      'Interactive tourism platform with state-wise exploration, treasure-hunt rewards, chatbot-guided routing and curated hotel and attraction suggestions.',
    tools: ['HTML', 'CSS', 'JavaScript'],
    tags: ['Websites', 'UI / UX'],
    featured: true,
    bg: '#13213D',
    fg: '#F6EDE2',
    accent: '#E4703F',
    sections: [
      {
        title: 'The story',
        paragraphs: [
          'Travelease started with research into how Indian tourists find and plan trips across state borders.',
          'The platform brings the answers together: state-wise browsing, a treasure-hunt layer that surfaces hidden destinations, a chatbot that suggests routes, and curated hotel and attraction cards.',
          'Warm terracotta against deep navy gives it a sense of place without cliché illustration.',
          'Every interaction was prototyped in low fidelity first, tested with five users, then rebuilt. It ships as a responsive web app in plain HTML, CSS and JavaScript, with no external dependencies.',
        ],
      },
    ],
  },
  {
    slug: 'tetrix',
    title: 'Tetrix',
    kind: '3D arcade game',
    summary:
      'A 3D arcade interpretation of Tetris built with React, Three.js and a pure rules engine, with three game modes and graphics presets that change real rendering work.',
    role: 'Designer and developer',
    tools: ['TypeScript', 'React', 'Three.js', 'Vitest', 'Playwright'],
    tags: ['Interactive', 'Games', 'Development'],
    featured: true,
    bg: '#10151A',
    fg: '#F1F5F9',
    accent: '#D4FF4F',
    images: [
      {
        src: '/images/projects/tetrix.png',
        alt: 'Tetrix main menu with Play, Game modes, Settings and Statistics beside a spiral of coloured 3D tetrominoes on a plinth.',
        width: 1600,
        height: 1000,
      },
    ],
    sections: [
      {
        title: 'The challenge',
        paragraphs: [
          'Give a familiar puzzle game a premium 3D presentation without letting the visuals ever disagree with the rules underneath.',
        ],
      },
      {
        title: 'What I built',
        points: [
          'A rules engine, input handling with auto-repeat and a fixed-step game loop in plain TypeScript, with the renderer only reading from it.',
          'A 3D arena built with instanced meshes, so the whole stack is roughly 14 draw calls, with Low, High and Ultra presets for post-processing, shadows and effect budgets.',
          'Marathon, Sprint and Ultra modes, hold and next previews, and local statistics and personal bests.',
          'Versioned local persistence, a seedable piece sequence for repeatable tests, and a 2D canvas fallback for browsers without WebGL.',
        ],
      },
      {
        title: 'Design decisions',
        points: [
          'A near-black stage with one lime accent keeps the coloured pieces as the loudest thing on screen.',
          'Each tetromino has its own material, from machined steel to translucent polymer, with a colour-keyed front plate so neighbours stay readable.',
          'Motion is tied to game events, and reduced motion removes sway, shake and debris entirely.',
        ],
      },
      {
        title: 'Results and limits',
        points: [
          'A playable 3D game. The project status file records 201 unit tests and 21 end-to-end browser tests passing at the last run.',
          'Touch controls, music and the Overdrive mechanic are not built yet, and frame rate has not been measured on integrated GPUs or phones.',
        ],
      },
    ],
  },
  {
    slug: 'petponks',
    title: 'Petponks',
    kind: 'Brand, logo, wireframes',
    summary:
      'Identity and product structure for a pet platform covering adoption, storytelling and community. Logo, low and high-fidelity wireframes, colour and layout system in Figma and Framer.',
    role: 'Brand and UI/UX designer',
    tools: ['Figma', 'Framer'],
    tags: ['Brand Identity', 'UI / UX', 'Wireframes'],
    featured: true,
    bg: '#176B67',
    fg: '#FBF3E2',
    accent: '#F2B13B',
    sections: [
      {
        title: 'The story',
        paragraphs: [
          'Petponks is a pet platform that covers adoption, community storytelling and ongoing pet care in one place.',
          'The brand needed to feel warm, trustworthy and a little playful without talking down to its audience. The logomark is a geometric paw reduced to a modular stamp, and it holds up from a 16px favicon to a 2m print.',
          'The app uses a teal and cream pair, with amber reserved for emotional moments like adoption confirmations.',
          'Wireframes went through three stages: paper sketches, annotated low-fidelity frames in Figma, and an interactive Framer prototype used for stakeholder sign-off.',
        ],
      },
    ],
  },
  {
    slug: 'halftone-gambit',
    title: 'Halftone Gambit',
    kind: '3D chess game',
    summary:
      'A 3D chess game rendered through colourful ASCII glyphs and GPU dithering, playable against a Stockfish engine or a second player in the browser.',
    role: 'Designer and developer',
    tools: ['TypeScript', 'React', 'Three.js', 'Stockfish', 'Supabase'],
    tags: ['Interactive', 'Games', 'Development'],
    bg: '#0A1630',
    fg: '#EAF6FF',
    accent: '#35D6F0',
    images: [
      {
        src: '/images/projects/halftone-gambit.png',
        alt: 'Halftone Gambit setup panel beside a 3D chess board drawn in cyan and purple dithered glyphs.',
        width: 1600,
        height: 1000,
      },
    ],
    sections: [
      {
        title: 'The challenge',
        paragraphs: [
          'Make chess feel like a tactile 3D object drawn entirely in glyphs, while keeping it fully playable, accessible and honest about what is and is not verified.',
        ],
      },
      {
        title: 'What I built',
        points: [
          'The rules on chess.js, a procedural 3D board and pieces in React Three Fiber, and a custom shader and dither pipeline.',
          'Stockfish running as a WebAssembly engine in a Web Worker, with six difficulty presets and a fallback search if the engine fails.',
          'Progression with XP, levels, Elo-style rated games and 13 verified challenge positions, plus optional Supabase accounts, saved games and privacy controls.',
        ],
      },
      {
        title: 'Design decisions',
        points: [
          'One glyph shader draws every lit surface, so the whole scene shares a single visual language.',
          'The interface is DOM text in a monospace face, so it stays crisp on top of the dithered 3D scene.',
          'A semantic DOM board mirrors the game state. It doubles as a playable 2D fallback and the route for keyboard and screen-reader play.',
        ],
      },
      {
        title: 'Results and limits',
        points: [
          'A playable 3D chess game with a Stockfish opponent, two-player mode, challenges, saved games and a theme lab.',
          'Mate challenges are verified by exhaustive search through chess.js, and the project includes a perft test of the rules.',
          'Drag-to-move is not implemented, and performance has not been measured on mobile hardware.',
        ],
      },
    ],
  },
  {
    slug: 'helios',
    title: 'Helios',
    kind: 'Solar energy data product',
    summary:
      'A solar energy intelligence platform: a plain-language calculator for deciding on an installation, and an analysis console for validating the forecasts behind it.',
    role: 'Designer and developer',
    tools: ['Python', 'FastAPI', 'Docker'],
    tags: ['UI / UX', 'Development'],
    bg: '#F0A63A',
    fg: '#17120A',
    accent: '#17120A',
    images: [
      {
        src: '/images/projects/helios.png',
        alt: 'Helios home page with a daily solar generation curve and a button to calculate solar potential.',
        width: 1600,
        height: 1000,
      },
    ],
    sections: [
      {
        title: 'The challenge',
        paragraphs: [
          'Put one solar-prediction engine behind two audiences, a person deciding whether to install and an analyst who needs to check the work, without overstating certainty.',
        ],
      },
      {
        title: 'What I built',
        points: [
          'A Python backend whose physical chain, from solar geometry to PV conversion and inverter losses, is a set of pure functions shared by both surfaces.',
          'A consumer estimate layer covering demand, sizing, battery balance, economics, uncertainty and a shareable report, alongside time-aware validation and conformal prediction intervals.',
          'Docker Compose, load testing, and security, deployment and recovery documentation.',
        ],
      },
      {
        title: 'Design decisions',
        points: [
          'The consumer surface defaults to a light theme with mobile-first density, because it is read on a phone outdoors.',
          'The console keeps a dark instrument palette built for dense analysis.',
          'Every estimate shows a range, a confidence level and its assumptions instead of a single confident number.',
        ],
      },
      {
        title: 'Results',
        points: [
          'A calculator and an analysis console over one engine, with consumer and research APIs.',
          'The original 133 tests kept passing while the consumer layer was added.',
          'The method, assumptions and limitations are documented in a delivery report.',
        ],
      },
    ],
  },
  {
    slug: 'siddhartha',
    title: 'Siddhartha',
    kind: 'Interactive artwork',
    summary:
      'An interactive artwork built around the idea of radiolucence: you never see the person directly, only what passes through them.',
    role: 'Designer and developer',
    tools: ['JavaScript', 'Three.js', 'HTML', 'CSS'],
    tags: ['Interactive', 'Websites'],
    bg: '#0E0D0B',
    fg: '#EDE8DC',
    accent: '#F0642B',
    images: [
      {
        src: '/images/projects/siddhartha.png',
        alt: 'The name SIDDHARTHA drawn in particle glyphs, with a circular lens over one letter A.',
        width: 1600,
        height: 1000,
      },
    ],
    sections: [
      {
        title: 'The challenge',
        paragraphs: [
          'Make a piece about a person that is an environment to move through instead of a portfolio page, with no framework, build step or backend.',
        ],
      },
      {
        title: 'What I built',
        points: [
          'A piece in HTML, CSS and vanilla JavaScript with Three.js vendored locally, and no network requests, font files or image assets.',
          'Glyph, layer and camera systems that let five sheets of light align into the name from a single viewpoint.',
          'Support for phones and prefers-reduced-motion, and a version that runs from file:// by using classic scripts instead of modules.',
        ],
      },
      {
        title: 'Design decisions',
        points: [
          'One rule governs the world: stillness resolves, motion scatters, attention pulls.',
          'Layers pass through and reveal one another instead of sitting in sections.',
          'A small 3D lens appears at only three held moments, and the 2D piece stays complete without WebGL.',
        ],
      },
      {
        title: 'Results',
        points: [
          'A four-part continuous world, from the name to its inside, its edge and its ending.',
          'A piece that runs offline with no build step.',
        ],
      },
    ],
  },
  {
    slug: 'orbit',
    title: 'Orbit',
    kind: 'Knowledge platform, in development',
    summary:
      'A document and knowledge platform where uploaded files are processed into a searchable index. Identity, workspaces, upload and processing are built. Retrieval and chat are not.',
    role: 'Designer and developer',
    tools: ['Python', 'FastAPI', 'PostgreSQL', 'Next.js'],
    tags: ['Development'],
    bg: '#FF5A3C',
    fg: '#15130F',
    accent: '#15130F',
    sections: [
      {
        title: 'The challenge',
        paragraphs: [
          'Build a knowledge platform whose answers cite the exact source passage, and be exact about which parts exist yet.',
        ],
      },
      {
        title: 'What I built',
        points: [
          'A backend in Python with FastAPI, Celery workers, PostgreSQL with pgvector, Redis and S3-compatible storage.',
          'Identity, workspaces, document upload and an asynchronous parse, normalise, chunk, embed and index pipeline.',
          '24 recorded architecture decisions with the alternatives rejected, plus documented failure modes and runbooks for each dependency.',
        ],
      },
      {
        title: 'Design decisions',
        points: [
          'A single origin lets both auth tokens be HttpOnly cookies that JavaScript cannot read.',
          'Dependency direction is checked by machine: import-linter fails the build when a dependency points the wrong way.',
          'The repository states plainly what exists and what does not, and does not call itself production-ready.',
        ],
      },
      {
        title: 'Status',
        points: [
          'Milestones M0 to M4 are delivered: identity, workspaces, upload and the processing pipeline.',
          'Retrieval and chat are designed but not yet built.',
        ],
      },
    ],
  },
  {
    slug: 'vigil-88',
    title: 'Vigil-88',
    kind: 'Cybersecurity, brand, UI concept',
    summary:
      'Brand identity and UI concept for a cybersecurity platform: a dark visual language and threat-visualisation dashboard wireframes.',
    tools: ['Figma', 'Illustrator'],
    tags: ['Brand Identity', 'UI / UX'],
    bg: '#0F0F12',
    fg: '#F3EEE9',
    accent: '#E0243F',
    sections: [
      {
        title: 'The story',
        paragraphs: [
          'Vigil-88 began as a personal brand exploration: what would a cybersecurity product look like if it felt as considered as consumer design?',
          'The name nods to vigilance, and the system is dark-coded to read as trustworthy. It uses a crimson and obsidian palette, a sharp geometric logomark and a type hierarchy borrowed from financial dashboards.',
          'The dashboard wireframes cover alert timelines, network maps and risk heat grids. The interface stays minimal so a lot of information fits without visual noise.',
        ],
      },
    ],
  },
  {
    slug: 'design-collection',
    title: 'Design Collection',
    kind: 'Visual, brand, editorial',
    summary:
      'A collection of visual design work: logos, posters, social assets and brand systems across education, lifestyle and technology.',
    tools: ['Figma', 'Photoshop', 'Canva'],
    tags: ['Brand Identity', 'Posters'],
    bg: '#F2DE74',
    fg: '#17140C',
    accent: '#17140C',
    sections: [
      {
        title: 'The story',
        paragraphs: [
          'The Design Collection is an ongoing archive of visual work from different briefs, clients and contexts. It includes editorial posters, social media graphics, logo concepts and full brand identity systems.',
          'Each piece starts from a clear creative brief and goes through structured ideation. Highlights include graphics for SVEC events, lifestyle branding studies and technology-sector identity concepts.',
          'I use Figma for systematic work and Photoshop or Canva when production needs to move faster.',
        ],
      },
    ],
  },
]

export const FEATURED = PROJECTS.filter(p => p.featured)

export const ALL_TAGS = ['All', ...Array.from(new Set(PROJECTS.flatMap(p => p.tags)))]

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find(p => p.slug === slug)
}

export function getNeighbour(slug: string): Project {
  const i = PROJECTS.findIndex(p => p.slug === slug)
  return PROJECTS[(i + 1) % PROJECTS.length]
}
