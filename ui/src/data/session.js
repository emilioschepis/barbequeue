// One brainstorm session: a product team + the agent deciding the first-run
// for "Cadence", a habit app. Mixed authorship, live idea-states, the agent
// as a participant — not a reply box.

export const AGENT_ID = 'agent';

export const authors = {
  agent: {
    id: 'agent',
    name: 'barbequeue',
    role: 'in the room',
    tint: 'var(--ember)',
    isAgent: true,
  },
  maya: { id: 'maya', name: 'Maya', role: 'PM', tint: 'var(--author-maya)' },
  devin: { id: 'devin', name: 'Devin', role: 'Eng', tint: 'var(--author-devin)' },
  priya: { id: 'priya', name: 'Priya', role: 'Design', tint: 'var(--author-priya)' },
  sam: { id: 'sam', name: 'Sam', role: 'Data', tint: 'var(--author-sam)' },
};

// presence: who's around the fire right now
export const presence = [
  { id: 'maya', state: 'active' },
  { id: 'priya', state: 'active' },
  { id: 'devin', state: 'active' },
  { id: 'sam', state: 'idle' },
];

export const session = {
  title: 'First-run for Cadence',
  topic: 'What should a brand-new Cadence user meet in the first ten seconds?',
};

// idea-state: 'raw' (fresh) → 'grilling' (on the grill) → 'settled' (cooked)
export const turns = [
  {
    id: 't1',
    authorId: 'maya',
    time: '4:02',
    blocks: [
      "Pulling everyone in. We keep losing people on day one — 38% never finish setup. I don't want to redesign the whole onboarding, I want to find the one screen that earns the second tap.",
    ],
  },
  {
    id: 't2',
    authorId: 'devin',
    time: '4:03',
    ideaState: 'raw',
    ideaLabel: 'Skip setup entirely',
    blocks: [
      'Hot take: what if there is no setup. Drop them straight into one prefilled habit and let them edit it later. Every field we ask for up front is a place to quit.',
    ],
  },
  {
    id: 't3',
    authorId: 'agent',
    time: '4:03',
    addressedFrom: 'devin',
    blocks: [
      'Devin’s instinct matches the funnel. The biggest single drop is the goal-picker — 22% of all churn happens on that one screen, before anyone sees a habit at all.',
      'So the question underneath the question: is the goal-picker doing work for the user, or for us? If it’s for us, it can move to day three.',
    ],
  },
  {
    id: 't4',
    authorId: 'priya',
    time: '4:05',
    ideaState: 'grilling',
    ideaLabel: 'One habit, already lit',
    blocks: [
      'Building on that — the first screen is a single habit card, already filled in with something almost everyone wants ("Drink water"), and a big checkmark. They complete it once, in the first ten seconds, and *then* we ask anything.',
      'First action before first form. The app proves it works before it asks them to.',
    ],
  },
  {
    id: 't5',
    authorId: 'sam',
    time: '4:06',
    blocks: [
      'Worth knowing: users who check off anything in session one retain at 3.1x the rate at week two. "First action before first form" isn’t just nicer, it’s the number that moves.',
    ],
  },
  {
    id: 't6',
    authorId: 'agent',
    time: '4:06',
    kind: 'error',
    blocks: [
      'Lost the thread for a second — connection dropped mid-reply. Picking back up from Sam’s 3.1x.',
    ],
  },
  {
    id: 't7',
    authorId: 'maya',
    time: '4:08',
    ideaState: 'settled',
    ideaLabel: 'Default habit, then ask',
    blocks: [
      'Okay, I think that’s the one. First screen: one pre-lit habit, one checkmark, zero forms. Goal-picker moves to after the first completion. Devin, Priya — anything that breaks this?',
    ],
  },
  {
    id: 't8',
    authorId: 'agent',
    time: '4:08',
    kind: 'thinking',
    addressedFrom: 'maya',
    blocks: [],
    thinkingNote: 'checking the empty-state and the returning-user case against this',
  },
];
