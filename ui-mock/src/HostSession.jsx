import { useCallback, useMemo, useRef, useState } from 'react'
import s from './HostSession.module.css'
import TopBar from './components/TopBar.jsx'
import GrillingQuestion from './components/GrillingQuestion.jsx'
import AnswerCandidate from './components/AnswerCandidate.jsx'
import ContributionStream from './components/ContributionStream.jsx'
import Composer from './components/Composer.jsx'
import ConsensusRail from './components/ConsensusRail.jsx'
import DismissObjectionDialog from './components/DismissObjectionDialog.jsx'
import Toast from './components/Toast.jsx'
import {
  members as seedMembers,
  HOST_ID,
  session,
  grillingQuestion,
  answerCandidate,
  contributions as seedContributions,
} from './data/session.js'

function nowHHMM() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function HostSession() {
  const membersById = useMemo(
    () => Object.fromEntries(seedMembers.map((m) => [m.id, m])),
    [],
  )
  const host = membersById[HOST_ID]

  const [list, setList] = useState(seedContributions)
  const [dismissedMap, setDismissedMap] = useState({}) // { objectionId: reason }
  const [hostAbstained, setHostAbstained] = useState(false)
  const [dialogObjection, setDialogObjection] = useState(null)
  const [revising, setRevising] = useState(false)
  const [answerRevised, setAnswerRevised] = useState(false)
  const [toast, setToast] = useState(null)

  const toastTimer = useRef(0)
  const showToast = useCallback((msg) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2800)
  }, [])

  const openObjections = list.filter(
    (k) => k.type === 'objection' && !(k.id in dismissedMap),
  )
  const blocked = openObjections.length > 0
  const blocker = openObjections[0] ? membersById[openObjections[0].authorId] : null
  const blockerName = blocker ? blocker.name.split(' ')[0] : ''

  function displayState(m) {
    const objection = list.find((k) => k.authorId === m.id && k.type === 'objection')
    if (objection) return objection.id in dismissedMap ? 'dismissed' : 'objected'
    if (m.id === HOST_ID && hostAbstained) return 'abstained'
    return m.state
  }

  const enriched = seedMembers.map((m) => ({ ...m, displayState: displayState(m) }))
  const consensusMembers = enriched.filter((m) => !m.removed)
  const counts = consensusMembers.reduce(
    (acc, m) => {
      acc[m.displayState] = (acc[m.displayState] || 0) + 1
      return acc
    },
    { accepted: 0, objected: 0, abstained: 0, pending: 0, dismissed: 0 },
  )
  counts.total = consensusMembers.length

  const answerText = answerRevised ? answerCandidate.revisedText : answerCandidate.text
  const liveCandidate = {
    ...answerCandidate,
    revisedCount: answerRevised ? 2 : 1,
    updatedAgo: answerRevised ? 'just now' : answerCandidate.updatedAgo,
  }

  function handleSubmit(type, body) {
    setList((prev) => [
      ...prev,
      { id: `h${Date.now()}`, authorId: HOST_ID, type, time: nowHHMM(), body },
    ])
    showToast(
      type === 'objection'
        ? 'Objection added — it now blocks consensus.'
        : 'Idea added to the response phase.',
    )
  }

  function handleAbstain() {
    setHostAbstained((a) => {
      const next = !a
      showToast(next ? 'You abstained from this question.' : 'You’re back in consensus.')
      return next
    })
  }

  function confirmDismiss(reason) {
    const id = dialogObjection.id
    setDismissedMap((prev) => ({ ...prev, [id]: reason }))
    setDialogObjection(null)
    showToast('Objection dismissed and recorded.')
    const stillOpen = list.some(
      (k) => k.type === 'objection' && k.id !== id && !(k.id in dismissedMap),
    )
    if (!stillOpen) {
      setRevising(true)
      window.setTimeout(() => {
        setAnswerRevised(true)
        setRevising(false)
      }, 1500)
    }
  }

  function handleAdvance() {
    if (blocked) return
    showToast('Consensus reached — advancing to question 5 (mock).')
  }

  function handleReset() {
    setList(seedContributions)
    setDismissedMap({})
    setHostAbstained(false)
    setDialogObjection(null)
    setRevising(false)
    setAnswerRevised(false)
    showToast('Demo reset.')
  }

  return (
    <div className={s.app}>
      <TopBar session={session} host={host} />

      <main className={s.main}>
        <div className={s.column}>
          <GrillingQuestion
            question={grillingQuestion}
            onSharpen={() => showToast('Sharpen the question inline (mock).')}
          />
          <AnswerCandidate candidate={liveCandidate} revising={revising} text={answerText} />
          <ContributionStream
            contributions={list}
            membersById={membersById}
            dismissedMap={dismissedMap}
            onDismissObjection={setDialogObjection}
          />
          <Composer
            host={host}
            hostAbstained={hostAbstained}
            onSubmit={handleSubmit}
            onAbstain={handleAbstain}
          />
        </div>

        <ConsensusRail
          members={enriched}
          counts={counts}
          blocked={blocked}
          blockerName={blockerName}
          onAdvance={handleAdvance}
          onExposeContext={() =>
            showToast('Choose a file or excerpt to add to shared context (mock).')
          }
          onInvite={() => showToast('Invite link copied to clipboard (mock).')}
          onReset={handleReset}
        />
      </main>

      <DismissObjectionDialog
        objection={dialogObjection}
        author={dialogObjection ? membersById[dialogObjection.authorId] : null}
        onCancel={() => setDialogObjection(null)}
        onConfirm={confirmDismiss}
      />

      <Toast message={toast} />
    </div>
  )
}
