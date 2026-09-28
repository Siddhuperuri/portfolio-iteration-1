'use client'

import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import {
  usePortfolioStore, selectTheme, selectScrollProgress,
  PROJECTS, SKILL_GROUPS, LOOKING_FOR, PROFILE,
} from './store'
import GlitchText from './GlitchText'
import { GlareCard } from '../components/ui/GlareCard'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, CustomEase)
  CustomEase.create('liquid', 'M0,0 C0.25,0.1 0.25,1 1,1')
  CustomEase.create('snap',   'M0,0 C0.6,0 0.4,1 1,1')
}

// ─── Fonts + global tokens (used inline) ──────────────────────────────────────

const FONT_DISPLAY = `'Bebas Neue', 'Anton', 'Oswald', sans-serif`
const FONT_BODY    = `'Inter', system-ui, sans-serif`
const FONT_MONO    = `'JetBrains Mono', 'Courier Prime', ui-monospace, monospace`

// Brand colours
const TEAL   = '#00F7FF'
const VIOLET = '#FF0087'
const LAV    = '#9929EA'
const AMBER  = '#FF5FCF'

// ─── Mouse tracker (feeds the 3D scene, renders nothing) ─────────────────────

function MouseTracker() {
  const setMouse = usePortfolioStore(s => s.setMouseRaw)
  const setNorm  = usePortfolioStore(s => s.setMouseNormalized)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onMove = (e: MouseEvent) => {
      setMouse(e.clientX, e.clientY)
      setNorm(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      )
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [setMouse, setNorm])

  return null
}

// ─── Pill nav (top-right) ─────────────────────────────────────────────────────

function PillNav() {
  const navRef = useRef<HTMLElement>(null!)
  const theme  = usePortfolioStore(selectTheme)

  useEffect(() => {
    if (!navRef.current) return
    gsap.fromTo(navRef.current, { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'liquid', delay: 0.1 })
  }, [])

  const link = (href: string, children: string) => {
    const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    return (
      <a href={href} onClick={onClick} className="nav-link interactive"
        style={{
          fontFamily: FONT_MONO, fontSize: '11px', letterSpacing: '2.5px',
          textTransform: 'uppercase', color: 'var(--ov-text)', textDecoration: 'none',
          padding: '4px 6px', cursor: 'pointer', fontWeight: 500,
        }}>
        {children}
      </a>
    )
  }

  return (
    <nav ref={navRef} style={{
      position: 'fixed', top: '28px', right: 'clamp(20px, 3vw, 44px)', zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '14px',
    }}>
      <div className="pill-nav" style={{
        display: 'flex', alignItems: 'center', gap: '18px',
        padding: '10px 22px', borderRadius: '999px',
        background: 'rgba(7,7,12,0.68)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        border: `1px solid rgba(0,247,255,0.14)`,
        boxShadow: '0 8px 28px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(0,247,255,0.04)',
      }}>
        {link('#work', 'Work')}
        <svg width="44" height="10" viewBox="0 0 44 10" fill="none" style={{ opacity: 0.45 }}>
          <path d="M1 5 Q 11 1, 22 5 T 43 5" stroke={theme.colors.teal} strokeWidth="1" fill="none" />
        </svg>
        {link('#contact', 'Contact')}
      </div>
      <a href={`mailto:${PROFILE.email}`}
        className="btn interactive"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          padding: '8px 18px', borderRadius: '999px',
          background: 'rgba(7,7,12,0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid rgba(0,247,255,0.22)`,
          boxShadow: `0 0 20px rgba(0,247,255,0.08), inset 0 0 12px rgba(0,247,255,0.04)`,
          fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '2px',
          textTransform: 'uppercase', color: 'rgba(215,225,255,0.75)',
          textDecoration: 'none', cursor: 'pointer',
        }}>
        Ask me anything…
        <span style={{ color: LAV }}>&#8594;</span>
      </a>
    </nav>
  )
}

// ─── Logo mark (top-left) ────────────────────────────────────────────────────

function LogoMark() {
  return (
    <div className="logo-mark interactive" style={{
      position: 'fixed', top: '30px', left: 'clamp(20px, 3vw, 44px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
    }}>
      <div style={{
        fontFamily: FONT_MONO, fontSize: '11px', letterSpacing: '2.5px',
        textTransform: 'uppercase', color: 'var(--ov-text)', fontWeight: 600,
      }}>
        Portfolio
      </div>
    </div>
  )
}

// ─── Left sidebar — "What are you looking for?" ──────────────────────────────

function Sidebar() {
  const sideRef     = useRef<HTMLDivElement>(null!)
  const activeFilter = usePortfolioStore(s => s.activeFilter)
  const setFilter    = usePortfolioStore(s => s.setActiveFilter)

  useEffect(() => {
    if (!sideRef.current) return
    const items = Array.from(sideRef.current.children)
    gsap.fromTo(items, { x: -16, opacity: 0 }, {
      x: 0, opacity: 1, stagger: 0.08, duration: 0.4, ease: 'power3.out', delay: 0.4,
    })
  }, [])

  return (
    <aside ref={sideRef} style={{
      position: 'fixed', bottom: '90px', left: 'clamp(20px, 3vw, 44px)', zIndex: 800,
      display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'auto',
    }}>
      <div style={{
        fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '2.5px',
        textTransform: 'uppercase', color: 'rgba(215,225,255,0.45)', marginBottom: '6px',
      }}>
        What are you looking for?
      </div>
      {LOOKING_FOR.map((item) => {
        const isActive = activeFilter === item
        return (
          <button key={item}
            onClick={() => setFilter(item)}
            className="interactive"
            style={{
              fontFamily: FONT_MONO, fontSize: '11px', letterSpacing: '2px',
              textTransform: 'uppercase',
              color: isActive ? TEAL : 'var(--ov-text)',
              textDecoration: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              opacity: isActive ? 1 : 0.82,
              transition: 'color 0.2s ease, opacity 0.2s ease',
              background: 'none', border: 'none', padding: 0,
              textShadow: isActive ? `0 0 12px rgba(0,247,255,0.5)` : 'none',
            }}>
            <span style={{ color: isActive ? TEAL : `rgba(153,41,234,0.6)` }}>&#8594;</span>
            <GlitchText text={item} trigger="hover" />
          </button>
        )
      })}
    </aside>
  )
}

