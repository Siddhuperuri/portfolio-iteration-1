'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const outerRef = useRef<HTMLDivElement>(null!)
  const dotRef   = useRef<HTMLDivElement>(null!)
  const pos      = useRef({ x: -100, y: -100 })
  const target   = useRef({ x: -100, y: -100 })
  const rafRef   = useRef<number>()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const onMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY }
    }

    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest(
        'a, button, [role="button"], .interactive, .project-row, .nav-link, .btn'
      )
      if (!outerRef.current) return
      if (el) {
        outerRef.current.style.transform = 'translate(-50%, -50%) scale(2.4)'
        outerRef.current.style.borderColor = '#B872FF'
      } else {
        outerRef.current.style.transform = 'translate(-50%, -50%) scale(1)'
        outerRef.current.style.borderColor = '#1CE0C4'
      }
    }

    const onCursorExpand = (e: Event) => {
      const ce = e as CustomEvent
      const expand = ce.detail?.expand ?? true
      if (!outerRef.current) return
      outerRef.current.style.transform = expand
        ? 'translate(-50%, -50%) scale(2.4)'
        : 'translate(-50%, -50%) scale(1)'
      outerRef.current.style.borderColor = expand ? '#B872FF' : '#1CE0C4'
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseover', onOver)
    window.addEventListener('cursorExpand', onCursorExpand)

    const animate = () => {
      const LERP = 0.12
      pos.current.x += (target.current.x - pos.current.x) * LERP
      pos.current.y += (target.current.y - pos.current.y) * LERP
      if (outerRef.current) {
        outerRef.current.style.left = `${pos.current.x}px`
        outerRef.current.style.top  = `${pos.current.y}px`
      }
      if (dotRef.current) {
        dotRef.current.style.left = `${target.current.x}px`
        dotRef.current.style.top  = `${target.current.y}px`
      }
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('cursorExpand', onCursorExpand)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <>
      <div ref={outerRef} style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 99998,
        width: '24px', height: '24px', borderRadius: '50%',
        border: '1px solid #1CE0C4',
        transform: 'translate(-50%, -50%)',
        mixBlendMode: 'difference',
        transition: 'transform 0.25s cubic-bezier(0.2,0.9,0.35,1), border-color 0.25s ease',
        top: '-100px', left: '-100px',
      }} />
      <div ref={dotRef} style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 99999,
        width: '4px', height: '4px', borderRadius: '50%',
        background: '#1CE0C4',
        transform: 'translate(-50%, -50%)',
        top: '-100px', left: '-100px',
      }} />
    </>
  )
}
