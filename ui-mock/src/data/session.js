// Realistic mock data for a Barbequeue host session.
// Domain terms follow CONTEXT.md (grilling question, contribution, answer candidate,
// consensus state, objection, etc.). This is the data behind the high-fi mock.

export const HOST_ID = 'm1'

export const members = [
  { id: 'm1', name: 'Ivano Soro',  initials: 'IS', role: 'host',        state: 'accepted' },
  { id: 'm2', name: 'Mara Linde',  initials: 'ML', role: 'participant', state: 'accepted' },
  { id: 'm3', name: 'Devon Park',  initials: 'DP', role: 'participant', state: 'objected' },
  { id: 'm4', name: 'Priya Nair',  initials: 'PN', role: 'participant', state: 'pending'  },
  { id: 'm5', name: 'Sam Okafor',  initials: 'SO', role: 'participant', state: 'abstained' },
  // Removed participant — earlier contribution stays in the record, stance frozen.
  { id: 'm6', name: 'Theo Vance',  initials: 'TV', role: 'participant', state: 'pending', removed: true },
]

export const session = {
  title: 'Should invite links expire — and how?',
  repo: 'barbequeue',
  branch: 'main',
  questionIndex: 4,
  questionTotal: 7,
  phase: 'response', // response phase, open
}

export const grillingQuestion = {
  text: 'Should invite links expire — and if so, on what clock?',
  // The question was sharpened mid-phase in response to a clarifying contribution.
  sharpened:
    'Clarified: “use” means entering the room with a display name, not merely opening the link.',
  exposedContext: [
    { id: 'c1', label: 'ADR-0002 · hosted participant room' },
    { id: 'c2', label: 'docs/invite-links.md' },
  ],
}

export const answerCandidate = {
  author: 'agent',
  revisedCount: 1,
  updatedAgo: '6 min ago',
  text:
    'Invite links expire 7 days after creation. The host can mint a fresh link at any ' +
    'time; an expired link shows a plain “this link expired — ask your host for a new ' +
    'one” page. No per-link revocation in v1.',
  // Used after the host resolves the blocking objection (agent re-runs synthesis).
  revisedText:
    'Invite links expire 7 days after creation. The host can mint a fresh link at any ' +
    'time; an expired link shows a plain “this link expired — ask your host for a new ' +
    'one” page. No per-link revocation in v1. Per the host’s call, v1 ships fixed-from-' +
    'creation expiry; activity-based reset is flagged to revisit if it resurfaces.',
}

// Contribution types: 'idea' | 'clarifying' | 'objection' | 'abstention'
export const contributions = [
  {
    id: 'k1',
    authorId: 'm2',
    type: 'idea',
    time: '14:02',
    body:
      'If a link leaks, a time-box limits the blast radius. Seven days feels right for ' +
      'async teams — long enough to gather everyone, short enough to matter.',
  },
  {
    id: 'k2',
    authorId: 'm6', // Theo — since removed; contribution remains
    type: 'idea',
    time: '14:05',
    body:
      'Whatever we pick, make expiry obvious on the join page. A dead link with no ' +
      'explanation is the worst possible first impression.',
  },
  {
    id: 'k3',
    authorId: 'm3',
    type: 'clarifying',
    time: '14:09',
    body:
      'Does “first use” mean the first person to open the link, or the first to enter ' +
      'the room with a display name?',
  },
  {
    id: 'k4',
    authorId: 'm5',
    type: 'idea',
    time: '14:13',
    body:
      'Single-use is too aggressive — people reopen tabs and switch devices mid-session. ' +
      'Time-box, yes; single-use, no.',
  },
  {
    id: 'k5',
    authorId: 'm4',
    type: 'idea',
    time: '14:18',
    body:
      'What if the host picks 1 / 7 / 30 days at creation? A sane default with an easy ' +
      'override covers the long-running cases without a setting nobody reads.',
  },
  {
    id: 'k6',
    authorId: 'm3',
    type: 'objection',
    time: '14:24',
    body:
      'A hard 7-day expiry from creation breaks long-running grills — we’ve had sessions ' +
      'span two weeks. Expiry should reset on activity, not creation.',
  },
]