// ─── Ask-me-anything (bottom-left) ───────────────────────────────────────────

function AskPill() {
  return (
    <a href={`mailto:${PROFILE.email}`}
      className="btn interactive"
      style={{
        position: 'fixed', bottom: '32px', left: 'clamp(20px, 3vw, 44px)', zIndex: 800,
        display: 'inline-flex', alignItems: 'center', gap: '10px',
        padding: '10px 20px', borderRadius: '999px',
        background: 'rgba(7,7,12,0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid rgba(0,247,255,0.22)`,
        boxShadow: `0 0 20px rgba(0,247,255,0.08), inset 0 0 12px rgba(0,247,255,0.04)`,
        fontFamily: FONT_MONO, fontSize: '11px', letterSpacing: '2px',
        textTransform: 'uppercase', color: 'rgba(215,225,255,0.75)',
        textDecoration: 'none', cursor: 'pointer',
      }}>
      Ask me anything…
      <span style={{ color: LAV }}>&#8594;</span>
    </a>
  )
}

// ─── Liquid Button ────────────────────────────────────────────────────────────

interface LiquidButtonProps {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'ghost'
  external?: boolean
}

function LiquidButton({ href, children, variant = 'primary', external = false }: LiquidButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null!)
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (external) return
    if (href.startsWith('#')) {
      e.preventDefault()
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  const base: React.CSSProperties = {
    position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '10px',
    padding: '14px 26px', borderRadius: '999px',
    fontFamily: FONT_MONO, fontSize: '11px', letterSpacing: '2.5px',
    textTransform: 'uppercase', fontWeight: 600, textDecoration: 'none',
    cursor: 'pointer', overflow: 'hidden',
    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  }
  const style: React.CSSProperties = variant === 'primary' ? {
    ...base,
    background: `linear-gradient(135deg, rgba(0,247,255,0.1), rgba(255,0,135,0.1))`,
    border: `1px solid rgba(0,247,255,0.38)`,
    color: 'var(--ov-text)',
    boxShadow: `inset 0 0 18px rgba(0,247,255,0.06), 0 0 22px rgba(0,247,255,0.1), 0 10px 30px rgba(0,0,0,0.4)`,
  } : {
    ...base,
    background: 'rgba(7,7,12,0.35)',
    border: '1px solid rgba(215,225,255,0.16)',
    color: 'var(--ov-text)',
    boxShadow: 'inset 0 0 12px rgba(215,225,255,0.02), 0 10px 30px rgba(0,0,0,0.3)',
  }
  return (
    <a ref={ref} href={href} onClick={onClick}
      className="btn interactive"
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      style={style}>
      {children}
      <span style={{ opacity: 0.7 }}>&#8594;</span>
    </a>
  )
}

// ─── Project detail overlay (case study) ─────────────────────────────────────

