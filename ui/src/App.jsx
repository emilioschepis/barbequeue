import { useState } from 'react'
import { turns as seedTurns, presence } from './data/session.js'
import SessionHeader from './components/SessionHeader.jsx'
import Transcript from './components/Transcript.jsx'
import Composer from './components/Composer.jsx'
import EmptyState from './components/EmptyState.jsx'

// You, the person at this screen. Sending writes a real turn into the room —
// no faked agent replies; the agent's responses come from the live backend.
const CURRENT_USER = 'maya'

export default function App() {
  const [view, setView] = useState('active') // 'active' | 'empty'
  const [active, setActive] = useState(seedTurns)
  const [fresh, setFresh] = useState([]) // turns added in the empty/first-open view
  let nextId = 0

  const handleSend = (text, target) => {
    const turn = {
      id: `local-${Date.now()}-${nextId++}`,
      authorId: CURRENT_USER,
      time: now(),
      addressedTo: target === 'agent' ? 'agent' : undefined,
      blocks: [text],
    }
    if (view === 'empty') setFresh((t) => [...t, turn])
    else setActive((t) => [...t, turn])
  }

  const list = view === 'empty' ? fresh : active
  const showEmpty = view === 'empty' && fresh.length === 0

  return (
    <div className="app">
      <div className="app__hearthlight" aria-hidden="true" />
      <SessionHeader presence={presence} view={view} onView={setView} />

      <main className="room">
        {showEmpty ? <EmptyState /> : <Transcript turns={list} />}
      </main>

      <Composer onSend={handleSend} />
    </div>
  )
}

function now() {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  })
}
