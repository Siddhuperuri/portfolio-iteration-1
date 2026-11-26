'use client'

import { useEffect, useState } from 'react'

export function LegalRail({ items }: { items: { id: string; title: string }[] }) {
  const [active, setActive] = useState(items[0]?.id)

  useEffect(() => {
    const els = items
      .map(i => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null)
    const io = new IntersectionObserver(
      entries => {
        const hit = entries.find(e => e.isIntersecting)
        if (hit) setActive(hit.target.id)
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [items])

  return (
    <aside className="legal-rail">
      <p id="rail-title">On this page</p>
      <nav aria-labelledby="rail-title">
        {items.map(i => (
          <a key={i.id} href={`#${i.id}`} aria-current={active === i.id ? 'true' : undefined}>
            {i.title}
          </a>
        ))}
      </nav>
    </aside>
  )
}
