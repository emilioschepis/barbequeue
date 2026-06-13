import { useEffect, useRef } from 'react'
import Turn from './Turn.jsx'
import { session } from '../data/session.js'

// A single shared column. No left/right bubbles — everyone writes into the
// same fire. New turns land at the bottom and the view eases to them.
export default function Transcript({ turns }) {
  const endRef = useRef(null)
  const count = turns.length

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [count])

  return (
    <div className="transcript" role="log" aria-label="Session transcript" aria-live="polite">
      <div className="transcript__open">
        <p className="transcript__opener">{session.topic}</p>
        <span className="transcript__since">Session opened 4:01 · 4 here</span>
      </div>

      {turns.map((t) => (
        <Turn key={t.id} turn={t} />
      ))}

      <div ref={endRef} />
    </div>
  )
}