function ProjectDetail() {
  const detailProject  = usePortfolioStore(s => s.detailProject)
  const setDetail      = usePortfolioStore(s => s.setDetailProject)

  const datum = detailProject !== null ? PROJECTS[detailProject] : null

  // Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDetail(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setDetail])

  return (
    <AnimatePresence>
      {datum && (
        <motion.div
          key="project-detail"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed', inset: 0, zIndex: 5000,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setDetail(null)}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(7,7,12,0.72)', backdropFilter: 'blur(8px)',
              pointerEvents: 'auto', cursor: 'pointer',
            }}
          />
          {/* Panel */}
          <div style={{
            position: 'relative', zIndex: 1,
            width: '100%', maxWidth: '860px',
            margin: '0 clamp(16px, 4vw, 60px)',
            marginBottom: 'clamp(24px, 5vh, 60px)',
            padding: 'clamp(32px, 5vw, 56px)',
            borderRadius: '18px',
            background: 'rgba(27,11,42,0.95)', backdropFilter: 'blur(24px)',
            border: `1px solid rgba(0,247,255,0.18)`,
            boxShadow: `0 0 60px rgba(0,247,255,0.08), 0 30px 80px rgba(0,0,0,0.6)`,
            pointerEvents: 'auto',
          }}>
            {/* Close button */}
            <button onClick={() => setDetail(null)}
              className="interactive"
              aria-label="Close case study"
              style={{
                position: 'absolute', top: '24px', right: '24px',
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(215,225,255,0.14)',
                color: 'rgba(215,225,255,0.65)', fontFamily: FONT_MONO, fontSize: '14px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s ease',
              }}>
              ✕
            </button>

            {/* Tags */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {datum.tags.map(tag => (
                <span key={tag} style={{
                  fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '2px',
                  textTransform: 'uppercase', color: datum.color,
                  padding: '4px 12px', borderRadius: '999px',
                  border: `1px solid ${datum.color}44`,
                  background: `${datum.color}10`,
                }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: FONT_DISPLAY, fontSize: 'clamp(32px, 5vw, 64px)',
              fontWeight: 400, textTransform: 'uppercase', letterSpacing: '-1px',
              color: 'var(--ov-text)', lineHeight: 0.95, marginBottom: '12px',
            }}>
              {datum.title}
            </h2>

            {/* Subtitle */}
            <p style={{
              fontFamily: FONT_MONO, fontSize: '12px', letterSpacing: '2px',
              textTransform: 'uppercase', color: 'rgba(215,225,255,0.5)',
              marginBottom: '28px',
            }}>
              {datum.subtitle}
            </p>

            {/* Divider */}
            <div style={{ height: '1px', background: `linear-gradient(90deg, ${datum.color}44, transparent)`, marginBottom: '28px' }} />

            {/* Case study body */}
            <p style={{
              fontFamily: FONT_BODY, fontSize: 'clamp(14px, 1.1vw, 16px)', fontWeight: 300,
              color: 'rgba(215,225,255,0.78)', lineHeight: 1.78,
              maxWidth: '680px',
            }}>
              {datum.caseStudy}
            </p>

            {/* Tools */}
            <div style={{
              marginTop: '28px', fontFamily: FONT_MONO, fontSize: '11px', letterSpacing: '2px',
              textTransform: 'uppercase', color: datum.color, opacity: 0.8,
            }}>
              {datum.tools}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  const h1Ref   = useRef<HTMLHeadingElement>(null!)
  const subRef  = useRef<HTMLParagraphElement>(null!)
  const metaRef = useRef<HTMLDivElement>(null!)
  const ctaRef  = useRef<HTMLDivElement>(null!)
  const progress = usePortfolioStore(selectScrollProgress)

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 })
    tl.fromTo(h1Ref.current?.querySelectorAll('.hero-word') ?? [],
      { y: 80, opacity: 0, skewY: 4 }, { y: 0, opacity: 1, skewY: 0, stagger: 0.05, duration: 0.6, ease: 'liquid' })
     .fromTo(subRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, '-=0.3')
     .fromTo(metaRef.current?.children ?? [], { y: 12, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.04, duration: 0.38, ease: 'power3.out' }, '-=0.38')
     .fromTo(ctaRef.current?.children ?? [], { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.42, ease: 'power3.out' }, '-=0.28')
  }, [])

  return (
    <section id="hero" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: 'clamp(120px, 14vh, 160px) clamp(24px, 6vw, 96px) 0',
      position: 'relative', zIndex: 10,
      pointerEvents: progress > 0.25 ? 'none' : 'auto',
      transform: `translateY(${progress * -60}px)`,
      opacity: 1 - progress * 2.8,
      maxWidth: '1500px',
    }}>
      <div ref={metaRef} style={{
        display: 'flex', gap: '32px', marginBottom: '42px', flexWrap: 'wrap',
        fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '2.5px',
        textTransform: 'uppercase', color: 'rgba(215,225,255,0.45)',
      }}>
        <span><span style={{ color: TEAL }}>&#9632;</span> Portfolio &mdash; 2026</span>
        <span>Based in {PROFILE.location}</span>
      </div>

      <h1 ref={h1Ref} style={{
        fontFamily: FONT_DISPLAY, fontWeight: 400, textTransform: 'uppercase',
        letterSpacing: 'clamp(-1px, -0.4vw, -4px)', color: 'var(--ov-text)',
        lineHeight: 0.9,
      }}>
        <span className="hero-word" style={{ display: 'block', overflow: 'hidden', fontSize: 'clamp(56px, 13vw, 200px)' }}>
          <span style={{ display: 'inline-block' }}>Siddhartha</span>
        </span>
        <span className="hero-word" style={{ display: 'block', overflow: 'hidden', fontSize: 'clamp(24px, 5vw, 72px)', marginTop: '8px' }}>
          <span style={{ display: 'inline-block', color: TEAL, letterSpacing: 'clamp(2px, 0.5vw, 6px)' }}>Creative Designer</span>
        </span>
      </h1>

      <p ref={subRef} style={{
        fontFamily: FONT_BODY, maxWidth: '520px', marginTop: '36px',
        fontSize: 'clamp(14px, 1.2vw, 17px)', fontWeight: 300,
        color: 'rgba(215,225,255,0.62)', lineHeight: 1.65, letterSpacing: '0.2px',
      }}>
        <GlitchText text="Creative designer working across UI/UX, branding and web. Visually engaging, user-centred systems with clear structure — from low-fidelity wireframes to shipped interfaces." trigger="load" />
        {false && <>
        {' '}Visually engaging, user-centred systems with clear structure — from
        low-fidelity wireframes to shipped interfaces.
        </>}
      </p>

      <div ref={ctaRef} style={{ display: 'flex', gap: '14px', marginTop: '42px', flexWrap: 'wrap', alignItems: 'center' }}>
        <LiquidButton href="#work" variant="primary">Selected Work</LiquidButton>
        <LiquidButton href="#contact" variant="ghost">Get in Touch</LiquidButton>
      </div>

      <ScrollHint />
    </section>
  )
}

