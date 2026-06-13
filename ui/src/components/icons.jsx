// One icon family: 24px grid, 1.6 stroke, round caps, currentColor.
// Flame is the only filled mark — it's the fire.

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function IconSend(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 19V6" />
      <path d="M6 11l6-6 6 6" />
    </svg>
  )
}

export function IconAt(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3.4" />
      <path d="M15.4 12v1.2a2.4 2.4 0 0 0 4.6.9 9 9 0 1 0-3 4" />
    </svg>
  )
}

export function IconUsers(props) {
  return (
    <svg {...base} {...props}>
      <path d="M16 19v-1.5A3.5 3.5 0 0 0 12.5 14h-5A3.5 3.5 0 0 0 4 17.5V19" />
      <circle cx="10" cy="7.5" r="3" />
      <path d="M20 19v-1.5a3.5 3.5 0 0 0-2.6-3.4M15.5 5a3 3 0 0 1 0 5.4" />
    </svg>
  )
}

// Filled flame — the agent's mark and the "on the grill" state.
export function IconFlame({ filled = true, ...props }) {
  return (
    <svg
      {...base}
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      {...props}
    >
      <path d="M12 3c.6 2.4-.4 3.8-1.6 5.1C9 9.6 8 10.9 8 13a4 4 0 0 0 8 0c0-1.3-.5-2.4-1-3.2-.4.7-.9 1-1.4 1.1.6-2.2-.3-4.6-1.6-7.9Z" />
    </svg>
  )
}

export function IconCheck(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12.5l4.2 4.2L19 7" />
    </svg>
  )
}

// Open ring — a "raw / fresh" idea, not yet on the heat.
export function IconSpark(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="6.5" strokeDasharray="2.5 3" />
    </svg>
  )
}

export function IconAlert(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 8.5v4.2" />
      <path d="M12 16h.01" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}

export function IconArrowDown(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14" />
      <path d="M6 13l6 6 6-6" />
    </svg>
  )
}
