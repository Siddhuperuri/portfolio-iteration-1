'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { ALL_TAGS, PROJECTS } from '@/content/projects'
import { Arrow } from '@/components/Arrow'

export function WorkExplorer() {
  const [tag, setTag] = useState('All')

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('tag')
    if (fromUrl && ALL_TAGS.includes(fromUrl)) setTag(fromUrl)
  }, [])

  const choose = useCallback((next: string) => {
    setTag(next)
    const url = new URL(window.location.href)
    if (next === 'All') url.searchParams.delete('tag')
    else url.searchParams.set('tag', next)
    window.history.replaceState(null, '', url)
  }, [])

  const shown = tag === 'All' ? PROJECTS : PROJECTS.filter(p => p.tags.includes(tag))

  return (
    <>
      <div className="filters" role="group" aria-label="Filter projects by discipline">
        {ALL_TAGS.map(t => (
          <button
            key={t}
            type="button"
            className="filter"
            aria-pressed={tag === t}
            onClick={() => choose(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        Showing {shown.length} {shown.length === 1 ? 'project' : 'projects'}
        {tag === 'All' ? '' : ` in ${tag}`}
      </p>

      {shown.length === 0 ? (
        <p className="empty">No projects under that heading yet.</p>
      ) : (
        <ul className="rows">
          {shown.map(p => (
            <li key={p.slug}>
              <Link
                href={`/work/${p.slug}`}
                className="row"
                style={{ '--bg': p.bg, '--fg': p.fg } as CSSProperties}
              >
                <div>
                  <h2>{p.title}</h2>
                  <p className="row__kind">{p.kind}</p>
                </div>
                <div className="row__tags">
                  {p.tags.map(t => (
                    <span className="chip" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
                <span className="row__arrow">
                  <Arrow size={22} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
