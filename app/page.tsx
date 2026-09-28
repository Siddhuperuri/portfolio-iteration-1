'use client'

import { useEffect, useRef, Suspense, lazy, useState, useCallback } from 'react'
import { Component, ReactNode, ErrorInfo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import { usePortfolioStore } from './store'
import Overlay from './Overlay'
import AudioToggle from './AudioToggle'

const Scene = lazy(() => import('./Scene'))

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, CustomEase)
  gsap.defaults({ ease: 'power3.out', duration: 0.9 })
  ScrollTrigger.config({ ignoreMobileResize: true, autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load' })
}

// ─── Loading screen ───────────────────────────────────────────────────────────

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const wrapRef  = useRef<HTMLDivElement>(null!)
  const barRef   = useRef<HTMLDivElement>(null!)
  const pctRef   = useRef<HTMLSpanElement>(null!)
  const labelRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    const tl = gsap.timeline({ onComplete })
    const counter = { value: 0 }
    tl.to(counter, {
      value: 100, duration: 3.8, ease: 'power2.inOut',
      onUpdate: () => {
        if (pctRef.current) pctRef.current.textContent = `${Math.round(counter.value).toString().padStart(3, '0')}`
        if (barRef.current) barRef.current.style.width = `${counter.value}%`
      },
    })
    const labels = ['INITIALISING', 'LOADING SHADERS', 'BUILDING SCENE', 'READY']
    labels.forEach((lbl, i) => tl.call(() => { if (labelRef.current) labelRef.current.textContent = lbl }, [], i * 0.95))
    tl.to(wrapRef.current, { yPercent: -100, duration: 0.7, ease: 'power4.inOut' }, '+=0.4')
    return () => { tl.kill() }
  }, [onComplete])

  const FONT_DISPLAY = `'Bebas Neue', 'Anton', sans-serif`
  const FONT_MONO    = `'JetBrains Mono', monospace`

  return (
    <div ref={wrapRef} style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'radial-gradient(ellipse at 50% 40%, rgba(153,41,234,0.12) 0%, #000000 65%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '28px', pointerEvents: 'all',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.95,
      }}>
        <svg width="26" height="26" viewBox="0 0 26 26">
          <circle cx="13" cy="13" r="11" stroke="#00F7FF" strokeWidth="1" fill="none" />
          <circle cx="13" cy="13" r="3.5" fill="#FF0087" />
        </svg>
        <span style={{
          fontFamily: FONT_DISPLAY, fontSize: 'clamp(28px, 5vw, 54px)', fontWeight: 400,
          letterSpacing: '-0.5px', textTransform: 'uppercase', color: '#E8EEFF',
        }}>Siddhartha</span>
      </div>
      <div ref={labelRef} style={{
        fontFamily: FONT_MONO, fontSize: '11px', letterSpacing: '3px',
        color: 'rgba(0,247,255,0.85)', textTransform: 'uppercase',
        minWidth: '240px', textAlign: 'center',
      }}>INITIALISING</div>
      <div style={{
        width: 'clamp(200px, 30vw, 340px)', height: '1px',
        background: 'rgba(215,225,255,0.08)', borderRadius: '1px',
        overflow: 'hidden', position: 'relative',
      }}>
        <div ref={barRef} style={{
          position: 'absolute', top: 0, left: 0, height: '100%', width: '0%',
          background: 'linear-gradient(90deg, #00F7FF, #FF0087, #9929EA)',
          borderRadius: '1px', transition: 'none',
        }} />
      </div>
      <div style={{
        fontFamily: FONT_MONO, fontSize: '11px', letterSpacing: '3px',
        color: 'rgba(215,225,255,0.4)', textTransform: 'uppercase',
      }}>
        <span ref={pctRef}>000</span> <span style={{ color: 'rgba(215,225,255,0.25)' }}>/ 100</span>
      </div>
    </div>
  )
}

// ─── Scene fallback ───────────────────────────────────────────────────────────

