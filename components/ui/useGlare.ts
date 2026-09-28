'use client'

import { useCallback, useEffect, useRef } from 'react'

type GlareOptions = {
  disabled?: boolean
  intensity?: number
  tilt?: number
}

const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount

/** Imperative pointer animation: CSS variables change, React never re-renders. */
export function useGlare({ disabled = false, intensity = 1, tilt = 8 }: GlareOptions = {}) {
  const elementRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number>()
  const activeRef = useRef(false)
  const values = useRef({ x: 50, y: 50, targetX: 50, targetY: 50, speed: 0, targetSpeed: 0 })

  const paint = useCallback(() => {
    const card = elementRef.current
    if (!card) return
    const value = values.current
    value.x = lerp(value.x, value.targetX, 0.08)
    value.y = lerp(value.y, value.targetY, 0.08)
    value.speed = lerp(value.speed, value.targetSpeed, 0.08)
    value.targetSpeed = lerp(value.targetSpeed, 0, 0.12)

    const rotateX = -(value.y - 50) * (tilt / 50)
    const rotateY = (value.x - 50) * (tilt / 50)
    const settled = Math.abs(value.x - value.targetX) < 0.05 && Math.abs(value.y - value.targetY) < 0.05 && value.speed < 0.02

    card.style.setProperty('--mouse-x', `${value.x}%`)
    card.style.setProperty('--mouse-y', `${value.y}%`)
    card.style.setProperty('--rotate-x', `${rotateX}deg`)
    card.style.setProperty('--rotate-y', `${rotateY}deg`)
    card.style.setProperty('--glare-scale-x', `${1 + Math.min(value.speed * 0.018, 0.32)}`)

    if (activeRef.current || !settled) frameRef.current = requestAnimationFrame(paint)
    else frameRef.current = undefined
  }, [tilt])

  const start = useCallback(() => {
    if (disabled || frameRef.current) return
    frameRef.current = requestAnimationFrame(paint)
  }, [disabled, paint])

  useEffect(() => () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
  }, [])

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    const card = elementRef.current
    if (!card) return
    const bounds = card.getBoundingClientRect()
    const nextX = ((event.clientX - bounds.left) / bounds.width) * 100
    const nextY = ((event.clientY - bounds.top) / bounds.height) * 100
    const value = values.current
    value.targetSpeed = Math.hypot(nextX - value.targetX, nextY - value.targetY)
    value.targetX = Math.max(0, Math.min(100, nextX))
    value.targetY = Math.max(0, Math.min(100, nextY))
    start()
  }, [disabled, start])

  const setActive = useCallback((active: boolean) => {
    if (disabled) return
    activeRef.current = active
    const card = elementRef.current
    card?.setAttribute('data-glare-active', String(active))
    card?.style.setProperty('--glare-opacity', active ? `${0.7 * intensity}` : '0')
    card?.style.setProperty('--glow-opacity', active ? `${0.8 * intensity}` : '0.28')
    if (!active) {
      values.current.targetX = 50
      values.current.targetY = 50
    }
    start()
  }, [disabled, intensity, start])

  return {
    elementRef,
    onPointerMove,
    onPointerEnter: () => setActive(true),
    onPointerLeave: () => setActive(false),
    onFocus: () => setActive(true),
    onBlur: () => setActive(false),
  }
}
