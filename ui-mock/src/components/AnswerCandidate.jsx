import s from './AnswerCandidate.module.css'
import { Sparkle, Check } from './icons.jsx'

export default function AnswerCandidate({ candidate, revising, text }) {
  return (
    <section className={s.card} aria-busy={revising || undefined} aria-labelledby="ac-heading">
      <div className={s.head}>
        <span id="ac-heading" className={s.label}>
          <span className={s.mark}><Sparkle size={15} strokeWidth={1.6} /></span>
          Answer candidate
        </span>
        <span className={s.meta}>
          {revising
            ? 'Re-running synthesis…'
            : `Drafted by the agent · revised ${candidate.revisedCount}× · ${candidate.updatedAgo}`}
        </span>
      </div>

      {revising ? (
        <div className={s.skeleton} aria-hidden="true">
          <span style={{ width: '96%' }} />
          <span style={{ width: '88%' }} />
          <span style={{ width: '72%' }} />
        </div>
      ) : (
        <p className={s.body}>{text}</p>
      )}

      {!revising && (
        <div className={s.foot}>
          <Check size={14} strokeWidth={2} />
          Incorporates 4 ideas from this phase
        </div>
      )}
    </section>
  )
}
