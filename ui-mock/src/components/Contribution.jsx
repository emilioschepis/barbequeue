import s from './Contribution.module.css'
import Avatar from './Avatar.jsx'
import { Lightbulb, HelpCircle, Flame, MinusCircle, Gavel } from './icons.jsx'

const TYPES = {
  idea:       { cls: s.typeIdea,    label: 'Idea',       Icon: Lightbulb },
  clarifying: { cls: s.typeClarify, label: 'Clarifying', Icon: HelpCircle },
  objection:  { cls: s.typeObject,  label: 'Objection',  Icon: Flame },
  abstention: { cls: s.typeAbstain, label: 'Abstained',  Icon: MinusCircle },
}

export default function Contribution({
  contribution,
  author,
  dismissed = false,
  dismissReason = '',
  onDismiss,
}) {
  const t = TYPES[contribution.type] ?? TYPES.idea
  const T = t.Icon
  const isObjection = contribution.type === 'objection'
  const resolved = isObjection && dismissed

  const cls = [s.item, isObjection && s.objection, resolved && s.resolved]
    .filter(Boolean)
    .join(' ')

  return (
    <article className={cls}>
      <Avatar member={author} size={36} />

      <div className={s.body}>
        <div className={s.meta}>
          <span className={s.author}>{author.name}</span>
          {author.role === 'host' && <span className={s.hostTag}>Host</span>}
          {author.removed && <span className={s.removedTag}>removed</span>}
          <span className={`${s.type} ${t.cls}`}>
            <T size={12} strokeWidth={2} />
            {t.label}
          </span>
          <span className={s.time}>{contribution.time}</span>
        </div>

        <p className={s.text}>{contribution.body}</p>

        {isObjection && !resolved && (
          <div className={s.objectionActions}>
            <span className={s.blocking}>
              <Flame size={13} strokeWidth={2} />
              Blocking consensus
            </span>
            <button
              type="button"
              className={s.dismiss}
              onClick={() => onDismiss(contribution)}
            >
              <Gavel size={14} />
              Dismiss with reason…
            </button>
          </div>
        )}

        {resolved && (
          <div className={s.dismissedNote}>
            <Gavel size={14} />
            <span>
              You dismissed this objection
              {dismissReason ? <> — <i>“{dismissReason}”</i></> : '.'}
            </span>
          </div>
        )}
      </div>
    </article>
  )
}
