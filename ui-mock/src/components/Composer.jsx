import { useState } from 'react'
import s from './Composer.module.css'
import Avatar from './Avatar.jsx'
import { Lightbulb, Flame, MinusCircle, ArrowRight } from './icons.jsx'

const MODES = [
  {
    id: 'idea',
    label: 'Add idea',
    Icon: Lightbulb,
    placeholder: 'Add an idea for the agent to fold into the answer…',
    send: 'Add idea',
  },
  {
    id: 'objection',
    label: 'Object',
    Icon: Flame,
    placeholder: 'What blocks this answer? Be specific — it’s on the record.',
    send: 'Raise objection',
  },
]

export default function Composer({ host, hostAbstained, onSubmit, onAbstain }) {
  const [mode, setMode] = useState('idea')
  const [text, setText] = useState('')
  const active = MODES.find((m) => m.id === mode)
  const canSend = text.trim().length > 0

  function submit(e) {
    e.preventDefault()
    if (!canSend) return
    onSubmit(mode === 'objection' ? 'objection' : 'idea', text.trim())
    setText('')
  }

  return (
    <form
      className={`${s.composer} ${mode === 'objection' ? s.objMode : ''}`}
      onSubmit={submit}
    >
      <div className={s.top}>
        <Avatar member={host} size={32} />
        <div className={s.toggle} role="group" aria-label="Contribution type">
          {MODES.map((m) => {
            const I = m.Icon
            const on = m.id === mode
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={on}
                className={`${s.tab} ${on ? s.tabOn : ''} ${
                  m.id === 'objection' && on ? s.tabObj : ''
                }`}
                onClick={() => setMode(m.id)}
              >
                <I size={14} strokeWidth={1.9} />
                {m.label}
              </button>
            )
          })}
        </div>
      </div>

      <textarea
        className={s.input}
        rows={2}
        placeholder={active.placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label={mode === 'objection' ? 'Your objection' : 'Your idea'}
      />

      <div className={s.actions}>
        <button
          type="button"
          className={`${s.abstain} ${hostAbstained ? s.abstainOn : ''}`}
          onClick={onAbstain}
          aria-pressed={hostAbstained}
        >
          <MinusCircle size={14} />
          {hostAbstained ? 'Abstaining' : 'Abstain'}
        </button>

        <button
          type="submit"
          className={`${s.send} ${mode === 'objection' ? s.sendObj : ''}`}
          disabled={!canSend}
        >
          {active.send}
          <ArrowRight size={15} strokeWidth={2} />
        </button>
      </div>
    </form>
  )
}
