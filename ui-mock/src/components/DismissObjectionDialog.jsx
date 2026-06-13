import { useEffect, useRef, useState } from 'react'
import s from './DismissObjectionDialog.module.css'
import { Flame, X, Gavel } from './icons.jsx'

export default function DismissObjectionDialog({ objection, author, onCancel, onConfirm }) {
  const ref = useRef(null)
  const [reason, setReason] = useState('')

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (objection) {
      setReason('')
      if (!d.open) d.showModal()
    } else if (d.open) {
      d.close()
    }
  }, [objection])

  function submit(e) {
    e.preventDefault()
    if (!reason.trim()) return
    onConfirm(reason.trim())
  }

  return (
    <dialog
      ref={ref}
      className={s.dialog}
      onCancel={(e) => {
        e.preventDefault()
        onCancel()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onCancel()
      }}
    >
      {objection && (
        <form className={s.inner} onSubmit={submit}>
          <header className={s.head}>
            <h2 className={s.title}>Dismiss this objection?</h2>
            <button type="button" className={s.close} onClick={onCancel} aria-label="Cancel">
              <X size={18} />
            </button>
          </header>

          <div className={s.quote}>
            <Flame size={15} strokeWidth={2} />
            <p>
              <b>{author?.name}</b> objected: <span>“{objection.body}”</span>
            </p>
          </div>

          <label className={s.field}>
            <span className={s.label}>Why are you dismissing it?</span>
            <textarea
              className={s.input}
              rows={3}
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Out of scope for v1 — we’ll revisit activity-based expiry if it resurfaces."
            />
          </label>

          <p className={s.note}>
            Recorded in the session record. The objection stops blocking consensus —
            it isn’t deleted, and {author?.name?.split(' ')[0]} can see your reason.
          </p>

          <footer className={s.foot}>
            <button type="button" className={s.cancel} onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className={s.confirm} disabled={!reason.trim()}>
              <Gavel size={15} />
              Dismiss objection
            </button>
          </footer>
        </form>
      )}
    </dialog>
  )
}
