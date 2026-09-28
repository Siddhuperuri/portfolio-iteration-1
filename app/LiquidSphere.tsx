'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import * as THREE from 'three'
import { liquidSphereVert, liquidSphereFrag, makeSphereUniforms } from './Shaders'
import { usePortfolioStore } from './store'

const LERP_FACTOR_SLOW   = 0.035
const LERP_FACTOR_FAST   = 0.08
const SPHERE_BASE_RADIUS = 1.0
const ICOSAHEDRON_DETAIL = 16   // was 64 — reduces geometry from ~82k to ~5k triangles

// Module-level temps — safe for single-threaded JS; avoids per-frame allocation
const _lv2 = new THREE.Vector2()
const _lv3 = new THREE.Vector3()

interface SphereProps {
  position?: [number, number, number]
}

export function LiquidSphere({ position = [0, 0, 0] }: SphereProps) {
  const meshRef     = useRef<THREE.Mesh>(null!)
  const lerpedMouse = useRef(new THREE.Vector2(0, 0))
  const lerpedPos   = useRef(new THREE.Vector3(...position))
  const lerpedVel   = useRef(0)
  const lerpedDistort = useRef(0)

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(SPHERE_BASE_RADIUS, ICOSAHEDRON_DETAIL)
    return geo.toNonIndexed()
  }, [])

  const uniforms = useMemo(() => makeSphereUniforms(), [])

  const material = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader:   liquidSphereVert,
      fragmentShader: liquidSphereFrag,
      uniforms,
      side:           THREE.FrontSide,
      transparent:    false,
      depthWrite:     true,
      depthTest:      true,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => () => {
    geometry.dispose()
    material.dispose()
  }, [geometry, material])

  useFrame(({ clock: c }) => {
    if (!meshRef.current) return
    const u = material.uniforms
    // Read fresh values from store without subscribing — avoids re-renders
    const { mouse: { normalized: mn }, scroll: { velocity: sv }, render: rd } =
      usePortfolioStore.getState()

    u.uTime.value = c.elapsedTime

    lerpedMouse.current.lerp(_lv2.set(mn.x, mn.y), LERP_FACTOR_SLOW)
    u.uMouse.value.copy(lerpedMouse.current)

    lerpedVel.current += (sv - lerpedVel.current) * LERP_FACTOR_FAST
    u.uScrollVel.value = lerpedVel.current

    lerpedDistort.current += (rd.distortion - lerpedDistort.current) * LERP_FACTOR_FAST
    u.uDistortion.value = lerpedDistort.current

    const targetX = Math.max(-1.8, Math.min(1.8, mn.x * 0.9))
    const targetY = Math.max(-1.0, Math.min(1.0, mn.y * 0.5))
    lerpedPos.current.lerp(
      _lv3.set(position[0] + targetX, position[1] + targetY, position[2]),
      LERP_FACTOR_SLOW
    )
    meshRef.current.position.copy(lerpedPos.current)

    const t = c.elapsedTime
    meshRef.current.rotation.y = Math.sin(t * 0.12) * 0.25
    meshRef.current.rotation.x = Math.sin(t * 0.08) * 0.12
    meshRef.current.rotation.z = Math.sin(t * 0.06) * 0.08

    const breathe   = 1.0 + Math.sin(t * 0.55) * 0.018
    const velSquish = 1.0 - Math.min(Math.abs(sv) / 120, 0.12)
    meshRef.current.scale.setScalar(breathe * velSquish)
  })

  return <mesh ref={meshRef} geometry={geometry} material={material} />
}

// ─── Halo ────────────────────────────────────────────────────────────────────

