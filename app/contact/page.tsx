import type { Metadata } from 'next'
import { SITE } from '@/content/site'
import { ContactForm } from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with ${SITE.short} about design internships and freelance work in branding, UI/UX and web.`,
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <h1>Contact</h1>
          <p>{SITE.status} Email is the quickest way to reach me.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="wrap contact-grid">
          <ContactForm />

          <div>
            <dl className="details">
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${SITE.phone.replace(/\s/g, '')}`}>{SITE.phone}</a>
                </dd>
              </div>
              <div>
                <dt>Based in</dt>
                <dd>{SITE.location}</dd>
              </div>
              <div>
                <dt>LinkedIn</dt>
                <dd>
                  <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer">
                    siddharthaperuri
                  </a>
                </dd>
              </div>
              <div>
                <dt>GitHub</dt>
                <dd>
                  <a href={SITE.github} target="_blank" rel="noopener noreferrer">
                    Siddhuperuri
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </>
  )
}
