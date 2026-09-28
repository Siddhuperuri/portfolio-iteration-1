import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#07070C',
        cyan:       '#1CE0C4',
        magenta:    '#FF003C',
        violet:     '#B872FF',
        gold:       '#FFD700',
        text:       '#EAEAEA',
        card:       '#1B0B2A',
      },
      fontFamily: {
        display: ["'Playfair Display'", 'serif'],
        body:    ["'Poppins'",          'sans-serif'],
        mono:    ["'Courier Prime'",    'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
