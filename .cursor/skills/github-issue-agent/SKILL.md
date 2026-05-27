---
name: github-issue-agent
description: >-
  Process GitHub issues from saifuddm via webhook payloads. Assess scope,
  open clarification PRs when requirements are unclear, incorporate saifuddm's
  PR comments, then implement and commit to the PR branch. Use for all
  cursor-issue-agent automation runs.
---

# GitHub Issue Agent

You implement tasks from GitHub issues in `saifuddm/email`. Each run starts from a webhook payload sent by `.github/workflows/cursor-issue-agent.yml`. Treat the payload as the source of truth — do not call `gh issue view` or `gh issue list`.

## Payload fields

| Field | Meaning |
| --- | --- |
| `event_type` | `issue_opened` or `clarification_comment` |
| `repository` | e.g. `saifuddm/email` |
| `actor` | GitHub user who triggered the run (always `saifuddm`) |
| `issue.number` | Source issue number |
| `issue.title` | Issue title |
| `issue.body` | Issue description |
| `issue.url` | Link to the issue |
| `comment.body` | Present on `clarification_comment` — saifuddm's latest PR comment |
| `pull_request.head_ref` | Branch to check out on `clarification_comment` |
| `pull_request.url` | Link to the open PR |

## Workflow

### 1. Parse and assess (`issue_opened`)

Read `issue.title` and `issue.body`. Decide:

- **Clear and small enough** → run `/implement-issue` (see `.cursor/commands/implement-issue.md`).
- **Unclear, ambiguous, or too large** → run `/clarify-issue` (see `.cursor/commands/clarify-issue.md`), then use **Open pull request**.

### 2. Clarification PR (`/clarify-issue`)

When opening a clarification PR:

1. Branch: `cursor/issue-{issue.number}-clarify`
2. Base: `main`
3. Title: `[Clarification] Issue #{number}: {short title}`
4. Body: numbered questions, assumptions you need confirmed, and a proposed breakdown if the task is large
5. Label: add `cursor-agent` (required so follow-up comments re-trigger this automation)
6. Do **not** implement code yet — only ask questions

### 3. Incorporate answers (`clarification_comment`)

When `event_type` is `clarification_comment`:

1. Read `comment.body` as saifuddm's answer (ignore all other users)
2. Merge answers into an updated task spec (issue + all clarification so far)
3. If still ambiguous → update the PR description with remaining questions and post a short summary comment if needed
4. If clear → run `/implement-issue` on the **existing PR branch** (check out the branch tied to the open PR, do not start a new branch)

### 4. Implement (`/implement-issue`)

When implementing:

1. Explore the repo; match existing conventions
2. Make the smallest correct change set
3. Commit with messages like `fix: short summary (#123)`
4. Push to the PR branch
5. Update the PR body with: summary of changes, test plan, and `Closes #{issue.number}` when done

## Scope guardrails

- Only act on payloads where `actor` is `saifuddm`
- Do not expand scope beyond the issue + confirmed clarifications
- Prefer one PR per issue; reuse the clarification PR branch for implementation when possible
- If the task is genuinely too large for one PR, split into phased PRs and explain the plan in the PR body

## Repository notes

This repo is an email infrastructure study guide (`index.html`, `advanced.html`, Cloudflare/AWS submodules). Keep HTML/CSS/JS changes consistent with existing Lucide icon and lab styling patterns.
