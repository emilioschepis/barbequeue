# Use a per-session state owner

The Hosted Service coordinates each grilling session through a single per-session state owner rather than treating session updates as independent stateless writes. This gives Barbequeue one place to order session events, maintain the current participant room projection, support plugin resume by event cursor, and avoid races between participant contributions, consensus changes, and plugin-published lifecycle events.
