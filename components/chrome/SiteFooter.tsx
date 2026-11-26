import Link from 'next/link'
import { NAV, SITE } from '@/content/site'
import { BackToTop } from './BackToTop'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <h2>Siddhartha Peruri</h2>
            <p style={{ marginTop: 12, maxWidth: '30ch', color: 'rgba(243, 239, 230, 0.78)' }}>
              {SITE.role}. {SITE.status}
            </p>
          </div>
          <div>
            <h3>Pages</h3>
            <ul>
              {NAV.map(item => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/privacy-policy">Privacy policy</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3>Elsewhere</h3>
            <ul>
              <li>
                <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href={SITE.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3>Write to me</h3>
            <ul>
              <li>
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
              <li>
                <span style={{ display: 'inline-flex', minHeight: 44, alignItems: 'center' }}>
                  {SITE.location}
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-base">
          <span>&copy; 2026 {SITE.name}</span>
          <BackToTop />
          <span>Made in India</span>
        </div>
      </div>
    </footer>
  )
}
