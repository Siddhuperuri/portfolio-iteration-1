import type Lenis from '@studio-freight/lenis'

let instance: Lenis | null = null

export function setLenis(next: Lenis | null) {
  instance = next
}

export function scrollToTop() {
  if (instance) {
    instance.scrollTo(0, { duration: 1.2 })
    return
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
}

export function jumpToTop() {
  if (instance) instance.scrollTo(0, { immediate: true })
  else window.scrollTo(0, 0)
}
