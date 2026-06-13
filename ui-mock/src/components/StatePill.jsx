import s from './StatePill.module.css'
import { Check, Flame, MinusCircle, Dot, Gavel } from './icons.jsx'

const MAP = {
  accepted:  { cls: s.accepted,  label: 'Accepted',  Icon: Check },
  objected:  { cls: s.objected,  label: 'Objected',  Icon: Flame },
  abstained: { cls: s.abstained, label: 'Abstained', Icon: MinusCircle },
  pending:   { cls: s.pending,   label: 'Pending',   Icon: Dot },
  dismissed: { cls: s.dismissed, label: 'Objection dismissed', Icon: Gavel },
}

export default function StatePill({ state, size = 'md' }) {
  const m = MAP[state] ?? MAP.pending
  const I = m.Icon
  const iconSize = state === 'pending' ? 8 : size === 'sm' ? 13 : 14
  return (
    <span className={`${s.pill} ${m.cls} ${size === 'sm' ? s.sm : ''}`}>
      <I size={iconSize} strokeWidth={2} />
      {m.label}
    </span>
  )
}
