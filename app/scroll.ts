import { usePortfolioStore } from './store'

// Routes in-page navigation through Lenis when it is running, and falls back
// to the browser's own smooth scroll when it is not (reduced motion, SSR).
export function scrollToTarget(target: string | number) {
  if (typeof window === 'undefined') return
  const lenis = usePortfolioStore.getState().lenis
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.4 })
    return
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const behavior: ScrollBehavior = reduce ? 'auto' : 'smooth'
  if (typeof target === 'number') window.scrollTo({ top: target, behavior })
  else document.querySelector(target)?.scrollIntoView({ behavior, block: 'start' })
}
