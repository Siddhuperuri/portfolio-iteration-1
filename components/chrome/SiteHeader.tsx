'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV, SITE } from '@/content/site'

export function SiteHeader() {
  const pathname = usePathname()
  const header = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => {
      if (header.current) header.current.dataset.stuck = String(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header ref={header} className="site-header">
      <div className="wrap">
        <Link href="/" className="wordmark" aria-label={`${SITE.short}, home`}>
          Siddhartha<span>.</span>
        </Link>
        <nav className="nav" aria-label="Main">
          {NAV.map(item => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined}>
                {item.label}
              </Link>
            )
          })}
          <a className="btn btn--accent" href={`mailto:${SITE.email}`}>
            Email me
          </a>
        </nav>
      </div>
    </header>
  )
}
