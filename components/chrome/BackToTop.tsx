'use client'

import { scrollToTop } from '@/lib/lenis'

export function BackToTop() {
  return (
    <button type="button" onClick={scrollToTop}>
      Back to top <span aria-hidden="true">&nbsp;&uarr;</span>
    </button>
  )
}
