import { IconUsers, IconFlame, IconCheck } from './icons.jsx'

// First open: nobody's spoken yet. Teach the room, don't say "no messages".
export default function EmptyState() {
  return (
    <div className="empty">
      <div className="empty__hearth" aria-hidden="true">
        <IconFlame width={40} height={40} />
      </div>

      <h2 className="empty__title">The fire's lit. Pull up a chair.</h2>
      <p className="empty__lede">
        This is a shared session — your team and the agent thinking out loud in
        one place. Anyone can speak. Ideas go on the grill together and come off
        when they're cooked.
      </p>

      <ul className="empty__how">
        <li>
          <span className="empty__glyph"><IconUsers width={17} height={17} /></span>
          <span>
            <strong>Bring people in.</strong> Share the link — everyone lands in
            the same conversation, not their own thread.
          </span>
        </li>
        <li>
          <span className="empty__glyph empty__glyph--ember"><IconFlame width={16} height={16} /></span>
          <span>
            <strong>The agent's in the room.</strong> Speak to it or to each
            other. It listens to the whole table, not just the last prompt.
          </span>
        </li>
        <li>
          <span className="empty__glyph"><IconCheck width={17} height={17} /></span>
          <span>
            <strong>Cook it down.</strong> Watch a thought move from fresh, to on
            the grill, to settled — so the group can see where it's converging.
          </span>
        </li>
      </ul>

      <p className="empty__cta">Say something below to start the session.</p>
    </div>
  )
}
