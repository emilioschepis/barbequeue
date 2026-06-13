# Use session events for synchronization

The Codex Plugin and Hosted Service synchronize through ordered session events rather than exchanging only current aggregate state. This gives the plugin a resumable boundary after disconnects, keeps participant and lifecycle changes auditable in the session record, and lets both sides derive current room state without making the Hosted Service authoritative for repo-grounded question advancement.
