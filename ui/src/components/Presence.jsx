import { authors } from '../data/session.js'

// Who's around the fire right now. A quiet facepile, agent always present.
export default function Presence({ presence }) {
  const here = presence.filter((p) => p.state !== 'gone')
  const activeCount = presence.filter((p) => p.state === 'active').length

  return (
    <div className="presence" title="Who's here">
      <div className="presence__pile">
        <span className="facechip facechip--agent" aria-hidden="true">
          <span className="facechip__flame" />
        </span>
        {here.map((p) => {
          const a = authors[p.id]
          return (
            <span
              key={p.id}
              className={`facechip facechip--${p.state}`}
              style={{ '--tint': a.tint }}
              title={`${a.name} · ${p.state}`}
            >
              {a.name.charAt(0)}
            </span>
          )
        })}
      </div>
      <span className="presence__label">
        barbequeue + {activeCount} here
      </span>
    </div>
  )
}
