import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'
import { PROJECTS, getNeighbour, getProject } from '@/content/projects'
import { Arrow } from '@/components/Arrow'
import { Reveal } from '@/components/chrome/Reveal'

type Props = { params: { slug: string } }

export function generateStaticParams() {
  return PROJECTS.map(p => ({ slug: p.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const project = getProject(params.slug)
  if (!project) return {}
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title: `${project.title} — Siddhartha`, description: project.summary },
  }
}

export default function CaseStudyPage({ params }: Props) {
  const project = getProject(params.slug)
  if (!project) notFound()

  const next = getNeighbour(project.slug)
  const colours = (p: typeof project) =>
    ({ '--bg': p.bg, '--fg': p.fg, '--accent': p.accent }) as CSSProperties

  return (
    <article>
      <header className="case-hero" style={colours(project)}>
        <span className="case-hero__mark" aria-hidden="true">
          {project.title.charAt(0)}
        </span>
        <div className="wrap">
          <Link href="/work" className="back">
            <Arrow size={18} back /> All work
          </Link>
          <h1>{project.title}</h1>
          <p className="kind">{project.kind}</p>
        </div>
      </header>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <p className="case-lead">{project.summary}</p>
          <dl className="case-meta" style={{ marginTop: 'clamp(32px, 5vw, 64px)' }}>
            <div>
              <dt>Disciplines</dt>
              <dd>{project.tags.join(', ')}</dd>
            </div>
            <div>
              <dt>Tools</dt>
              <dd>{project.tools.join(', ')}</dd>
            </div>
            {project.role && (
              <div>
                <dt>Role</dt>
                <dd>{project.role}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      {project.images && project.images.length > 0 && (
        <section className="section" style={{ paddingBottom: 0 }} aria-label="Project images">
          <div className="wrap gallery">
            {project.images.map(img => (
              <Image
                key={img.src}
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes="(max-width: 1440px) 100vw, 1440px"
                priority
              />
            ))}
          </div>
        </section>
      )}

      {project.sections.map((section, i) => (
        <section
          key={section.title}
          className="section"
          style={i === 0 ? undefined : { paddingTop: 0 }}
          aria-labelledby={`case-${i}`}
        >
          <div className="wrap case-story">
            <h2 id={`case-${i}`}>{section.title}</h2>
            <Reveal>
              {section.paragraphs?.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.points && (
                <ul className="points">
                  {section.points.map(point => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}
            </Reveal>
          </div>
        </section>
      ))}

      <Link href={`/work/${next.slug}`} className="next" style={colours(next)}>
        <div className="wrap">
          <small>Next project</small>
          <strong>
            {next.title}
            <Arrow size={110} />
          </strong>
        </div>
      </Link>
    </article>
  )
}
