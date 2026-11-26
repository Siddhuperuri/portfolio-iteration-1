import type { Metadata } from 'next'
import Link from 'next/link'
import { EDUCATION, HIGHLIGHTS, SITE, SKILL_GROUPS } from '@/content/site'
import { Arrow } from '@/components/Arrow'
import { Reveal } from '@/components/chrome/Reveal'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Peruri Jai Sai Siddhartha is a creative designer and CS student working across UI/UX, branding and web.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <h1>About</h1>
          <p>Design with clarity and intent, built to run in the browser.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="wrap about-grid">
          <Reveal className="prose">
            <p>
              I&rsquo;m {SITE.name}, a creative designer working across UI/UX, branding and web. I
              build user-centred interfaces with clear structure, from low-fidelity wireframes to
              shipped pages.
            </p>
            <p>
              I design visual systems with clean structure, confident typography and calm surfaces,
              then add only as much motion as it takes to make them feel alive.
            </p>
            <p>
              I study computer science, and I build my own prototypes in HTML, CSS and JavaScript.
            </p>
          </Reveal>

          <Reveal>
            <h2>Education</h2>
            <dl className="facts">
              <div>
                <dt>School</dt>
                <dd>{EDUCATION.school}</dd>
              </div>
              <div>
                <dt>Degree</dt>
                <dd>{EDUCATION.degree}</dd>
              </div>
              <div>
                <dt>Track</dt>
                <dd>{EDUCATION.track}</dd>
              </div>
              <div>
                <dt>Years</dt>
                <dd>{EDUCATION.years}</dd>
              </div>
              <div>
                <dt>CGPA</dt>
                <dd>{EDUCATION.cgpa}</dd>
              </div>
              <div>
                <dt>Based in</dt>
                <dd>{SITE.location}</dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      <section className="section statement" aria-labelledby="highlights-title">
        <div className="wrap about-grid">
          <h2 id="highlights-title" style={{ fontSize: 'clamp(2.4rem, 5vw, 4.4rem)' }}>
            Highlights
          </h2>
          <ol className="numbered">
            {HIGHLIGHTS.map(h => (
              <li key={h}>{h}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="skills-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="skills-title">Skills</h2>
          </div>
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
        </div>
      </section>

      <section className="section cta" aria-labelledby="cta-title">
        <div className="wrap">
          <h2 id="cta-title" style={{ fontSize: 'clamp(2.6rem, 8vw, 7rem)' }}>
            Got a project in mind?
          </h2>
          <div className="cta__row">
            <Link className="btn" href="/contact">
              Get in touch <Arrow size={18} />
            </Link>
            <p>{SITE.status}</p>
          </div>
        </div>
      </section>
    </>
  )
}
