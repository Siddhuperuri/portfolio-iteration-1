'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { usePortfolioStore, PROJECTS } from './store'
import { projectCardVert, projectCardFrag } from './Shaders'

const RADIUS = 3.5
const CARD_W = 2.2
const CARD_H = 1.4
const N      = PROJECTS.length
const TWO_PI = Math.PI * 2

// Module-level temp — no per-frame GC
const _worldPos = new THREE.Vector3()

// ─── Canvas texture ────────────────────────────────────────────────────────────

function makeCardTexture(datum: typeof PROJECTS[0], index: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 660; canvas.height = 420
  const ctx = canvas.getContext('2d')!

  const grad = ctx.createLinearGradient(0, 0, 660, 420)
  grad.addColorStop(0.0, '#1B0B2A')
  grad.addColorStop(0.5, datum.color + '33')
  grad.addColorStop(1.0, '#07070C')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 660, 420)

  const rad = ctx.createRadialGradient(330, 210, 40, 330, 210, 350)
  rad.addColorStop(0, 'rgba(255,255,255,0.055)')
  rad.addColorStop(1, 'rgba(0,0,0,0.4)')
  ctx.fillStyle = rad
  ctx.fillRect(0, 0, 660, 420)

  ctx.fillStyle = datum.color
  ctx.font = '600 15px "JetBrains Mono", monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`0${index + 1} — 0${PROJECTS.length}`, 40, 52)

  ctx.fillStyle = '#E8EEFF'
  const titleSize = Math.max(32, Math.min(50, 50 - Math.max(0, datum.title.length - 14) * 1.4))
  ctx.font = `700 ${titleSize}px "Bebas Neue", "Anton", sans-serif`
  ctx.fillText(datum.title.toUpperCase(), 40, 235)

  ctx.fillStyle = 'rgba(232,230,223,0.5)'
  ctx.font = '500 13px "JetBrains Mono", monospace'
  ctx.fillText(datum.subtitle.toUpperCase(), 40, 272)

  ctx.strokeStyle = datum.color + '44'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(40, 308)
  ctx.lineTo(620, 308)
  ctx.stroke()

  ctx.fillStyle = datum.color
  ctx.font = '500 12px "JetBrains Mono", monospace'
  ctx.fillText(datum.tools.toUpperCase(), 40, 376)

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

// ─── Single project card ───────────────────────────────────────────────────────

interface ProjectCardProps {
  datum: typeof PROJECTS[0]
  index: number
  baseAngle: number
  focusedRef: React.MutableRefObject<number>
  isReduced: boolean
}