function ScrollHint() {
  const progress = usePortfolioStore(selectScrollProgress)
  return (
    <div style={{
      position: 'absolute', bottom: '44px', right: 'clamp(24px, 5vw, 96px)',
      display: 'flex', alignItems: 'center', gap: '12px',
      opacity: Math.max(0, 1 - progress * 6), transition: 'opacity 0.3s ease',
    }}>
      <span style={{ fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(215,225,255,0.4)' }}>Scroll</span>
      <div style={{ width: '1px', height: '44px', background: 'linear-gradient(to bottom, rgba(215,225,255,0.4), transparent)', animation: 'scrollPulse 2s ease-in-out infinite' }} />
    </div>
  )
}

// ─── About ────────────────────────────────────────────────────────────────────

function AboutSection() {
  const secRef = useRef<HTMLElement>(null!)
  useEffect(() => {
    if (!secRef.current) return
    const items = secRef.current.querySelectorAll('.about-fade')
    const t = ScrollTrigger.create({
      trigger: secRef.current, start: 'top 75%',
      onEnter: () => gsap.fromTo(items, { y: 28, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.04, duration: 0.5, ease: 'liquid' }),
    })
    return () => t.kill()
  }, [])

  return (
    <section id="about" ref={secRef} style={{
      padding: 'clamp(80px, 12vw, 160px) clamp(24px, 6vw, 96px)',
      position: 'relative', zIndex: 10,
      display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
      gap: 'clamp(36px, 6vw, 96px)', alignItems: 'start',
    }}>
      <div className="about-fade" style={{
        padding: 'clamp(24px, 3vw, 40px)', borderRadius: '14px',
        background: 'rgba(7,7,12,0.62)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(153,41,234,0.16)',
        boxShadow: '0 0 24px rgba(153,41,234,0.06), 0 8px 28px rgba(0,0,0,0.45)',
      }}>
        <div className="about-fade" style={{
          fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '2.5px',
          textTransform: 'uppercase', color: 'rgba(215,225,255,0.45)', marginBottom: '18px',
        }}>
          <span style={{ color: LAV }}>&#9632;</span>&nbsp;&nbsp;01 / Philosophy
        </div>
        <h2 className="about-fade" style={{
          fontFamily: FONT_DISPLAY, fontSize: 'clamp(36px, 6vw, 84px)',
          fontWeight: 400, textTransform: 'uppercase', letterSpacing: '-1px',
          color: 'var(--ov-text)', lineHeight: 0.95, marginBottom: '28px',
        }}>
          Design with<br />clarity &amp; intent.
        </h2>
        <p className="about-fade" style={{
          fontFamily: FONT_BODY, fontSize: 'clamp(14px, 1.1vw, 16px)', fontWeight: 300,
          color: 'rgba(215,225,255,0.65)', lineHeight: 1.75, maxWidth: '520px',
        }}>
          I build visual systems that feel deliberate. Clean structures, confident
          typography, calm surfaces — then just enough motion to make them feel
          alive. Every pixel earns its place.
        </p>
      </div>
      <ul style={{
        listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '20px',
        padding: 'clamp(24px, 3vw, 40px)', borderRadius: '14px',
        background: 'rgba(7,7,12,0.62)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(0,247,255,0.12)',
        boxShadow: '0 0 24px rgba(0,247,255,0.04), 0 8px 28px rgba(0,0,0,0.45)',
      }}>
        {PROFILE.highlights.map((h, i) => (
          <li key={i} className="about-fade" style={{
            display: 'grid', gridTemplateColumns: '42px 1fr', gap: '16px',
            paddingBottom: '20px', borderBottom: '1px solid rgba(215,225,255,0.06)',
          }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '2px', color: TEAL, paddingTop: '2px' }}>0{i + 1}</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: '14px', fontWeight: 400, color: 'rgba(215,225,255,0.82)', lineHeight: 1.6, letterSpacing: '0.2px' }}>{h}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ─── Work ─────────────────────────────────────────────────────────────────────

function ProjectRow({ index, datum }: { index: number; datum: typeof PROJECTS[0] }) {
  const rowRef     = useRef<HTMLDivElement>(null!)
  const setHovered = usePortfolioStore(s => s.setHoveredProject)
  const project    = usePortfolioStore(s => s.project)
  const setDetail  = usePortfolioStore(s => s.setDetailProject)
  const isHover    = project.hovered === index

  useEffect(() => {
    if (!rowRef.current) return
    const t = ScrollTrigger.create({
      trigger: rowRef.current, start: 'top 85%',
      onEnter: () => gsap.fromTo(rowRef.current,
        { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'liquid', delay: index * 0.03 }),
    })
    return () => t.kill()
  }, [index])

  return (
    <div
      ref={rowRef}
      className="project-row interactive"
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      onClick={() => setDetail(index)}
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(50px, 64px) minmax(0, 2fr) minmax(0, 1.3fr) minmax(0, 1.1fr)',
        alignItems: 'baseline', gap: 'clamp(16px, 3vw, 40px)',
        padding: 'clamp(22px, 3vw, 38px) 0',
        borderTop: '1px solid rgba(215,225,255,0.08)',
        cursor: 'pointer', position: 'relative',
        transition: 'color 0.3s ease',
      }}>
      <span style={{
        fontFamily: FONT_MONO, fontSize: '11px', letterSpacing: '2px',
        color: isHover ? datum.color : 'rgba(215,225,255,0.4)',
        transition: 'color 0.3s ease',
      }}>0{index + 1}</span>
      <h3 style={{
        fontFamily: FONT_DISPLAY, fontSize: 'clamp(30px, 4.5vw, 62px)',
        fontWeight: 400, letterSpacing: '-0.5px', lineHeight: 1,
        textTransform: 'uppercase',
        color: isHover ? 'var(--ov-text)' : 'rgba(215,225,255,0.88)',
        transition: 'color 0.3s ease',
      }}>
        <GlitchText text={datum.title} trigger="hover" />
      </h3>
      <p style={{
        fontFamily: FONT_BODY, fontSize: 'clamp(13px, 1vw, 15px)', fontWeight: 300,
        color: 'rgba(215,225,255,0.58)', lineHeight: 1.6, letterSpacing: '0.2px',
      }}>{datum.description}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(215,225,255,0.5)' }}>{datum.subtitle}</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: datum.color, opacity: 0.75 }}>{datum.tools}</span>
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: '1px',
        background: `linear-gradient(90deg, ${datum.color}, transparent)`,
        transform: `scaleX(${isHover ? 1 : 0})`, transformOrigin: 'left',
        transition: 'transform 0.5s cubic-bezier(0.2,0.9,0.35,1)',
      }} />
    </div>
  )
}

function ProjectGlareCard({ index, datum }: { index: number; datum: typeof PROJECTS[0] }) {
  const setDetail = usePortfolioStore(s => s.setDetailProject)

  return (
    <GlareCard
      className="project-glare-card interactive"
      glareColor={datum.color}
      intensity={0.92}
      tilt={8}
      ariaLabel={`View ${datum.title} project case study`}
      role="button"
      onClick={() => setDetail(index)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          setDetail(index)
        }
      }}
      style={{
        minHeight: 'clamp(300px, 31vw, 410px)',
        padding: 'clamp(24px, 3vw, 42px)',
        cursor: 'pointer',
      }}
    >
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '2px', color: datum.color }}>0{index + 1}</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: '9px', letterSpacing: '1.8px', color: 'rgba(215,225,255,0.46)', textTransform: 'uppercase', textAlign: 'right' }}>{datum.subtitle}</span>
        </div>
        <div>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 'clamp(42px, 5vw, 76px)', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '-1px', color: 'var(--ov-text)', lineHeight: .88, marginBottom: '20px' }}>
            {datum.title}
          </h3>
          <p style={{ fontFamily: FONT_BODY, maxWidth: '48ch', fontSize: 'clamp(13px, 1.05vw, 15px)', fontWeight: 300, color: 'rgba(215,225,255,.64)', lineHeight: 1.65 }}>
            {datum.description}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: '20px', borderTop: '1px solid rgba(255,255,255,.09)', paddingTop: '18px' }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '1.8px', color: datum.color, textTransform: 'uppercase' }}>{datum.tools}</span>
          <span aria-hidden="true" style={{ fontFamily: FONT_MONO, color: datum.color, fontSize: '18px', lineHeight: 1 }}>↗</span>
        </div>
      </div>
    </GlareCard>
  )
}

