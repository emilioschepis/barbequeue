# Use Durable Object-local persistence first

The Barbequeue prototype stores session events and current room projection in the session Durable Object's local SQLite storage before adding a global database such as D1. This keeps the tracer bullet small and preserves the one-session-owner model, while leaving global session indexing for v1 needs such as host authentication, account recovery, deletion controls, and cross-session dashboards.