function ProjectCard({ datum, index, baseAngle, focusedRef, isReduced }: ProjectCardProps) {
  // Three-level group: posRef → filterRef → introRef → mesh
  const posRef    = useRef<THREE.Group>(null!)  // cylinder position
  const filterRef = useRef<THREE.Group>(null!)  // filter visibility scale
  const introRef  = useRef<THREE.Group>(null!)  // intro stagger scale
  const meshRef   = useRef<THREE.Mesh>(null!)   // focus scale
  const glowRef   = useRef<THREE.Mesh>(null!)
  const matRef    = useRef<THREE.ShaderMaterial>(null!)
  const glowMatRef = useRef<THREE.MeshStandardMaterial>(null!)

  const focusLerp  = useRef(0)
  const filterLerp = useRef(1)

  const setDetailProject = usePortfolioStore(s => s.setDetailProject)

  const texture = useMemo(() => {
    if (typeof window === 'undefined') return new THREE.Texture()
    return makeCardTexture(datum, index)
  }, [datum, index])

  // PlaneGeometry with subdivisions — wave shader needs vertices to displace
  const cardGeo = useMemo(() => new THREE.PlaneGeometry(CARD_W, CARD_H, 32, 20), [])
  const glowGeo = useMemo(() => new THREE.PlaneGeometry(CARD_W + 0.07, CARD_H + 0.07, 1, 1), [])

  const uniforms = useMemo(() => ({
    uTexture:      { value: texture },
    uTime:         { value: 0 },
    uScrollVel:    { value: 0 },
    uActive:       { value: 0 },
    uHover:        { value: 0 },
    uDistortion:   { value: 0 },
    uFocus:        { value: 0 },
    uHolo:         { value: 1 },
    uOpacity:      { value: 1 },
    uColorCyan:    { value: new THREE.Color('#1CE0C4') },
    uColorMagenta: { value: new THREE.Color('#B872FF') },
  }), [texture])

  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader:   projectCardVert,
    fragmentShader: projectCardFrag,
    uniforms,
    transparent: true,
    side:        THREE.FrontSide,
    depthWrite:  false,
  }), [uniforms])

  const glowMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color:       new THREE.Color('#1CE0C4'),
    transparent: true,
    opacity:     0,
    blending:    THREE.AdditiveBlending,
    depthWrite:  false,
  }), [])

  // Set cylinder position + run intro animation
  useEffect(() => {
    if (!posRef.current) return
    const x = Math.sin(baseAngle) * RADIUS
    const z = Math.cos(baseAngle) * RADIUS
    posRef.current.position.set(x, 0, z)
    posRef.current.rotation.y = baseAngle

    if (isReduced || !introRef.current) return
    introRef.current.scale.setScalar(0.6)
    gsap.to(introRef.current.scale, {
      x: 1, y: 1, z: 1,
      duration: 1.2, ease: 'power3.out',
      delay: 0.3 + index * 0.12,
    })
  }, [baseAngle, index, isReduced])

  // Dispose on unmount
  useEffect(() => () => {
    cardGeo.dispose(); glowGeo.dispose()
    material.dispose(); glowMaterial.dispose()
    texture.dispose()
  }, [cardGeo, glowGeo, material, glowMaterial, texture])

  useFrame(({ clock }) => {
    if (!matRef.current || !posRef.current) return
    const { scroll, render, activeFilter } = usePortfolioStore.getState()

    // Filter visibility
    const shouldShow = !activeFilter || datum.tags.includes(activeFilter)
    filterLerp.current += ((shouldShow ? 1 : 0) - filterLerp.current) * 0.08
    if (filterRef.current) filterRef.current.scale.setScalar(Math.max(0.001, filterLerp.current))

    // Focus lerp
    const isFocused = focusedRef.current === index
    focusLerp.current += ((isFocused ? 1 : 0) - focusLerp.current) * 0.06

    // Focus scale on the mesh
    const targetScale = 1.0 + focusLerp.current * 0.12
    if (meshRef.current) {
      meshRef.current.scale.x += (targetScale - meshRef.current.scale.x) * 0.07
      meshRef.current.scale.y  = meshRef.current.scale.x
    }

    // Depth opacity: cards facing away get reduced alpha (no per-frame alloc)
    posRef.current.getWorldPosition(_worldPos)
    const depthFactor = _worldPos.z > 0 ? 1.0 : 0.45
    const finalOpacity = Math.max(depthFactor, focusLerp.current) * filterLerp.current

    // Uniforms
    const u = matRef.current.uniforms
    u.uTime.value       = clock.elapsedTime
    u.uScrollVel.value  = scroll.velocity
    u.uDistortion.value = render.distortion
    u.uFocus.value      = focusLerp.current
    u.uActive.value     = focusLerp.current
    u.uOpacity.value    = finalOpacity

    // Glow
    if (glowMatRef.current) glowMatRef.current.opacity = focusLerp.current * 0.3
  })

  return (
    <group ref={posRef}>
      <group ref={filterRef}>
        <group ref={introRef}>
          <mesh
            ref={meshRef}
            geometry={cardGeo}
            onPointerEnter={() => window.dispatchEvent(new CustomEvent('cursorExpand', { detail: { expand: true } }))}
            onPointerLeave={() => window.dispatchEvent(new CustomEvent('cursorExpand', { detail: { expand: false } }))}
            onClick={() => { if (focusedRef.current === index) setDetailProject(index) }}
          >
            <primitive object={material} ref={matRef} attach="material" />
          </mesh>
          {/* Rim glow plane */}
          <mesh ref={glowRef} geometry={glowGeo} position={[0, 0, -0.02]}>
            <primitive object={glowMaterial} ref={glowMatRef} attach="material" />
          </mesh>
        </group>
      </group>
    </group>
  )
}

// ─── Carousel group ────────────────────────────────────────────────────────────

export default function Carousel3D() {
  const outerRef    = useRef<THREE.Group>(null!)  // tilt + Y translation
  const innerRef    = useRef<THREE.Group>(null!)  // Y rotation
  const focusedRef  = useRef(0)
  const rotProxy    = useRef({ y: 0 })
  const quickToYRef = useRef<((val: number) => void) | null>(null)

  const isReduced = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const BASE_ANGLES = useMemo(() =>
    PROJECTS.map((_, i) => (TWO_PI / N) * i), [])

  useEffect(() => {
    if (isReduced) return
    quickToYRef.current = gsap.quickTo(rotProxy.current, 'y', {
      duration: 0.9,
      ease: 'power3.out',
    })
  }, [isReduced])

  useFrame(() => {
    if (isReduced) return
    const sp = usePortfolioStore.getState().scroll.progress
    quickToYRef.current?.(sp * TWO_PI)

    if (innerRef.current) innerRef.current.rotation.y = rotProxy.current.y

    // Focused card: smallest angular distance to world front (angle = 0)
    const gy = rotProxy.current.y
    let best = 0, bestDist = Infinity
    for (let i = 0; i < N; i++) {
      const worldA   = BASE_ANGLES[i] + gy
      const norm     = ((worldA % TWO_PI) + TWO_PI) % TWO_PI
      const dist     = Math.min(norm, TWO_PI - norm)
      if (dist < bestDist) { bestDist = dist; best = i }
    }
    focusedRef.current = best
  })

  return (
    // Slight forward tilt (rotX = -0.08) applied to outer group
    <group ref={outerRef} rotation={[-0.08, 0, 0]}>
      <group ref={innerRef}>
        {PROJECTS.map((datum, i) => (
          <ProjectCard
            key={datum.title}
            datum={datum}
            index={i}
            baseAngle={BASE_ANGLES[i]}
            focusedRef={focusedRef}
            isReduced={isReduced}
          />
        ))}
      </group>
    </group>
  )
}
