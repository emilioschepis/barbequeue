# Use a monorepo for the prototype

Barbequeue's prototype keeps the Hosted Service, shared protocol, and Codex Plugin in one repository. This lets the platform and plugin evolve together while the event contract is still changing, and it gives both sides a shared TypeScript protocol package instead of duplicating session event schemas across repositories.
