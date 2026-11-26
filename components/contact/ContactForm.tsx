'use client'

import { useId, useRef, useState } from 'react'
import { SERVICES, SITE } from '@/content/site'
import { Arrow } from '@/components/Arrow'

/**
 * No backend: this builds a mailto link from the choices below and opens the
 * visitor's own email app. Nothing is sent or stored by this site.
 */
export function ContactForm() {
  const id = useId()
  const [picked, setPicked] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const toggle = (item: string) =>
    setPicked(cur => (cur.includes(item) ? cur.filter(i => i !== item) : [...cur, item]))

  const subject = picked.length ? `Project enquiry: ${picked.join(', ')}` : 'Project enquiry'
  const body = message.trim() ? `${message.trim()}\n\n` : ''
  const href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE.email)
      setCopied('ok')
    } catch {
      setCopied('fail')
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied('idle'), 2400)
  }

  return (
    <div className="panel-card">
      <h2>Tell me what you need</h2>
      <p>Pick what fits, add a line if you like, and your email app opens with it filled in.</p>

      <fieldset className="checks">
        <legend>What are you looking for?</legend>
        {SERVICES.map(item => (
          <label className="check" key={item}>
            <input
              type="checkbox"
              checked={picked.includes(item)}
              onChange={() => toggle(item)}
            />
            <span>{item}</span>
          </label>
        ))}
      </fieldset>

      <label className="field" htmlFor={`${id}-msg`}>
        <span>A line about the project (optional)</span>
        <textarea
          id={`${id}-msg`}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="What you are making, for whom, and by when."
        />
      </label>

      <div className="actions">
        <a className="btn" href={href}>
          Open in email <Arrow size={18} />
        </a>
        <button type="button" className="btn btn--ghost" onClick={copy}>
          Copy email address
        </button>
      </div>

      <p className="note" role="status" aria-live="polite">
        {copied === 'ok' && 'Email address copied.'}
        {copied === 'fail' && `Could not copy. The address is ${SITE.email}.`}
        {copied === 'idle' && 'This opens your own email app. Nothing is sent from this site.'}
      </p>
    </div>
  )
}
