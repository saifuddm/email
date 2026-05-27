# Implement GitHub Issue

Requirements are clear enough to implement. Execute the task end to end.

Using the webhook payload and any clarification already received:

1. Restate the task in 2–3 sentences to confirm scope before coding.
2. Identify the files to change; read surrounding code first.
3. Implement the smallest correct solution — no drive-by refactors.
4. Commit with a message referencing the issue number, e.g. `feat: add inbox filter (#42)`.
5. Push to the PR branch:
   - New issue → branch `cursor/issue-{number}`
   - Continuing from clarification → the existing PR branch
6. Update the PR description with:
   - **Summary** of what changed
   - **Test plan** checklist
   - `Closes #{issue.number}` when the issue is fully resolved
7. If you cannot finish in one pass, push what you have and list remaining work in the PR body.
