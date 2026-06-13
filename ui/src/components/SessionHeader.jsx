import { session } from '../data/session.js'
import Presence from './Presence.jsx'

// Thin persistent chrome — no Slack sidebar. Names the room and who's in it.
export default function SessionHeader({ presence, view, onView }) {
  return (
    <header className="topbar">
      <div className="topbar__lede">
        <span className="brandmark" aria-hidden="true" />
        <div className="topbar__titles">
          <h1 className="topbar__title">{session.title}</h1>
          <p className="topbar__status">
            <span className="livedot" aria-hidden="true" />
            Live session
          </p>
        </div>
      </div>

      <div className="topbar__right">
        <Presence presence={presence} />
        <div
          className="viewtoggle"
          role="tablist"
          aria-label="Preview session state"
        >
          <button
            role="tab"
            aria-selected={view === 'active'}
            className={view === 'active' ? 'is-on' : ''}
            onClick={() => onView('active')}
          >
            Active
          </button>
          <button
            role="tab"
            aria-selected={view === 'empty'}
            className={view === 'empty' ? 'is-on' : ''}
            onClick={() => onView('empty')}
          >
            First open
          </button>
        </div>
      </div>
    </header>
  )
}
