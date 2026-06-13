import { IconFlame } from './icons.jsx'

// Author identity in one glyph. Humans: tinted disc + initial.
// Agent: ember disc + flame — it reads as the fire, never borrows a tint.
export default function Avatar({ author, size = 34, presence }) {
  const isAgent = author.isAgent
  return (
    <span
      className={`avatar${isAgent ? ' avatar--agent' : ''}`}
      style={{ '--avatar-size': `${size}px`, '--tint': author.tint }}
      aria-hidden="true"
    >
      {isAgent ? (
        <IconFlame width={size * 0.52} height={size * 0.52} />
      ) : (
        author.name.charAt(0)
      )}
      {presence && <span className={`avatar__pulse avatar__pulse--${presence}`} />}
    </span>
  )
}
