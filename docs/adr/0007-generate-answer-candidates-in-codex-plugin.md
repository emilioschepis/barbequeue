# Generate answer candidates in the Codex Plugin

Barbequeue generates and revises answer candidates through the Codex Plugin rather than in the Hosted Service. This keeps repo-grounded synthesis with the host-side session driver, avoids sending raw repository files to the hosted boundary, and lets the Hosted Service focus on storing and presenting candidates, contributions, consensus states, and session records.
