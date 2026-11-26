'use client'

import Link from 'next/link'

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="lost">
      <div className="wrap">
        <h1>Oops</h1>
        <p>Something broke while loading this page. Try again, or head back home.</p>
        <div className="actions">
          <button type="button" className="btn" onClick={reset}>
            Try again
          </button>
          <Link className="btn btn--ghost" href="/">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  )
}
