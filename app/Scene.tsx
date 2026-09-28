'use client'

import { useRef, useMemo, useEffect, useCallback, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'
import * as THREE from 'three'

import LiquidSphereSystem from './LiquidSphere'
import { particleVert, particleFrag, GLSL_SIMPLEX_3D } from './Shaders'
import { usePortfolioStore } from './store'

// Module-level temp vectors — no per-frame allocation
const _ct1 = new THREE.Vector3()
const _ct2 = new THREE.Vector3()
const _shk = new THREE.Vector3()

// ─── Soft, offset key lights ──────────────────────────────────────────────────

function OrbitingLights() {
  const light1Ref = useRef<THREE.DirectionalLight>(null!)
  const light2Ref = useRef<THREE.DirectionalLight>(null!)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.18
    const R = 4.5
    if (light1Ref.current) light1Ref.current.position.set(Math.sin(t) * R, 2.0, Math.cos(t) * R)
    if (light2Ref.current) light2Ref.current.position.set(Math.sin(t + Math.PI) * R, -1.5, Math.cos(t + Math.PI) * 2.5)
  })

  return (
    <>
      <ambientLight intensity={0.18} color="#1a0a2e" />
      <directionalLight ref={light1Ref} intensity={1.1} color="#00F7FF" castShadow={false} />
      <directionalLight ref={light2Ref} intensity={0.7} color="#FF0087" castShadow={false} />
      <pointLight position={[0, -3, 2]} intensity={0.3} color="#9929EA" distance={8} decay={2} />
    </>
  )
}

// ─── Camera — gentle, architectural drift + detail zoom ───────────────────────

function CameraController({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera } = useThree()

  const lerpedTarget  = useRef(new THREE.Vector3(0, 0, 5))
  const lerpedLookAt  = useRef(new THREE.Vector3(0, 0, 0))
  const shakeOffset   = useRef(new THREE.Vector3())
  const cameraZProxy  = useRef({ z: 5.2 })
  const zoomActive    = useRef(false)

  const computeShake = useCallback((trauma: number, t: number) => {
    const s = trauma * trauma
    shakeOffset.current.set(
      s * (Math.sin(t * 17.3 + 1.0) * 0.05 + Math.sin(t * 31.7) * 0.025),
      s * (Math.sin(t * 13.1 + 2.5) * 0.05 + Math.sin(t * 27.3) * 0.025),
      0
    )
  }, [])

  // Subscribe to detailProject for cinematic zoom
  useEffect(() => {
    const { gsap } = require('gsap')
    const unsub = usePortfolioStore.subscribe(
      s => s.detailProject,
      (detail) => {
        if (detail !== null) {
          zoomActive.current = true
          gsap.to(cameraZProxy.current, { z: 3.5, duration: 0.9, ease: 'power3.out' })
        } else {
          gsap.to(cameraZProxy.current, { z: 5.2, duration: 0.9, ease: 'power3.out',
            onComplete: () => { zoomActive.current = false } })
        }
      }
    )
    return unsub
  }, [])

  useFrame(({ clock }) => {
    const { scroll, mouse } = usePortfolioStore.getState()
    const t  = clock.elapsedTime
    const sp = scroll.progress
    const sv = scroll.velocity
    const mn = mouse.normalized

    const effectiveZ = zoomActive.current ? cameraZProxy.current.z : 5.2
    const targetX = reducedMotion ? 0 : mn.x * 0.25

    lerpedTarget.current.lerp(_ct1.set(targetX, 0, effectiveZ), 0.04)
    lerpedLookAt.current.lerp(_ct2.set(reducedMotion ? 0 : mn.x * 0.12, 0, 0), 0.05)

    if (!reducedMotion) {
      const trauma = Math.min(Math.abs(sv) / 80, 1)
      computeShake(trauma, t)
    } else {
      shakeOffset.current.set(0, 0, 0)
    }

    camera.position.copy(lerpedTarget.current).add(shakeOffset.current)
    camera.lookAt(lerpedLookAt.current)
  })

  return null
}

// ─── Iridescent dust field ────────────────────────────────────────────────────

const PARTICLE_COUNT = 1200

