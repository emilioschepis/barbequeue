import { authors } from '../data/session.js'
import Avatar from './Avatar.jsx'
import IdeaState from './IdeaState.jsx'
import { IconAlert } from './icons.jsx'

// One turn in the shared transcript — attribution-led, never a bubble.
// The agent's turn is the same shape, lit from within by the ember.
export default function Turn({ turn }) {
  const author = authors[turn.authorId]
  const isAgent = !!author.isAgent
  const repliedTo = turn.addressedFrom ? authors[turn.addressedFrom] : null

  const cls = [
    'turn',
    isAgent && 'turn--agent',
    turn.kind === 'thinking' && 'turn--thinking',
    turn.kind === 'error' && 'turn--error',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article className={cls}>
      <div className="turn__gutter">
        <Avatar author={author} size={36} />
      </div>

      <div className="turn__body">
        <header className="turn__head">
          <span className="turn__name" style={{ color: author.tint }}>
            {author.name}
          </span>
          <span className="turn__role">{author.role}</span>
          {repliedTo && (
            <span className="turn__reply">
              replying to {repliedTo.name}
            </span>
          )}
          {turn.addressedTo === 'agent' && (
            <span className="turn__reply turn__reply--agent">
              to barbequeue
            </span>
          )}
          <time className="turn__time">{turn.time}</time>
          {turn.ideaState && (
            <span className="turn__idea">
              <IdeaState state={turn.ideaState} name={turn.ideaLabel} />
            </span>
          )}
        </header>

        {turn.kind === 'thinking' ? (
          <p className="turn__thinking">
            <span className="emberdots" aria-hidden="true">
              <i /> <i /> <i />
            </span>
            <span className="turn__thinking-note">
              {turn.thinkingNote || 'thinking it over'}
            </span>
            <span className="sr-only">barbequeue is thinking</span>
          </p>
        ) : turn.kind === 'error' ? (
          <div className="turn__errorbox" role="status">
            <IconAlert width={17} height={17} />
            <div className="turn__errorbody">
              {turn.blocks.map((b, i) => (
                <p key={i}>{b}</p>
              ))}
              <button className="linkbtn" type="button">
                Reconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="turn__text">
            {turn.blocks.map((b, i) => (
              <p key={i}>{b}</p>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
