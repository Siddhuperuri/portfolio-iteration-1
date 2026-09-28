# Siddhartha — Ultra-Premium WebGL Portfolio

A cinematic, real-time interactive portfolio built with Next.js, Three.js, GSAP, and Zustand.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Add project images (optional — fallback placeholders auto-generate)
# Drop files into: public/images/project-1.jpg, project-2.jpg, project-3.jpg

# 3. Run dev server
npm run dev
```

Open http://localhost:3000

## File Structure

```
app/
├── layout.tsx        Root layout + fonts + metadata
├── page.tsx          Entry: loading screen + Scene + Overlay
├── store.ts          Zustand global state
├── Shaders.ts        All GLSL shaders + uniform factories
├── LiquidSphere.tsx  Morphing WebGL sphere + halo + neon rings
├── Scene.tsx         Three.js canvas: camera, lights, particles, post-FX
└── Overlay.tsx       UI layer: cursor, navbar, hero, sections, scroll sync
public/
└── images/           Project screenshot textures (optional)
```

## Customisation

- **Projects**: Edit `PROJECTS` array in `app/store.ts`
- **Colors**: Edit uniforms in `Shaders.ts` (`uColorCyan`, `uColorMagenta`, `uColorGold`)
- **Performance**: In `LiquidSphere.tsx` lower `ICOSAHEDRON_DETAIL` (64→32); in `Scene.tsx` lower `PARTICLE_COUNT` (2200→1200)
- **Contact link**: Replace `https://www.fiverr.com` in `Overlay.tsx`

## Tech Stack

- Next.js 14 (App Router + TypeScript)
- Three.js + React Three Fiber + Drei
- GSAP (ScrollTrigger + CustomEase)
- Zustand (state sync between UI + WebGL)
- @react-three/postprocessing (Bloom, CA, Noise, Vignette)