function ParticleField({ reducedMotion }: { reducedMotion: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!)
  const matRef    = useRef<THREE.ShaderMaterial>(null!)

  const { geometry, uniforms } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const sizes     = new Float32Array(PARTICLE_COUNT)
    const randoms   = new Float32Array(PARTICLE_COUNT)
    const colors    = new Float32Array(PARTICLE_COUNT * 3)
    const palette   = [
      new THREE.Color('#00F7FF'),
      new THREE.Color('#FF0087'),
      new THREE.Color('#9929EA'),
      new THREE.Color('#FF5FCF'),
      new THREE.Color('#FEEE91'),
    ]

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      positions[i3]     = (Math.random() - 0.5) * 24
      positions[i3 + 1] = (Math.random() - 0.5) * 14
      positions[i3 + 2] = (Math.random() - 0.5) * 20 - 2
      sizes[i]   = Math.random() * 0.006 + 0.0015
      randoms[i] = Math.random()
      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aRandom',  new THREE.BufferAttribute(randoms, 1))
    geo.setAttribute('aColor',   new THREE.BufferAttribute(colors, 3))

    const u = {
      uTime:           { value: 0 },
      uScrollProgress: { value: 0 },
      uScrollVel:      { value: 0 },
      uMouse:          { value: new THREE.Vector2() },
    }
    return { geometry: geo, uniforms: u }
  }, [])

  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: particleVert, fragmentShader: particleFrag, uniforms,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, vertexColors: true,
  }), [uniforms])

  useFrame(({ clock }) => {
    if (!matRef.current) return
    const { scroll, mouse } = usePortfolioStore.getState()
    const u = matRef.current.uniforms
    u.uTime.value           = reducedMotion ? 0 : clock.elapsedTime
    u.uScrollProgress.value = scroll.progress
    u.uScrollVel.value      = reducedMotion ? 0 : scroll.velocity
    u.uMouse.value.set(mouse.normalized.x, mouse.normalized.y)
  })

  useEffect(() => () => { geometry.dispose(); material.dispose() }, [geometry, material])

  return (
    <points ref={pointsRef} geometry={geometry}>
      <primitive object={material} ref={matRef} attach="material" />
    </points>
  )
}

// ─── Faint horizon grid ───────────────────────────────────────────────────────

const GRID_VERT = /* glsl */`
varying vec2 vUv; varying float vDepth;
void main() {
  vUv = uv;
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  vDepth = clamp(-mvPos.z / 22.0, 0.0, 1.0);
  gl_Position = projectionMatrix * mvPos;
}
`
const GRID_FRAG = /* glsl */`
uniform float uTime; uniform float uScrollProgress;
varying vec2 vUv; varying float vDepth;

float gridLine(vec2 uv, float freq, float thick) {
  vec2 grid = abs(fract(uv * freq - 0.5) - 0.5) / fwidth(uv * freq);
  float line = min(grid.x, grid.y);
  return 1.0 - smoothstep(0.0, thick, line);
}

void main() {
  vec2 scrolledUV = vUv + vec2(0.0, uScrollProgress * 1.6 + uTime * 0.025);
  float coarse = gridLine(scrolledUV, 4.0,  1.0);
  float fine   = gridLine(scrolledUV, 20.0, 0.7) * 0.30;
  float grid   = coarse + fine;
  vec3 near = vec3(0.373, 0.604, 0.588);
  vec3 far  = vec3(0.725, 0.670, 0.850);
  vec3 col  = mix(near, far, vUv.x);
  float alpha = grid * (1.0 - vDepth) * 0.13;
  gl_FragColor = vec4(col, alpha);
}
`

function CyberGrid() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uScrollProgress: { value: 0 } }), [])
  const geo = useMemo(() => new THREE.PlaneGeometry(34, 34, 1, 1), [])
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: GRID_VERT, fragmentShader: GRID_FRAG, uniforms,
    transparent: true, side: THREE.DoubleSide, depthWrite: false,
  }), [uniforms])

  useFrame(({ clock }) => {
    if (!matRef.current) return
    matRef.current.uniforms.uTime.value           = clock.elapsedTime
    matRef.current.uniforms.uScrollProgress.value = usePortfolioStore.getState().scroll.progress
  })

  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])

  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.0, -6]}>
      <primitive object={mat} ref={matRef} attach="material" />
    </mesh>
  )
}

// ─── Atmosphere cap ───────────────────────────────────────────────────────────

const ATMOS_VERT = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`
const ATMOS_FRAG = /* glsl */`
uniform float uTime;
varying vec2 vUv;
void main() {
  vec2 p = vUv - 0.5;
  float d = length(p);
  float a = smoothstep(0.75, 0.0, distance(vUv, vec2(0.6, 0.4))) * 0.28;
  float b = smoothstep(0.65, 0.0, distance(vUv, vec2(0.2, 0.7))) * 0.14;
  vec3 purpleA = vec3(0.20, 0.0, 0.40);
  vec3 purpleB = vec3(0.12, 0.0, 0.24);
  vec3 col  = purpleA * a + purpleB * b;
  float vign = smoothstep(1.0, 0.3, d) * 0.22;
  col += vec3(0.05, 0.0, 0.10) * vign;
  gl_FragColor = vec4(col, 0.72);
}
`

function AtmosphereWash() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  const geo = useMemo(() => new THREE.PlaneGeometry(44, 26), [])
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: ATMOS_VERT, fragmentShader: ATMOS_FRAG, uniforms,
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.NormalBlending,
  }), [uniforms])

  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.uTime.value = clock.elapsedTime })
  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])

  return (
    <mesh geometry={geo} position={[0, 0, -15]} renderOrder={-10}>
      <primitive object={mat} ref={matRef} attach="material" />
    </mesh>
  )
}

// ─── Contact-section aurora ───────────────────────────────────────────────────

const AURORA_FRAG = /* glsl */`
${GLSL_SIMPLEX_3D}

