import type { Metadata, Viewport } from 'next'
import '../components/ui/glare.css'

export const metadata: Metadata = {
  title:       'Peruri Jai Sai Siddhartha — Creative Designer',
  description: 'Creative Designer · UI/UX · Branding · Web — crafting visually engaging, user-centred digital experiences.',
  keywords:    ['UI/UX', 'Brand Identity', 'WebGL', 'Designer', 'Portfolio', 'Figma', 'Framer'],
  authors:     [{ name: 'Peruri Jai Sai Siddhartha' }],
  openGraph: {
    title:       'Peruri Jai Sai Siddhartha — Creative Designer',
    description: 'UI/UX · Branding · Web — visually engaging, user-centred digital experiences.',
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
          href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Oswald:wght@300;400;500;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
