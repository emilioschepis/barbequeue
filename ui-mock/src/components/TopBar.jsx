import s from './TopBar.module.css'
import Avatar from './Avatar.jsx'
import { Flame, GitBranch } from './icons.jsx'

export default function TopBar({ session, host }) {
  const { questionIndex, questionTotal } = session
  return (
    <header className={s.bar}>
      <div className={s.left}>
        <a className={s.brand} href="#" aria-label="Barbequeue home">
          <span className={s.brandMark}>
            <Flame size={17} strokeWidth={1.8} />
          </span>
          <span className={s.brandName}>Barbequeue</span>
        </a>

        <span className={s.divider} aria-hidden="true" />

        <div className={s.session}>
          <h1 className={s.title} title={session.title}>{session.title}</h1>
          <div className={s.repo}>
            <GitBranch size={13} />
            <span>{session.repo}/{session.branch}</span>
          </div>
        </div>
      </div>

      <div className={s.right}>
        <div className={s.progress} aria-label={`Question ${questionIndex} of ${questionTotal}`}>
          <div className={s.steps}>
            {Array.from({ length: questionTotal }, (_, i) => {
              const n = i + 1
              const cls =
                n < questionIndex ? s.done : n === questionIndex ? s.current : s.todo
              return <span key={n} className={`${s.step} ${cls}`} />
            })}
          </div>
          <span className={s.progressLabel}>
            Question <b>{questionIndex}</b> of {questionTotal}
          </span>
        </div>

        <div className={s.host}>
          <Avatar member={host} size={30} />
          <div className={s.hostMeta}>
            <span className={s.hostRole}>Host</span>
            <span className={s.hostName}>{host.name}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