function WorkSection() {
  const h2Ref = useRef<HTMLHeadingElement>(null!)
  useEffect(() => {
    if (!h2Ref.current) return
    const t = ScrollTrigger.create({
      trigger: h2Ref.current, start: 'top 80%',
      onEnter: () => gsap.fromTo(h2Ref.current, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'liquid' }),
    })
    return () => t.kill()
  }, [])

  return (
    <section id="work" style={{ padding: 'clamp(80px, 12vw, 160px) clamp(24px, 6vw, 96px)', position: 'relative', zIndex: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'clamp(36px, 5vw, 64px)', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(215,225,255,0.45)', marginBottom: '14px' }}>
            <span style={{ color: TEAL }}>&#9632;</span>&nbsp;&nbsp;02 / Selected Work
          </div>
          <h2 ref={h2Ref} style={{ fontFamily: FONT_DISPLAY, fontSize: 'clamp(40px, 7vw, 96px)', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '-1.5px', color: 'var(--ov-text)', lineHeight: 0.92 }}>
            Projects<span style={{ color: LAV }}>.</span>
          </h2>
        </div>
        <span style={{ fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '2px', color: 'rgba(215,225,255,0.5)', textTransform: 'uppercase' }}>0{PROJECTS.length} / 0{PROJECTS.length}</span>
      </div>
      <div className="project-glare-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'clamp(18px, 2.5vw, 32px)',
      }}>
        {PROJECTS.map((p, i) => <ProjectGlareCard key={p.title} index={i} datum={p} />)}
      </div>
    </section>
  )
}

// ─── Design Highlights (marquee) ─────────────────────────────────────────────

function HighlightsSection() {
  const trackRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    if (!trackRef.current) return
    const tl = gsap.to(trackRef.current, {
      xPercent: -50,
      ease: 'none',
      duration: 28,
      repeat: -1,
    })
    return () => { tl.kill() }
  }, [])

  const doubled = [...PROJECTS, ...PROJECTS]

  return (
    <section style={{
      overflow: 'hidden',
      padding: 'clamp(48px, 8vw, 96px) 0',
      borderTop: '1px solid rgba(215,225,255,0.06)',
      borderBottom: '1px solid rgba(215,225,255,0.06)',
      position: 'relative', zIndex: 10,
    }}>
      <div style={{
        fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '2.5px',
        textTransform: 'uppercase', color: 'rgba(215,225,255,0.45)',
        paddingLeft: 'clamp(24px, 6vw, 96px)', marginBottom: '28px',
      }}>
        <span style={{ color: VIOLET }}>&#9632;</span>&nbsp;&nbsp;03 / Design Highlights
      </div>
      <div ref={trackRef} style={{ display: 'flex', gap: '64px', whiteSpace: 'nowrap', width: 'max-content', alignItems: 'center' }}>
        {doubled.map((p, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'baseline', gap: '18px',
            fontFamily: FONT_DISPLAY,
            fontSize: 'clamp(44px, 7vw, 86px)',
            textTransform: 'uppercase',
            letterSpacing: '-1px',
            color: p.color,
            opacity: 0.72,
          }}>
            {p.title}
            <span style={{
              fontFamily: FONT_MONO, fontSize: 'clamp(10px, 1vw, 13px)',
              color: 'rgba(215,225,255,0.22)', letterSpacing: '2px',
            }}>
              {p.tools.split('·')[0].trim()}
            </span>
          </span>
        ))}
      </div>
    </section>
  )
}

// ─── Toolkit ──────────────────────────────────────────────────────────────────

const TOOL_DESCRIPTIONS: Record<string, string> = {
  'UI / UX': 'Interface design', 'Website Design': 'Digital experiences', 'Logo & Branding': 'Identity systems',
  'Poster · Banner': 'Campaign visuals', 'Visual Systems': 'Design foundations', Figma: 'Design and prototype',
  Photoshop: 'Photo and image editing', Illustrator: 'Vector graphics', Lightroom: 'Photo finishing',
  Canva: 'Fast visual content', Framer: 'Interactive prototyping', HTML: 'Semantic structure',
  CSS: 'Visual styling', 'Responsive Design': 'Adaptive interfaces',
}

function ToolGlyph({ index, color }: { index: number; color: string }) {
  const symbols = ['◇', '◫', '⌁', '▱', '✦', '‹›']
  return <span className="toolkit-option__icon" style={{ color, borderColor: `${color}80` }} aria-hidden="true">{symbols[index % symbols.length]}</span>
}

