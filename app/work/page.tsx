import type { Metadata } from 'next'
import { WorkExplorer } from '@/components/work/WorkExplorer'

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Interactive experiments, games, data products, brand identities and interface concepts by Siddhartha.',
  alternates: { canonical: '/work' },
}

export default function WorkPage() {
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <h1>Work</h1>
          <p>Interactive simulations, games, data products, brand identities and interface concepts, from first sketch to shipped page.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <WorkExplorer />
        </div>
      </section>
    </>
  )
}