function SceneFallback() {
  return <div style={{ position: 'fixed', inset: 0, zIndex: -1, background: 'radial-gradient(ellipse at 30% 40%, rgba(28,224,196,0.04) 0%, #07070C 65%)' }} />
}

// ─── Error boundary ───────────────────────────────────────────────────────────

interface EBState { hasError: boolean; message: string }
class SceneErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { hasError: false, message: '' }
  static getDerivedStateFromError(err: Error): EBState { return { hasError: true, message: err.message } }
  componentDidCatch(err: Error, info: ErrorInfo) { console.error('[Scene] WebGL error:', err, info) }
  render() {
    if (this.state.hasError) return (
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, background: '#07070C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '2px', color: 'rgba(184,114,255,0.55)', textTransform: 'uppercase' }}>
          WEBGL_CONTEXT_FAILED &mdash; {this.state.message.slice(0, 60)}
        </div>
      </div>
    )
    return this.props.children
  }
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (locked) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [locked])
}

function useScrollTriggerRefresh() {
  useEffect(() => {
    let debounce: ReturnType<typeof setTimeout>
    const onResize = () => { clearTimeout(debounce); debounce = setTimeout(() => ScrollTrigger.refresh(true), 200) }
    window.addEventListener('resize', onResize, { passive: true })
    return () => { window.removeEventListener('resize', onResize); clearTimeout(debounce) }
  }, [])
}

function useReducedMotion() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) gsap.globalTimeline.timeScale(10)
    const handler = (e: MediaQueryListEvent) => gsap.globalTimeline.timeScale(e.matches ? 10 : 1)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
}

function useProjectScrollSync() {
  useEffect(() => {
    const aboutSection = document.getElementById('about')
    if (!aboutSection) return
    const trigger = ScrollTrigger.create({
      trigger: aboutSection, start: 'top center', end: '+=120%',
      onUpdate: (self) => usePortfolioStore.getState().setScrollProgress(self.progress),
    })
    return () => trigger.kill()
  }, [])
}

function useKeyboardNav() {
  useEffect(() => {
    const sections = ['#hero', '#about', '#work', '#toolkit', '#education', '#contact']
    let current = 0
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        usePortfolioStore.getState().setDetailProject(null)
        return
      }
      if (e.key === 'ArrowDown' || e.key === 'j') {
        current = Math.min(current + 1, sections.length - 1)
        document.querySelector(sections[current])?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      if (e.key === 'ArrowUp' || e.key === 'k') {
        current = Math.max(current - 1, 0)
        document.querySelector(sections[current])?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

function StoreInitialiser() {
  const toggleTheme = usePortfolioStore(s => s.toggleTheme)
  const isDark      = usePortfolioStore(s => s.theme.isDark)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem('theme') === 'light' && isDark) toggleTheme()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [loaded, setLoaded] = useState(false)
  const pageRef = useRef<HTMLDivElement>(null!)

  useScrollLock(!loaded)
  useScrollTriggerRefresh()
  useReducedMotion()
  useProjectScrollSync()
  useKeyboardNav()

  const handleLoadComplete = useCallback(() => {
    setLoaded(true)
    requestAnimationFrame(() => ScrollTrigger.refresh(true))
    if (pageRef.current) gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' })
  }, [])

  // Safety net: if the loading-screen timeline ever fails to fire onComplete
  // (e.g. an error mid-timeline), the body would stay locked at overflow:hidden
  // forever and the wheel would appear completely dead. Force unlock after 6s.
  useEffect(() => {
    const t = setTimeout(() => setLoaded(prev => prev || true), 6000)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <StoreInitialiser />
      {!loaded && <LoadingScreen onComplete={handleLoadComplete} />}
      <div ref={pageRef} style={{ position: 'relative', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
        <SceneErrorBoundary>
          <Suspense fallback={<SceneFallback />}>
            {loaded && <Scene />}
          </Suspense>
        </SceneErrorBoundary>
        {loaded && <Overlay />}
        {loaded && <AudioToggle />}
      </div>
    </>
  )
}
