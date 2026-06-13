import { useRef, useState } from 'react'
import { IconSend, IconFlame, IconUsers } from './icons.jsx'

// Pinned low and quiet. You can speak to the whole room, or turn to the
// agent directly — the target is explicit, never guessed.
export default function Composer({ onSend }) {
  const [text, setText] = useState('')
  const [target, setTarget] = useState('room') // 'room' | 'agent'
  const ref = useRef(null)

  const grow = (el) => {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  const send = () => {
    const t = text.trim()
    if (!t) return
    onSend(t, target)
    setText('')
    if (ref.current) ref.current.style.height = 'auto'
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const toAgent = target === 'agent'

  return (
    <div className={`composer${toAgent ? ' composer--agent' : ''}`}>
      <div className="composer__inner">
        <div className="composer__targets" role="group" aria-label="Who you're addressing">
          <button
            type="button"
            className={!toAgent ? 'is-on' : ''}
            aria-pressed={!toAgent}
            onClick={() => setTarget('room')}
          >
            <IconUsers width={15} height={15} />
            The room
          </button>
          <button
            type="button"
            className={toAgent ? 'is-on' : ''}
            aria-pressed={toAgent}
            onClick={() => setTarget('agent')}
          >
            <IconFlame width={14} height={14} />
            barbequeue
          </button>
        </div>

        <div className="composer__field">
          <textarea
            ref={ref}
            rows={1}
            value={text}
            placeholder={
              toAgent
                ? 'Ask barbequeue to weigh in…'
                : 'Add to the conversation…'
            }
            aria-label={toAgent ? 'Message barbequeue' : 'Message the room'}
            onChange={(e) => {
              setText(e.target.value)
              grow(e.target)
            }}
            onKeyDown={onKey}
          />
          <button
            type="button"
            className="composer__send"
            disabled={!text.trim()}
            onClick={send}
            aria-label="Send"
          >
            <IconSend width={19} height={19} />
          </button>
        </div>
      </div>
      <p className="composer__hint">
        <kbd>Enter</kbd> to send · <kbd>Shift</kbd>+<kbd>Enter</kbd> for a new line
      </p>
    </div>
  )
}
