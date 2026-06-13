import s from './Toast.module.css'
import { Check } from './icons.jsx'

export default function Toast({ message }) {
  return (
    <div className={s.wrap} role="status" aria-live="polite">
      {message && (
        <div className={s.toast} key={message}>
          <Check size={15} strokeWidth={2} />
          <span>{message}</span>
        </div>
      )}
    </div>
  )
}