function ToolkitSection() {
  const secRef = useRef<HTMLElement>(null!)
  const [selectedTool, setSelectedTool] = useState<number | null>(null)
  useEffect(() => {
    if (!secRef.current) return
    const items = secRef.current.querySelectorAll('.tool-fade')
    const t = ScrollTrigger.create({
      trigger: secRef.current, start: 'top 80%',
      onEnter: () => gsap.fromTo(items, { y: 22, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.03, duration: 0.45, ease: 'power3.out' }),
    })
    return () => t.kill()
  }, [])

  useEffect(() => {
    if (selectedTool === null) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedTool(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [selectedTool])

  const colors = [TEAL, LAV, AMBER]
  const selectedGroup = selectedTool === null ? null : SKILL_GROUPS[selectedTool]
  const selectedColor = selectedTool === null ? TEAL : colors[selectedTool % colors.length]

  return (
    <section id="toolkit" ref={secRef} style={{ padding: 'clamp(80px, 12vw, 160px) clamp(24px, 6vw, 96px)', position: 'relative', zIndex: 10 }}>
      <div className="tool-fade" style={{ fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(215,225,255,0.45)', marginBottom: '14px' }}>
        <span style={{ color: AMBER }}>&#9632;</span>&nbsp;&nbsp;04 / Toolkit
      </div>
      <h2 className="tool-fade" style={{ fontFamily: FONT_DISPLAY, fontSize: 'clamp(40px, 7vw, 96px)', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '-1.5px', color: 'var(--ov-text)', lineHeight: 0.92, marginBottom: 'clamp(36px, 5vw, 64px)' }}>
        What I use<span style={{ color: LAV }}>.</span>
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'clamp(16px, 2vw, 28px)' }}>
        {SKILL_GROUPS.map((group, gi) => {
          const col = colors[gi % 3]
          return (
            <GlareCard key={group.label} className="tool-fade toolkit-picker" glareColor={col} intensity={0.78} tabIndex={-1} ariaLabel={`${group.label} tools`} style={{ '--tool-accent': col, padding: 'clamp(16px, 2vw, 22px)', minHeight: '330px' } as React.CSSProperties}>
              <div className="toolkit-picker__heading">
                <span style={{ fontFamily: FONT_BODY, fontSize: '16px', fontWeight: 600, color: 'var(--ov-text)' }}>{group.label} tools</span>
                <span style={{ fontFamily: FONT_BODY, fontSize: '13px', color: 'rgba(215,225,255,.62)' }}>Selected tools I use</span>
              </div>
              <ul className="toolkit-picker__list" style={{ listStyle: 'none' }}>
                {group.items.map((it, itemIndex) => (
                  <li key={it} className="toolkit-option">
                    <ToolGlyph index={itemIndex + gi * 2} color={col} />
                    <span className="toolkit-option__copy"><strong>{it}</strong><small>{TOOL_DESCRIPTIONS[it] ?? 'Creative workflow'}</small></span>
                  </li>
                ))}
              </ul>
            </GlareCard>
          )
        })}
      </div>
      {selectedGroup && typeof document !== 'undefined' && createPortal(
        <div className="toolkit-dialog-backdrop" role="presentation" onMouseDown={() => setSelectedTool(null)}>
          <div className="toolkit-dialog" role="dialog" aria-modal="true" aria-label={`${selectedGroup.label} skills`} onMouseDown={(event) => event.stopPropagation()} style={{ '--tool-color': selectedColor } as React.CSSProperties}>
            <button className="toolkit-dialog__close" onClick={() => setSelectedTool(null)} aria-label="Close skill details">×</button>
            <div className="toolkit-dialog__waves" aria-hidden="true" />
            <GlareCard glareColor={selectedColor} intensity={.65} tilt={5} className="toolkit-dialog__card" style={{ padding: 'clamp(24px, 3vw, 36px)' }}>
              <div className="toolkit-dialog__preview" aria-hidden="true"><span /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ padding: '5px 10px', borderRadius: '999px', color: selectedColor, border: `1px solid ${selectedColor}70`, fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '1.4px' }}>{selectedGroup.label}</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: '10px', color: 'rgba(215,225,255,.44)', letterSpacing: '1.5px' }}>SELECTED TOOLKIT</span>
              </div>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 'clamp(38px, 5vw, 62px)', textTransform: 'uppercase', lineHeight: .9, color: 'var(--ov-text)', marginBottom: '14px' }}>{selectedGroup.label}</h3>
              <p style={{ fontFamily: FONT_BODY, fontSize: '15px', lineHeight: 1.65, color: 'rgba(215,225,255,.62)', marginBottom: '24px' }}>A focused set of tools and skills I use to turn ideas into clear, considered digital work.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px' }}>
                {selectedGroup.items.map((item) => <span key={item} style={{ color: 'rgba(232,238,255,.9)', background: `${selectedColor}16`, border: `1px solid ${selectedColor}45`, borderRadius: '999px', padding: '8px 11px', fontFamily: FONT_MONO, fontSize: '11px' }}>{item}</span>)}
              </div>
            </GlareCard>
          </div>
        </div>
      , document.body)}
    </section>
  )
}

// ─── Education ────────────────────────────────────────────────────────────────

function EducationSection() {
  const secRef = useRef<HTMLElement>(null!)
  useEffect(() => {
    if (!secRef.current) return
    const items = secRef.current.querySelectorAll('.edu-fade')
    const t = ScrollTrigger.create({
      trigger: secRef.current, start: 'top 80%',
      onEnter: () => gsap.fromTo(items, { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.04, duration: 0.5, ease: 'liquid' }),
    })
    return () => t.kill()
  }, [])

  const { school, degree, track, years, cgpa } = PROFILE.education

  return (
    <section id="education" ref={secRef} style={{
      padding: 'clamp(60px, 10vw, 140px) clamp(24px, 6vw, 96px)',
      position: 'relative', zIndex: 10,
      display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.3fr)',
      gap: 'clamp(36px, 6vw, 96px)', alignItems: 'start',
    }}>
      <div>
        <div className="edu-fade" style={{ fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(215,225,255,0.45)', marginBottom: '14px' }}>
          <span style={{ color: TEAL }}>&#9632;</span>&nbsp;&nbsp;05 / Education
        </div>
        <h2 className="edu-fade" style={{ fontFamily: FONT_DISPLAY, fontSize: 'clamp(30px, 5vw, 72px)', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '-1px', color: 'var(--ov-text)', lineHeight: 0.95 }}>
          Academic<br />foundation.
        </h2>
      </div>
      <div className="edu-fade" style={{ padding: '32px', borderRadius: '14px', background: 'rgba(7,7,12,0.55)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: `1px solid rgba(153,41,234,0.16)`, boxShadow: '0 0 22px rgba(153,41,234,0.06), 0 8px 24px rgba(0,0,0,0.4)' }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: LAV, marginBottom: '14px' }}>{years}</div>
        <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 'clamp(22px, 2.5vw, 34px)', fontWeight: 400, letterSpacing: '-0.5px', textTransform: 'uppercase', color: 'var(--ov-text)', marginBottom: '12px', lineHeight: 1.1 }}>{school}</h3>
        <p style={{ fontFamily: FONT_BODY, fontSize: '15px', fontWeight: 400, color: 'rgba(215,225,255,0.75)', lineHeight: 1.6, marginBottom: '22px' }}>{degree}</p>
        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', paddingTop: '20px', borderTop: '1px solid rgba(215,225,255,0.08)' }}>
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '2px', color: 'rgba(215,225,255,0.45)', textTransform: 'uppercase' }}>CGPA</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: '24px', color: 'var(--ov-text)', letterSpacing: '0.5px', marginTop: '4px' }}>{cgpa}</div>
          </div>
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '2px', color: 'rgba(215,225,255,0.45)', textTransform: 'uppercase' }}>Coursework</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: '13px', color: 'rgba(215,225,255,0.75)', marginTop: '4px', maxWidth: '280px' }}>
              Data Structures · Databases · Web Dev · OOP/Java · Networks
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Contact ─────────────────────────────────────────────────────────────────

