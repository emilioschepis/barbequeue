import s from './ContributionStream.module.css'
import Contribution from './Contribution.jsx'

export default function ContributionStream({
  contributions,
  membersById,
  dismissedMap,
  onDismissObjection,
}) {
  return (
    <section className={s.section} aria-labelledby="contrib-heading">
      <div className={s.header}>
        <h3 id="contrib-heading" className={s.title}>Contributions</h3>
        <span className={s.count}>{contributions.length}</span>
      </div>

      <div className={s.list}>
        {contributions.map((k) => {
          const isDismissed = k.type === 'objection' && k.id in dismissedMap
          return (
            <Contribution
              key={k.id}
              contribution={k}
              author={membersById[k.authorId]}
              dismissed={isDismissed}
              dismissReason={isDismissed ? dismissedMap[k.id] : ''}
              onDismiss={onDismissObjection}
            />
          )
        })}
      </div>
    </section>
  )
}
