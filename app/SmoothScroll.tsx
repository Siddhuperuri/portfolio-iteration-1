'use client'

import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePortfolioStore } from './store'

export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    usePortfolioStore.getState().setLenis(lenis as any)

    // Keep ScrollTrigger in sync with Lenis — do NOT use normalizeScroll with Lenis
    lenis.on('scroll', () => ScrollTrigger.update())

    const ticker = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(ticker)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(ticker)
      lenis.destroy()
      usePortfolioStore.getState().setLenis(null)
    }
  }, [])

  return null
}
