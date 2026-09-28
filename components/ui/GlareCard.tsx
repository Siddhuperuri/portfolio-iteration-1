'use client'

import type { HTMLAttributes, ReactNode } from 'react'
import { useGlare } from './useGlare'

export type GlareCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  glareColor?: string
  tilt?: number
  glow?: boolean
  intensity?: number
  ariaLabel?: string
}

export function GlareCard({
  children,
  glareColor = '#ffffff',
  tilt = 8,
  glow = true,
  intensity = 1,
  className = '',
  style,
  ariaLabel,
  ...props
}: GlareCardProps) {
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const glare = useGlare({ disabled: reducedMotion, intensity, tilt })

  return (
    <div
      {...props}
      {...glare}
      ref={glare.elementRef}
      className={`glare-card ${className}`}
      tabIndex={props.tabIndex ?? 0}
      aria-label={ariaLabel}
      style={{
        '--glare-color': glareColor,
        '--glare-opacity': 0,
        '--glow-opacity': glow ? 0.28 : 0,
        ...style,
      } as React.CSSProperties}
    >
      {glow && <div className="glare-card__ambient-glow" aria-hidden="true" />}
      <div className="glare-card__glare" aria-hidden="true" />
      <div className="glare-card__border-highlight" aria-hidden="true" />
      <div className="glare-card__content">{children}</div>
    </div>
  )
}
