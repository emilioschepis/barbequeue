import s from './GrillingQuestion.module.css'
import { Pencil, Eye, ChevronRight } from './icons.jsx'

export default function GrillingQuestion({ question, onSharpen }) {
  return (
    <section className={s.wrap} aria-labelledby="gq-heading">
      <div className={s.labelRow}>
        <span className={s.stage}>Grilling question</span>
        <span className={s.phase}>
          <span className={s.live} aria-hidden="true" />
          Response phase open
        </span>
      </div>

      <h2 id="gq-heading" className={s.question}>{question.text}</h2>

      {question.sharpened && (
        <p className={s.sharpened}>
          <Pencil size={14} />
          <span>{question.sharpened}</span>
        </p>
      )}

      <div className={s.footer}>
        <div className={s.context}>
          <span className={s.contextLabel}>
            <Eye size={14} /> Shared context
          </span>
          <span className={s.chips}>
            {question.exposedContext.map((c) => (
              <span key={c.id} className={s.chip}>{c.label}</span>
            ))}
          </span>
        </div>

        <button type="button" className={s.sharpen} onClick={onSharpen}>
          <Pencil size={14} />
          Sharpen
          <ChevronRight size={14} className={s.sharpenChevron} />
        </button>
      </div>
    </section>
  )
}
