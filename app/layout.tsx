import type { Metadata, Viewport } from 'next'
import '../components/ui/glare.css'

export const metadata: Metadata = {
  title:       'Peruri Jai Sai Siddhartha — Creative Designer',
  description: 'Creative designer working across UI/UX, branding and web. Portfolio of Peruri Jai Sai Siddhartha.',
  keywords:    ['UI/UX', 'Brand Identity', 'WebGL', 'Designer', 'Portfolio', 'Figma', 'Framer'],
  authors:     [{ name: 'Peruri Jai Sai Siddhartha' }],
  openGraph: {
    title:       'Peruri Jai Sai Siddhartha — Creative Designer',
    description: 'UI/UX, branding and web design by Peruri Jai Sai Siddhartha.',
    type:        'website',
  },
}

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  themeColor:   '#07070C',
  colorScheme:  'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Oswald:wght@300;400;500;700&family=Hanken+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
