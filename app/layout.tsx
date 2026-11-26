import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Hanken_Grotesk } from 'next/font/google'
import { SITE } from '@/content/site'
import { ScrollProgress } from '@/components/chrome/ScrollProgress'
import { SiteFooter } from '@/components/chrome/SiteFooter'
import { SiteHeader } from '@/components/chrome/SiteHeader'
import { SmoothScroll } from '@/components/chrome/SmoothScroll'
import './globals.css'

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--f-display',
  display: 'swap',
})

const body = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--f-body',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.role}`,
    template: `%s — ${SITE.short}`,
  },
  description: SITE.description,
  keywords: ['UI/UX', 'Brand Identity', 'Web Design', 'Designer', 'Portfolio', 'Figma', 'Framer'],
  authors: [{ name: SITE.name }],
  alternates: { canonical: '/' },
  openGraph: {
    title: `${SITE.name} — ${SITE.role}`,
    description: 'UI/UX, branding and web design by Peruri Jai Sai Siddhartha.',
    type: 'website',
    url: SITE.url,
  },
  twitter: { card: 'summary' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F3EFE6',
  colorScheme: 'light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <ScrollProgress />
        <SmoothScroll />
        <SiteHeader />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
