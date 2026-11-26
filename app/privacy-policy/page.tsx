import type { Metadata } from 'next'
import { PRIVACY_INTRO, PRIVACY_SECTIONS } from '@/content/legal'
import { LegalRail } from '@/components/chrome/LegalRail'

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'What this portfolio site collects, which is nothing beyond what hosting needs, and how to reach me.',
  alternates: { canonical: '/privacy-policy' },
}

export default function PrivacyPage() {
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <h1>Privacy policy</h1>
          <p>{PRIVACY_INTRO}</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="wrap legal">
          <LegalRail items={PRIVACY_SECTIONS.map(s => ({ id: s.id, title: s.title }))} />
          <div className="legal-body">
            {PRIVACY_SECTIONS.map(s => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`}>
                <h2 id={`${s.id}-title`}>{s.title}</h2>
                {s.body.map(p => (
                  <p key={p}>{p}</p>
                ))}
                {s.list && (
                  <ul>
                    {s.list.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
