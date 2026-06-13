import { IconSpark, IconFlame, IconCheck } from './icons.jsx'

// Cooked, not raw. An idea moves: fresh → on the grill → settled.
const STATES = {
  raw: { label: 'Fresh', Icon: IconSpark },
  grilling: { label: 'On the grill', Icon: IconFlame },
  settled: { label: 'Settled', Icon: IconCheck },
}

export default function IdeaState({ state, name }) {
  const cfg = STATES[state]
  if (!cfg) return null
  const { label, Icon } = cfg
  return (
    <span className={`idea idea--${state}`}>
      <Icon width={14} height={14} />
      <span className="idea__name">{name || label}</span>
      {name && <span className="idea__state-label">{label}</span>}
    </span>
  )
}
