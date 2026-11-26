export const SITE = {
  url: 'https://portfolio-iteration-1.vercel.app',
  name: 'Peruri Jai Sai Siddhartha',
  short: 'Siddhartha',
  role: 'Creative Designer',
  location: 'Andhra Pradesh, India',
  email: 'siddharthaperuri12@gmail.com',
  phone: '+91 99599 96529',
  linkedin: 'https://www.linkedin.com/in/siddharthaperuri/',
  github: 'https://github.com/Siddhuperuri',
  description:
    'Creative designer working across UI/UX, branding and web. Portfolio of Peruri Jai Sai Siddhartha.',
  status: 'Open to design internships and freelance work.',
  effective: '26 November 2026',
} as const

export const NAV = [
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const

export const EDUCATION = {
  school: 'Sri Vasavi Engineering College',
  degree: 'B.Tech, Computer Science & Engineering',
  track: 'Cybersecurity, Blockchain, IoT',
  years: '2023 to 2027 (expected)',
  cgpa: '7.19 / 10',
} as const

export const SKILL_GROUPS = [
  {
    label: 'Design',
    items: ['UI / UX', 'Website Design', 'Logo & Branding', 'Poster & Banner', 'Visual Systems'],
  },
  {
    label: 'Software',
    items: ['Figma', 'Photoshop', 'Illustrator', 'Lightroom', 'Canva'],
  },
  {
    label: 'Web',
    items: ['Framer', 'HTML', 'CSS', 'Responsive Design'],
  },
] as const

export const HIGHLIGHTS = [
  'Branding and UI concepts for VIGIL-88 (cybersecurity) and PETPONKS (pet platform)',
  'Logos, wireframes and visual assets in Canva, Figma and Framer',
  'Grounded in colour theory, typography and layout',
  'Exploring modern UI/UX: dark systems, minimal surfaces, interactive motion',
] as const

export const SERVICES = ['Websites', 'Brand Identity', 'UI / UX', 'Wireframes', 'Posters'] as const
