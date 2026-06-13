# Support session resume before host takeover

Barbequeue v1 supports session resume by the Codex Plugin before supporting multi-host takeover. A grilling session has one active host-side session driver at a time, and reconnecting that driver from the session record is required because participant rooms can continue accepting room-owned contributions while the plugin is offline.
