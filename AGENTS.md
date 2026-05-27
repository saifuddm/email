# AGENTS.md

## Cursor Cloud specific instructions

This repository is a **static HTML study plan** for learning about building personal email infrastructure. The primary deliverable is `index.html` (and `advanced.html`) — plain HTML/CSS/JS with no build step, no dependencies, and no backend.

### Running the study plan

Serve the repo root with any static file server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/index.html` in a browser. Progress checkboxes persist in `localStorage`.

### Repository layout

- `index.html` / `advanced.html` — interactive study plan pages (the actual product)
- `cloudflare/agentic-inbox/` — git submodule pointing to the upstream [cloudflare/agentic-inbox](https://github.com/cloudflare/agentic-inbox) reference app (read-only reference; NOT the app being developed here)
- `aws/inbox/` — empty scaffold for a future AWS SES implementation
- `GUIDE.md` — design notes for the Cloudflare email architecture

### Important notes

- There is **no package.json, no build step, no linting, and no tests** for the study plan HTML. Changes are validated by opening the HTML files in a browser.
- The `cloudflare/agentic-inbox` submodule is for reference only. Running it locally requires a Cloudflare account and `npm run dev` inside that directory (with `remoteBindings: false` added to `vite.config.ts` if no Cloudflare credentials are available).
- Do not modify files inside `cloudflare/agentic-inbox/` — it tracks an upstream repository.