uniform float uTime;
uniform float uIntensity;
varying vec2  vUv;

void main() {
  vec2  p  = vUv;
  float n1 = fbm(vec3(p.x * 2.0 + uTime * 0.07, p.y * 4.5, uTime * 0.04), 4, 2.0, 0.5);
  float n2 = fbm(vec3(p.x * 3.5 - uTime * 0.055, p.y * 5.5 + 1.8, uTime * 0.055), 3, 2.0, 0.5);
  float curtain = (n1 * 0.5 + 0.5) * smoothstep(0.0, 0.18, p.y) * smoothstep(1.0, 0.6, p.y);
  vec3  crimson = vec3(1.0, 0.0, 0.235);
  vec3  violet  = vec3(0.722, 0.447, 1.0);
  vec3  teal    = vec3(0.11, 0.878, 0.769);
  vec3  col     = mix(crimson, violet, n2 * 0.5 + 0.5);
  col = mix(col, teal, curtain * 0.18);
  gl_FragColor  = vec4(col, curtain * uIntensity * 0.48);
}
`

function AuroraWash() {
  const matRef   = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uIntensity: { value: 0 } }), [])
  const geo      = useMemo(() => new THREE.PlaneGeometry(52, 32), [])
  const mat      = useMemo(() => new THREE.ShaderMaterial({
    vertexShader:   ATMOS_VERT,
    fragmentShader: AURORA_FRAG,
    uniforms,
    transparent: true,
    depthWrite:  false,
    depthTest:   false,
    blending:    THREE.AdditiveBlending,
  }), [uniforms])

  useFrame(({ clock }) => {
    if (!matRef.current) return
    const sp = usePortfolioStore.getState().scroll.progress
    const u  = matRef.current.uniforms
    u.uTime.value = clock.elapsedTime
    const target  = Math.max(0, (sp - 0.7) / 0.3)
    u.uIntensity.value += (target - u.uIntensity.value) * 0.028
  })

  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])

  return (
    <mesh geometry={geo} position={[0, 0, -14]} renderOrder={-8}>
      <primitive object={mat} ref={matRef} attach="material" />
    </mesh>
  )
}

// ─── Post FX ─────────────────────────────────────────────────────────────────

function PostFX() {
  const bloomRef = useRef<any>(null)
  const caRef    = useRef<any>(null)

  useFrame(() => {
    const { render } = usePortfolioStore.getState()
    if (bloomRef.current) bloomRef.current.intensity = render.bloom
    if (caRef.current?.offset) {
      const o = render.chromaticAberration
      const off = caRef.current.offset
      if (typeof off.set === 'function') off.set(o, o)
      else { off.x = o; off.y = o }
    }
  })

  return (
    <EffectComposer multisampling={0}>
      <Bloom ref={bloomRef} kernelSize={KernelSize.MEDIUM} luminanceThreshold={0.22}
        luminanceSmoothing={0.92} intensity={0.55} blendFunction={BlendFunction.ADD} mipmapBlur />
      <ChromaticAberration
        ref={caRef}
        blendFunction={BlendFunction.NORMAL}
        offset={[0.0012, 0.0012] as any}
        radialModulation={false}
        modulationOffset={0}
      />
      <Noise blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.22} />
      <Vignette blendFunction={BlendFunction.NORMAL} darkness={0.65} offset={0.28} />
    </EffectComposer>
  )
}

function StoreTick() {
  const tick = usePortfolioStore(s => s.tick)
  useFrame(() => tick())
  return null
}

function SceneFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.4, 16, 16]} />
      <meshBasicMaterial color="#9FCBC8" wireframe />
    </mesh>
  )
}

function InnerScene({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <StoreTick />
      <PerspectiveCamera makeDefault fov={45} near={0.1} far={100} position={[0, 0, 5]} />
      <CameraController reducedMotion={reducedMotion} />
      <OrbitingLights />
      <Suspense fallback={<SceneFallback />}>
        <LiquidSphereSystem />
        <CyberGrid />
        <ParticleField reducedMotion={reducedMotion} />
      </Suspense>
      <PostFX />
      <AdaptiveDpr />
      <AdaptiveEvents />
    </>
  )
}

interface SceneProps { className?: string }

export default function Scene({ className }: SceneProps) {
  const isDark = usePortfolioStore(s => s.theme.isDark)
  const reducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  return (
    <Canvas
      className={className}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}
      gl={{
        antialias: false, alpha: false, powerPreference: 'high-performance',
        stencil: false, depth: true, toneMapping: THREE.NoToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      dpr={[1, 1]}
      frameloop="always"
      shadows={false}
      flat
      scene={{ background: new THREE.Color(isDark ? '#000000' : '#1A0F2E') }}
      onCreated={({ gl }) => { gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)) }}
    >
      <InnerScene reducedMotion={reducedMotion} />
    </Canvas>
  )
}
