import type { MetadataRoute } from 'next'
import { PROJECTS } from '@/content/projects'
import { SITE } from '@/content/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/work', '/about', '/contact', '/privacy-policy']
  return [
    ...pages.map(path => ({ url: `${SITE.url}${path}`, changeFrequency: 'monthly' as const })),
    ...PROJECTS.map(p => ({ url: `${SITE.url}/work/${p.slug}`, changeFrequency: 'monthly' as const })),
  ]
}