const HALO_VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`
const HALO_FRAG = /* glsl */`
uniform float uTime;
uniform float uScrollVel;
varying vec2 vUv;
void main() {
  vec2  center = vUv - 0.5;
  float dist   = length(center);
  float ring   = smoothstep(0.5, 0.0, dist);
  ring = pow(ring, 2.8);
  float t   = sin(uTime * 0.3) * 0.5 + 0.5;
  vec3 col  = mix(vec3(0.0, 0.97, 1.0), vec3(0.6, 0.16, 0.92), t);
  float velBoost = 1.0 + clamp(abs(uScrollVel) / 60.0, 0.0, 1.0) * 0.4;
  gl_FragColor = vec4(col * ring * velBoost, ring * 0.22);
}
`

function SphereHalo() {
  const matRef  = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uScrollVel: { value: 0 } }), [])
  const geo = useMemo(() => new THREE.PlaneGeometry(4.2, 4.2), [])
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: HALO_VERT, fragmentShader: HALO_FRAG, uniforms,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  }), [uniforms])

  useFrame(({ clock: c }) => {
    if (!matRef.current) return
    const sv = usePortfolioStore.getState().scroll.velocity
    matRef.current.uniforms.uTime.value      = c.elapsedTime
    matRef.current.uniforms.uScrollVel.value = sv
  })

  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])

  return (
    <mesh geometry={geo} position={[0, 0, -0.5]}>
      <primitive object={mat} ref={matRef} attach="material" />
    </mesh>
  )
}

// ─── Neon Ring ───────────────────────────────────────────────────────────────

const RING_VERT = /* glsl */`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`
const RING_FRAG = /* glsl */`
uniform float uTime;
uniform vec3  uColor;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
  float dash   = sin(angle * 12.0 + uTime * 3.0) * 0.5 + 0.5;
  dash = pow(dash, 6.0);
  vec2  c    = vUv - 0.5;
  float dist = length(c);
  float ring = smoothstep(0.48, 0.46, dist) * smoothstep(0.40, 0.42, dist);
  gl_FragColor = vec4(uColor, ring * uOpacity * (0.5 + dash * 0.5));
}
`

interface RingProps {
  color: string
  scale: number
  rotationAxis: THREE.Vector3
  speed: number
  phase: number
  opacity?: number
}

function NeonRing({ color, scale, rotationAxis, speed, phase, opacity = 0.7 }: RingProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const matRef  = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity },
  }), [color, opacity])
  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1), [])
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: RING_VERT, fragmentShader: RING_FRAG, uniforms,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  }), [uniforms])

  const quaternionBase = useMemo(() => {
    const q = new THREE.Quaternion()
    q.setFromAxisAngle(rotationAxis.normalize(), phase)
    return q
  }, [rotationAxis, phase])

  const deltaQ = useMemo(() => {
    const q = new THREE.Quaternion()
    q.setFromAxisAngle(rotationAxis.normalize(), speed * 0.016)
    return q
  }, [rotationAxis, speed])

  useFrame(({ clock: c }) => {
    if (!meshRef.current || !matRef.current) return
    matRef.current.uniforms.uTime.value = c.elapsedTime
    meshRef.current.quaternion.multiply(deltaQ)
  })

  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])

  return (
    <mesh ref={meshRef} geometry={geo} scale={[scale, scale, scale]} quaternion={quaternionBase}>
      <primitive object={mat} ref={matRef} attach="material" />
    </mesh>
  )
}

// ─── Exported composite ───────────────────────────────────────────────────────

export default function LiquidSphereSystem() {
  const groupRef = useRef<THREE.Group>(null!)
  // Hero: right side, full size. Past hero: tucked into the lower-right
  // corner at reduced scale so it reads as an ambient accent instead of
  // a full-bleed object sitting on top of section copy.
  const proxy = useRef({ x: 2.4, y: 0, scale: 1 })

  useEffect(() => {
    return usePortfolioStore.subscribe(
      s => s.scroll.progress,
      (progress) => {
        const inHero = progress < 0.08
        gsap.to(proxy.current, {
          x: inHero ? 2.4 : 3.6,
          y: inHero ? 0 : -1.7,
          scale: inHero ? 1 : 0.5,
          duration: 1.1, ease: 'power3.out', overwrite: true,
        })
      }
    )
  }, [])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = proxy.current.x
      groupRef.current.position.y = proxy.current.y
      groupRef.current.scale.setScalar(proxy.current.scale)
    }
  })

  return (
    <group ref={groupRef}>
      <SphereHalo />
      <LiquidSphere position={[0, 0, 0]} />
      <NeonRing color="#00F7FF" scale={2.15} rotationAxis={new THREE.Vector3(1, 0.25, 0)}  speed={0.22}  phase={0}             opacity={0.35} />
      <NeonRing color="#9929EA" scale={2.55} rotationAxis={new THREE.Vector3(0.2, 1, 0.4)} speed={-0.18} phase={Math.PI / 3}   opacity={0.25} />
      <NeonRing color="#FF0087" scale={2.95} rotationAxis={new THREE.Vector3(0.4, 0.5, 1)} speed={0.11}  phase={Math.PI * 0.7} opacity={0.18} />
    </group>
  )
}
