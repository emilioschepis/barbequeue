import s from './ConsensusRail.module.css'
import Avatar from './Avatar.jsx'
import StatePill from './StatePill.jsx'
import { Flame, Check, ArrowRight, Eye, UserPlus, RotateCcw } from './icons.jsx'

const SEGMENTS = [
  { key: 'accepted',  color: 'var(--accepted)' },
  { key: 'objected',  color: 'var(--objected)' },
  { key: 'dismissed', color: 'var(--muted)' },
  { key: 'abstained', color: 'var(--surface-3)' },
  { key: 'pending',   color: 'var(--line)' },
]

export default function ConsensusRail({
  members,
  counts,
  blocked,
  blockerName,
  onAdvance,
  onExposeContext,
  onInvite,
  onReset,
}) {
  const consensus = members.filter((m) => !m.removed)
  const removed = members.filter((m) => m.removed)

  return (
    <aside className={s.rail} aria-label="Consensus board and session controls">
      <div className={s.panel}>
        <div className={s.head}>
          <h3 className={s.title}>Consensus</h3>
          <span className={s.tally}>
            {counts.accepted}/{counts.total} accepted
          </span>
        </div>

        <div
          className={s.bar}
          role="img"
          aria-label={`${counts.accepted} accepted, ${counts.objected} objecting, ${counts.abstained} abstained, ${counts.pending} pending`}
        >
          {SEGMENTS.map(
            (seg) =>
              counts[seg.key] > 0 && (
                <span
                  key={seg.key}
                  className={s.seg}
                  style={{ flexGrow: counts[seg.key], background: seg.color }}
                />
              ),
          )}
        </div>

        <div className={`${s.banner} ${blocked ? s.bBlocked : s.bReady}`}>
          {blocked ? (
            <Flame size={16} strokeWidth={2} />
          ) : (
            <Check size={16} strokeWidth={2} />
          )}
          <div className={s.bannerText}>
            <strong>
              {blocked
                ? `Blocked by ${blockerName}’s objection`
                : 'No objections — ready to advance'}
            </strong>
            <span>
              {blocked
                ? 'Resolve or dismiss it to reach consensus.'
                : 'Abstentions are fine. You can advance.'}
            </span>
          </div>
        </div>

        <ul className={s.members}>
          {consensus.map((m) => (
            <li key={m.id} className={s.member}>
              <Avatar member={m} size={32} />
              <div className={s.mInfo}>
                <span className={s.mName}>{m.name}</span>
                <span className={s.mRole}>{m.role === 'host' ? 'Host' : 'Participant'}</span>
              </div>
              <StatePill state={m.displayState} size="sm" />
            </li>
          ))}
        </ul>

        {removed.length > 0 && (
          <div className={s.removedWrap}>
            <span className={s.removedLabel}>Removed · contributions kept</span>
            {removed.map((m) => (
              <div key={m.id} className={s.removedRow}>
                <Avatar member={m} size={24} />
                <span className={s.mName}>{m.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={s.controls}>
        <button
          type="button"
          className={s.advance}
          onClick={onAdvance}
          disabled={blocked}
          title={blocked ? `Resolve ${blockerName}’s objection first` : 'Advance the session'}
        >
          Advance session
          <ArrowRight size={16} strokeWidth={2} />
        </button>
        {blocked && (
          <p className={s.hint}>
            Locked until the objection is resolved or dismissed.
          </p>
        )}

        <div className={s.secondary}>
          <button type="button" className={s.ghost} onClick={onExposeContext}>
            <Eye size={15} />
            Expose context
          </button>
          <button type="button" className={s.ghost} onClick={onInvite}>
            <UserPlus size={15} />
            Invite
          </button>
        </div>
      </div>

      <button type="button" className={s.reset} onClick={onReset}>
        <RotateCcw size={13} />
        Reset demo
      </button>
    </aside>
  )
}
