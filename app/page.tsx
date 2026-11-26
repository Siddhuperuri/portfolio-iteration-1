import Link from 'next/link'
import type { CSSProperties } from 'react'
import { FEATURED } from '@/content/projects'
import { SITE, SKILL_GROUPS } from '@/content/site'
import { Arrow } from '@/components/Arrow'
import { Reveal } from '@/components/chrome/Reveal'
import { WorkStack } from '@/components/home/WorkStack'

const TILTS = [-1.6, 1.2, -0.8, 1.8]

export default function HomePage() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="wrap">
          <h1 id="hero-title">
            <span className="line">
              <span>I design it.</span>
            </span>
            <span className="line">
              <span>Then I build it.</span>
            </span>
          </h1>

          <div className="hero__row">
            <p className="hero__lede">
              {SITE.short} Peruri, a creative designer working across UI/UX, branding and websites.
            </p>
            <div className="hero__actions">
              <Link className="btn" href="/work">
                See the work <Arrow size={18} />
              </Link>
              <Link className="btn btn--ghost" href="/contact">
                Get in touch
              </Link>
            </div>
          </div>

          <ul className="covers" aria-label="Featured projects">
            {FEATURED.map((p, i) => (
              <li key={p.slug}>
                <Link
                  href={`/work/${p.slug}`}
                  className="cover"
                  style={
                    {
                      '--bg': p.bg,
                      '--fg': p.fg,
                      '--accent': p.accent,
                      '--tilt': `${TILTS[i % TILTS.length]}deg`,
                    } as CSSProperties
                  }
                >
                  <span className="cover__mark" aria-hidden="true">
                    {p.title.charAt(0)}
                  </span>
                  <span className="cover__title">{p.title}</span>
                  <span className="cover__kind">{p.kind}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <WorkStack />

      <section className="section statement" aria-label="Approach">
        <div className="wrap">
          <Reveal>
            <p>
              I design visual systems with clean structure, confident typography and calm surfaces,
              then add <em>only as much motion</em> as it takes to make them feel alive.
            </p>
            <Link href="/about" className="link">
              More about me <Arrow size={18} />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="skills-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="skills-title">What I use</h2>
          </div>
          <Reveal>
            <div className="skills">
              {SKILL_GROUPS.map(g => (
                <div key={g.label}>
                  <h3>{g.label}</h3>
                  <ul>
                    {g.items.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section cta" aria-labelledby="cta-title">
        <div className="wrap">
          <h2 id="cta-title">Let&rsquo;s build something real.</h2>
          <div className="cta__row">
            <Link className="btn" href="/contact">
              Start a conversation <Arrow size={18} />
            </Link>
            <p>{SITE.status}</p>
          </div>
        </div>
      </section>
    </>
  )
}
