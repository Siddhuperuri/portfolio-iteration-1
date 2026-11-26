import Link from 'next/link'
import { Arrow } from '@/components/Arrow'

export default function NotFound() {
  return (
    <section className="lost">
      <div className="wrap">
        <h1>404</h1>
        <p>That page does not exist, or it moved. The work is still here.</p>
        <div className="actions">
          <Link className="btn" href="/">
            Back to home <Arrow size={18} />
          </Link>
          <Link className="btn btn--ghost" href="/work">
            See the work
          </Link>
        </div>
      </div>
    </section>
  )
}
