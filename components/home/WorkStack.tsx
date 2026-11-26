import Link from 'next/link'
import type { CSSProperties } from 'react'
import { FEATURED } from '@/content/projects'
import { Arrow } from '@/components/Arrow'

export function WorkStack() {
  return (
    <section className="section" id="work" aria-labelledby="work-title">
      <div className="wrap">
        <div className="section-head">
          <h2 id="work-title">Selected work</h2>
          <Link href="/work" className="link">
            See all projects <Arrow size={18} />
          </Link>
        </div>
        <ul className="stack">
          {FEATURED.map((p, i) => (
            <li
              key={p.slug}
              className="panel"
              style={
                {
                  '--bg': p.bg,
                  '--fg': p.fg,
                  '--accent': p.accent,
                  '--i': i,
                  zIndex: i + 1,
                } as CSSProperties
              }
            >
              <div className="panel__body">
                <div>
                  <h3>{p.title}</h3>
                  <p className="panel__kind">{p.kind}</p>
                </div>
                <div>
                  <p className="panel__summary">{p.summary}</p>
                  <div className="panel__meta">
                    {p.tags.map(t => (
                      <span className="chip" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <Link href={`/work/${p.slug}`} className="panel__go stretch">
                  Read the case study <Arrow size={20} />
                  <span className="sr-only"> for {p.title}</span>
                </Link>
              </div>
              <div className="panel__art" aria-hidden="true">
                <b>{p.title.charAt(0)}</b>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
