'use client'

import { useState, useRef, useCallback } from 'react'

const FONT_MONO = `'JetBrains Mono', monospace`

export default function AudioToggle() {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const rampRef  = useRef<ReturnType<typeof setInterval> | null>(null)

  const fadeVolume = useCallback((from: number, to: number, onDone?: () => void) => {
    if (rampRef.current) clearInterval(rampRef.current)
    const steps    = 24
    const stepTime = 1200 / steps
    let step = 0
    rampRef.current = setInterval(() => {
      step++
      if (audioRef.current) {
        audioRef.current.volume = Math.max(0, Math.min(0.18, from + (to - from) * (step / steps)))
      }
      if (step >= steps) {
        if (rampRef.current) clearInterval(rampRef.current)
        onDone?.()
      }
    }, stepTime)
  }, [])

  const toggle = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/audio/ambient.mp3')
      audioRef.current.loop = true
      audioRef.current.volume = 0
    }
    if (playing) {
      fadeVolume(0.18, 0, () => audioRef.current?.pause())
      setPlaying(false)
    } else {
      audioRef.current.play().catch(() => {})
      fadeVolume(0, 0.18)
      setPlaying(true)
    }
  }, [playing, fadeVolume])

  return (
    <button
      onClick={toggle}
      aria-label={playing ? 'Mute ambient audio' : 'Play ambient audio'}
      title={playing ? 'Mute' : 'Ambient'}
      style={{
        position: 'fixed', bottom: '32px', right: 'clamp(20px, 3vw, 44px)',
        zIndex: 900, width: '48px', height: '48px', borderRadius: '50%',
        background: 'rgba(7,7,12,0.7)', backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid rgba(${playing ? '28,224,196' : '255,255,255'},0.2)`,
        color: playing ? '#1CE0C4' : 'rgba(215,225,255,0.45)',
        fontFamily: FONT_MONO, fontSize: '16px',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
        boxShadow: playing ? '0 0 18px rgba(28,224,196,0.25)' : 'none',
      }}>
      {playing ? '♪' : '✕'}
    </button>
  )
}
