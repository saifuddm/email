# Email learning lab

Structured study workspace for building a personal mailbox on **Cloudflare** (via [agentic-inbox](https://github.com/cloudflare/agentic-inbox)) and porting the same ideas to **AWS SES**.

## Start here

Open **[index.html](./index.html)** in your browser — interactive study plan with dark mode, progress checkboxes, and all 16 study sections.

Answer study questions in your **Obsidian** notebook (or any notes app).

## Layout

```
email/
├── index.html             ← primary study plan (HTML)
├── GUIDE.md               ← original Cloudflare design notes & gotchas
├── cloudflare/
│   └── agentic-inbox/     ← cloned upstream reference app
└── aws/
    └── inbox/             ← your SES implementation (build in Track 2)
```

## Tracks

1. **Cloudflare** — deploy and study agentic-inbox, then build a minimal clone
2. **AWS SES** — same v1 feature set using SES, S3, Lambda, DynamoDB

Complete Track 1 before Track 2.

## Reference

- [cloudflare/agentic-inbox](https://github.com/cloudflare/agentic-inbox) — cloned in `cloudflare/agentic-inbox/`
- [Email for Agents (blog)](https://blog.cloudflare.com/email-for-agents/)
- No official AWS inbox app — partial repos listed in `index.html` → External repos
