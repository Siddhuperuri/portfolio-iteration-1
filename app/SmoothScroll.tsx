'use client'

import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePortfolioStore, type LenisInstance } from './store'

export default function SmoothScroll({ locked }: { locked: boolean }) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Visitors who ask for less motion keep native scrolling.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    const instance = lenis as unknown as LenisInstance

    usePortfolioStore.getState().setLenis(instance)
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

  // Loading screen and modals hold the page still. Lenis handles wheel and
  // touch itself, so overflow:hidden alone would not stop it.
  const lenis = usePortfolioStore(s => s.lenis)
  const detailOpen = usePortfolioStore(s => s.detailProject !== null)
  const hold = locked || detailOpen
  useEffect(() => {
    if (!lenis) return
    if (hold) lenis.stop()
    else lenis.start()
  }, [lenis, hold])

  return null
}
