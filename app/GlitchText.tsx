'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const GLITCH_CHARS  = '!@#$%^&*<>/\\|~'
const FRAME_INTERVAL = 24
const FRAME_COUNT    = 5

interface GlitchTextProps {
  text: string
  trigger: 'hover' | 'scroll' | 'load'
  className?: string
  style?: React.CSSProperties
}

export default function GlitchText({ text, trigger, className, style }: GlitchTextProps) {
  const [displayed, setDisplayed] = useState(text)
  const frameRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRef = useRef(false)
  const spanRef   = useRef<HTMLSpanElement>(null!)

  const glitch = useCallback(() => {
    if (activeRef.current) return
    activeRef.current = true

    if (spanRef.current) {
      spanRef.current.style.textShadow = '2px 0 #B872FF, -2px 0 #1CE0C4'
      setTimeout(() => {
        if (spanRef.current) spanRef.current.style.textShadow = ''
      }, 80)
    }

    let frame = 0
    const totalFrames = FRAME_COUNT

    const run = () => {
      frame++
      if (frame >= totalFrames) {
        setDisplayed(text)
        activeRef.current = false
        return
      }
      setDisplayed(
        text.split('').map((ch, i) => {
          if (ch === ' ') return ' '
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        }).join('')
      )
      frameRef.current = setTimeout(run, FRAME_INTERVAL)
    }
    run()
  }, [text])

  useEffect(() => {
    if (trigger === 'load') {
      const t = setTimeout(glitch, 120)
      return () => clearTimeout(t)
    }
  }, [trigger, glitch])

  useEffect(() => () => { if (frameRef.current) clearTimeout(frameRef.current) }, [])

  const baseStyle: React.CSSProperties = {
    display: 'inline',
    transition: 'text-shadow 0.08s ease',
    ...style,
  }

  if (trigger === 'hover') {
    return (
      <span
        ref={spanRef}
        className={className}
        onMouseEnter={glitch}
        style={baseStyle}
      >
        {displayed}
      </span>
    )
  }

  return (
    <span ref={spanRef} className={className} style={baseStyle}>
      {displayed}
    </span>
  )
}