function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null!)
  useEffect(() => {
    const t = ScrollTrigger.create({
      trigger: sectionRef.current, start: 'top 75%',
      onEnter: () => gsap.fromTo(
        sectionRef.current.querySelectorAll('.contact-animate'),
        { y: 32, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.55, ease: 'liquid' }
      ),
    })
    return () => t.kill()
  }, [])

  return (
    <section id="contact" ref={sectionRef} style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: 'clamp(80px, 12vw, 160px) clamp(24px, 6vw, 96px)', position: 'relative', zIndex: 10 }}>
      <div className="contact-animate" style={{ fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(215,225,255,0.45)', marginBottom: '14px' }}>
        <span style={{ color: AMBER }}>&#9632;</span>&nbsp;&nbsp;06 / Contact
      </div>
      <h2 className="contact-animate" style={{ fontFamily: FONT_DISPLAY, fontSize: 'clamp(48px, 9vw, 140px)', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '-2px', color: 'var(--ov-text)', lineHeight: 0.88, marginBottom: '32px', maxWidth: '1200px' }}>
        Let&rsquo;s build<br />
        <span style={{ background: `linear-gradient(90deg, ${TEAL}, ${VIOLET}, ${LAV})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          something real.
        </span>
      </h2>
      <div className="contact-animate" style={{
        padding: 'clamp(24px, 3vw, 40px)', borderRadius: '14px',
        background: 'rgba(7,7,12,0.62)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,0,135,0.14)',
        boxShadow: '0 0 24px rgba(255,0,135,0.05), 0 8px 28px rgba(0,0,0,0.45)',
        display: 'flex', flexDirection: 'column', gap: '0', maxWidth: '680px', width: '100%',
      }}>
        <p style={{ fontFamily: FONT_BODY, fontSize: 'clamp(14px, 1.15vw, 17px)', fontWeight: 300, color: 'rgba(215,225,255,0.62)', lineHeight: 1.7, marginBottom: '32px' }}>
          Currently open to design internships and freelance collaborations — branding,
          UI/UX and web projects. Write if you&rsquo;d like to work together.
        </p>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <LiquidButton href={`mailto:${PROFILE.email}`} variant="primary" external>{PROFILE.email}</LiquidButton>
          <LiquidButton href={PROFILE.linkedin} variant="ghost" external>LinkedIn</LiquidButton>
          <LiquidButton href={PROFILE.github} variant="ghost" external>GitHub</LiquidButton>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '24px', paddingTop: '24px', borderTop: '1px solid rgba(215,225,255,0.08)' }}>
          {[
            { label: 'Phone', value: PROFILE.phone },
            { label: 'Location', value: PROFILE.location },
            { label: 'Status', value: 'Open to internships' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(215,225,255,0.4)', marginBottom: '6px' }}>{item.label}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: '14px', fontWeight: 400, color: 'rgba(215,225,255,0.85)', letterSpacing: '0.2px' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'clamp(24px, 4vw, 44px) clamp(24px, 6vw, 96px)', color: 'rgba(215,225,255,0.3)', fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', borderTop: '1px solid rgba(215,225,255,0.06)', position: 'relative', zIndex: 10 }}>
      <span>&copy; 2026 {PROFILE.short}</span>
      <span>Crafted with care &mdash; India</span>
    </footer>
  )
}

// ─── Scroll progress (horizontal + vertical) ──────────────────────────────────

function ScrollProgressBar() {
  const progress = usePortfolioStore(selectScrollProgress)
  // Vertical indicator spring
  const springProgress = useSpring(progress, { stiffness: 80, damping: 20 })
  const nodeTop = useTransform(springProgress, [0, 1], ['0%', '100%'])

  return (
    <>
      {/* Horizontal top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: `${progress * 100}%`, height: '1px',
        background: `linear-gradient(90deg, ${TEAL}, ${VIOLET}, ${LAV})`,
        boxShadow: `0 0 8px rgba(0,247,255,0.8), 0 0 18px rgba(0,247,255,0.3)`,
        zIndex: 2000, transition: 'width 0.05s linear',
      }} />

      {/* Vertical right-edge indicator */}
      <div style={{
        position: 'fixed', right: '20px', top: '50%', transform: 'translateY(-50%)',
        width: '2px', height: '120px', background: 'rgba(255,255,255,0.12)',
        zIndex: 800, borderRadius: '1px',
      }}>
        <motion.div style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          width: '8px', height: '8px', borderRadius: '50%',
          background: TEAL,
          boxShadow: `0 0 8px ${TEAL}`,
          top: nodeTop,
          translateY: '-50%',
        }} />
      </div>
    </>
  )
}

function ScrollSyncer() {
  const setProgress = usePortfolioStore(s => s.setScrollProgress)
  const setVelocity = usePortfolioStore(s => s.setScrollVelocity)
  const setRaw      = usePortfolioStore(s => s.setScrollRaw)

  useEffect(() => {
    if (typeof window === 'undefined') return
    let lastScrollY = window.scrollY, lastTime = performance.now()
    const onScroll = () => {
      const now = performance.now(), dt = Math.max(now - lastTime, 1)
      // prefer lenis.scroll if available, else window.scrollY
      const scrollY = usePortfolioStore.getState().lenis?.scroll ?? window.scrollY
      const maxScroll = document.body.scrollHeight - window.innerHeight
      setRaw(scrollY)
      setProgress(maxScroll > 0 ? scrollY / maxScroll : 0)
      setVelocity((scrollY - lastScrollY) / dt * 16)
      lastScrollY = scrollY; lastTime = now
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [setProgress, setVelocity, setRaw])

  return null
}

// ─── Globals ─────────────────────────────────────────────────────────────────

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ov-text: #E8EEFF;
    --ov-text-secondary: rgba(215,225,255,0.62);
    --ov-bg: #000000;
  }
  body.light-mode {
    --ov-text: #F0F4FF;
    --ov-text-secondary: rgba(200,215,255,0.75);
    --ov-bg: #1A0F2E;
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--ov-bg); color: var(--ov-text); overflow-x: hidden;
    font-family: ${FONT_BODY}; font-size: 15px;
  }
  a, button, .btn, .project-row, .nav-link { cursor: pointer; }

  /* ── Glow utilities ── */
  .neon-glow {
    box-shadow: 0 0 20px rgba(0,247,255,0.3), 0 0 60px rgba(0,247,255,0.1), inset 0 0 20px rgba(0,247,255,0.05);
  }
  .text-glow {
    text-shadow: 0 0 20px rgba(0,247,255,0.5), 0 0 40px rgba(0,247,255,0.25);
  }
  .border-glow {
    border-color: rgba(0,247,255,0.4) !important;
    box-shadow: 0 0 15px rgba(0,247,255,0.2), inset 0 0 15px rgba(0,247,255,0.05);
  }

  /* ── Animations ── */
  @keyframes scrollPulse {
    0%, 100% { opacity: 0.5; transform: scaleY(1); }
    50%      { opacity: 1.0; transform: scaleY(1.15); }
  }
  @keyframes lightSweep {
    0%   { transform: translateX(-100%) skewX(-15deg); opacity: 0; }
    20%  { opacity: 1; }
    100% { transform: translateX(350%) skewX(-15deg); opacity: 0; }
  }
  @keyframes neonPulse {
    0%, 100% { box-shadow: 0 0 18px rgba(0,247,255,0.14), 0 8px 28px rgba(0,0,0,0.45); }
    50%      { box-shadow: 0 0 32px rgba(0,247,255,0.26), 0 0 55px rgba(255,0,135,0.1), 0 8px 28px rgba(0,0,0,0.4); }
  }
  @keyframes heroGlow {
    0%, 100% { filter: drop-shadow(0 0 22px rgba(0,247,255,0.13)) drop-shadow(0 0 55px rgba(0,247,255,0.05)); }
    50%      { filter: drop-shadow(0 0 32px rgba(255,0,135,0.18)) drop-shadow(0 0 65px rgba(0,247,255,0.07)); }
  }
  @keyframes blobDrift {
    0%, 100% { transform: translate(0,0) scale(1); }
    40%      { transform: translate(40px,-25px) scale(1.1); }
    70%      { transform: translate(-25px,20px) scale(0.95); }
  }

  /* ── Noise overlay ── */
  body::before {
    content: ''; position: fixed; inset: 0;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    opacity: 0.22; pointer-events: none; z-index: 5000; mix-blend-mode: overlay;
  }

  /* ── Hero ambient blob ── */
  #hero { isolation: isolate; }
  #hero::before {
    content: ''; position: absolute;
    top: 15%; left: -15%; width: 60vw; height: 60vw;
    background: radial-gradient(ellipse, rgba(0,247,255,0.055) 0%, rgba(255,0,135,0.035) 50%, transparent 70%);
    border-radius: 50%; pointer-events: none; z-index: -1;
    animation: blobDrift 14s ease-in-out infinite;
    filter: blur(55px);
  }
  #hero h1 { animation: heroGlow 7s ease-in-out infinite; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 2px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,247,255,0.35); border-radius: 1px; }

  /* ── Nav links ── */
  .nav-link {
    position: relative;
    transition: color 0.35s cubic-bezier(0.2,0.9,0.35,1), text-shadow 0.35s ease !important;
  }
  .nav-link::after {
    content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, #1CE0C4, #B872FF);
    box-shadow: 0 0 8px rgba(0,247,255,0.9);
    transform: scaleX(0); transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.2,0.9,0.35,1);
  }
  .nav-link:hover { color: #1CE0C4 !important; text-shadow: 0 0 12px rgba(0,247,255,0.6) !important; }
  .nav-link:hover::after { transform: scaleX(1); }

  /* ── Liquid glass buttons ── */
  .btn {
    position: relative; overflow: hidden;
    transition: transform 0.35s cubic-bezier(0.2,0.9,0.35,1),
                box-shadow 0.35s ease, border-color 0.35s ease !important;
  }
  .btn::after {
    content: ''; position: absolute; top: 0; left: 0;
    width: 45%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transform: translateX(-100%) skewX(-15deg); pointer-events: none;
  }
  .btn:hover { transform: scale(1.04) translateY(-1px) !important; }
  .btn:hover::after { animation: lightSweep 0.55s ease forwards; }
  .btn:hover {
    box-shadow: 0 0 25px rgba(0,247,255,0.22), 0 0 55px rgba(0,247,255,0.08),
                inset 0 0 18px rgba(0,247,255,0.06) !important;
    border-color: rgba(0,247,255,0.5) !important;
  }

  /* ── Pill nav ── */
  .pill-nav {
    transition: box-shadow 0.4s ease, border-color 0.4s ease !important;
    animation: neonPulse 5s ease-in-out infinite;
  }
  .pill-nav:hover { border-color: rgba(0,247,255,0.22) !important; }

  /* ── Logo mark ── */
  .logo-mark { transition: filter 0.35s ease; }
  .logo-mark:hover { filter: drop-shadow(0 0 10px rgba(0,247,255,0.5)); }

  /* ── Project rows ── */
  .project-row { transition: background 0.35s ease !important; }
  .project-row:hover { background: rgba(0,247,255,0.018) !important; }
  @media (max-width: 760px) { .project-glare-grid { grid-template-columns: 1fr !important; } }
`

function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = GLOBAL_CSS
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])
  return null
}

function ThemeSync() {
  const isDark = usePortfolioStore(s => s.theme.isDark)
  useEffect(() => {
    isDark ? document.body.classList.remove('light-mode') : document.body.classList.add('light-mode')
  }, [isDark])
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem('theme') === 'light') usePortfolioStore.getState().toggleTheme()
  }, [])
  return null
}

export default function Overlay() {
  return (
    <>
      <GlobalStyles />
      <ThemeSync />
      <ScrollSyncer />
      <MouseTracker />
      <ScrollProgressBar />
      <LogoMark />
      <PillNav />
      <ProjectDetail />
      <main style={{ position: 'relative', zIndex: 10 }}>
        <HeroSection />
        <AboutSection />
        <WorkSection />
        <HighlightsSection />
        <ToolkitSection />
        <EducationSection />
        <ContactSection />
        <Footer />
      </main>
    </>
  )
}
