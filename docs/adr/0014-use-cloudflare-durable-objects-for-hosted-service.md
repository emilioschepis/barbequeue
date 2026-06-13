# Use Cloudflare Durable Objects for the Hosted Service

Barbequeue's prototype Hosted Service targets Cloudflare Workers with Durable Objects instead of a realtime application platform such as Convex. Convex could speed up generic realtime app development, but Barbequeue's core constraint is a per-session coordinator that orders session events, broadcasts participant room changes, supports cursor-based resume, and preserves the Codex Plugin as the authority for repo-grounded lifecycle work.
