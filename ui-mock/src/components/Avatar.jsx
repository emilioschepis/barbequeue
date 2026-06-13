import s from './Avatar.module.css'

export default function Avatar({ member, size = 34 }) {
  const cls = [
    s.avatar,
    member.role === 'host' && s.host,
    member.removed && s.removed,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      className={cls}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      title={member.role === 'host' ? `${member.name} (host)` : member.name}
      aria-hidden="true"
    >
      {member.initials}
    </span>
  )
}
