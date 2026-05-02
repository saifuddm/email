# Personal Webmail on Cloudflare — Build Guide

A personal email client running entirely on Cloudflare, replacing Google Workspace. Built as a learning project to get hands-on with Workers, D1, R2, Queues, and email infrastructure end-to-end.

---

## Goals & non-goals

**Goals**
- Receive and read email at `you@yourdomain` in a self-hosted web UI
- Send and reply with correct threading
- Run the whole thing on Cloudflare for ~$5/mo
- Learn the full stack: DNS, MIME, queues, storage, FTS, auth

**Non-goals (for v1)**
- Multi-user / multi-tenant
- IMAP/SMTP server (no native-client access in v1)
- Calendar, contacts, drive
- Mobile native app
- Spam filtering beyond what Cloudflare provides

---

## Architecture

### Inbound path

```
Domain MX → Cloudflare Email Routing
         → Email Worker (catch-all)
            1. stream message.raw → R2 (raw/{uuid}.eml)
            2. enqueue job → Cloudflare Queue
         → Consumer Worker
            1. fetch raw from R2
            2. parse MIME (postal-mime — Workers-compatible)
            3. extract attachments → R2 (attachments/{uuid})
            4. write rows to D1 (threads, messages, attachments)
            5. update FTS index
            6. (optional) ping Durable Object → SSE to client
```

**Why the queue:** Email Workers have a 50 ms CPU / 128 MB cap. You don't want to lose mail if parsing throws on a weird MIME tree. Enqueue first, parse in the consumer where you have real CPU and retries.

### Outbound path

```
Web UI → API Worker (Hono)
       → Cloudflare Email Sending REST API (from: you@yourdomain)
       → on success, persist as a "sent" message in D1 + R2
```

Set `Message-ID`, `In-Reply-To`, and `References` headers yourself so replies thread correctly on both sides.

---

## Stack

| Concern | Pick | Why |
|---|---|---|
| Router / API | **Hono on Workers** | Tiny, Workers-native, no Node deps |
| DB | **D1** | 5 GB free, FTS5 built in |
| Blobs | **R2** | 10 GB free, no egress fees |
| Queue | **Cloudflare Queues** | Included with Workers Paid |
| Frontend | **SvelteKit on Pages** (or Next.js) | Either works; Svelte keeps the bundle small |
| Auth (single-user) | **WebAuthn passkey** + signed cookie | No passwords; magic links once Sending works |
| MIME parsing | **postal-mime** | Only parser I'd trust inside Workers |
| Realtime | **Durable Object → SSE** | Simpler than WebSocket for "new mail" pings |

---

## Cloudflare services & cost

| Piece | Service | Cost |
|---|---|---|
| Inbound | Email Routing | Free, unlimited (25 MiB max per message) |
| Outbound | Email Sending (beta) | $5/mo Workers Paid + 3k free, then $0.35 per 1k |
| Compute | Workers | Included in Paid plan |
| DB | D1 | 5 GB free |
| Blobs | R2 | 10 GB free, no egress |
| Frontend hosting | Pages | Free |

**Total expected cost:** ~$5/mo for personal use. Compare to Workspace at $7/mo.

**Constraint:** Cloudflare must be authoritative DNS for the domain.

---

## Data model (D1)

- `users` — id, email, created_at *(single row at first; keep the table for future)*
- `addresses` — id, user_id, address, is_primary *(your inbox + aliases)*
- `threads` — id, user_id, subject_normalized, last_message_at, message_count, participants_json
- `messages` — id, thread_id, rfc_message_id, in_reply_to, references_json, from_addr, to_json, cc_json, bcc_json, subject, snippet, body_text_r2_key, body_html_r2_key, raw_r2_key, direction (`inbound`/`outbound`), sent_at, received_at, is_read, is_starred, folder
- `attachments` — id, message_id, filename, content_type, size, r2_key, content_id
- `messages_fts` — FTS5 virtual table on (subject, snippet, body_text)

**Indexes to plan for:**
- `messages(thread_id, received_at)`
- `messages(folder, received_at)` for inbox view
- `threads(user_id, last_message_at desc)`

---

## R2 layout

```
raw/{uuid}.eml                    # original MIME, kept for export/replay
attachments/{message_id}/{uuid}   # extracted attachments
bodies/{message_id}/text          # parsed plain text body
bodies/{message_id}/html          # sanitized HTML body
```

Keeping raw `.eml` means you can always reparse if you change the parser, and it's a clean export path if you ever leave.

---

## DNS records (day one)

| Record | Value | Notes |
|---|---|---|
| `MX` | Cloudflare Routing endpoints | Auto-set via dashboard |
| `SPF` (TXT) | `v=spf1 include:_spf.mx.cloudflare.net ~all` | Confirm exact include string in Cloudflare docs |
| `DKIM` (TXT) | Provided by Cloudflare on Sending setup | One key per sending domain |
| `DMARC` (TXT) | `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain` | Start at `p=none`, tighten to `quarantine` then `reject` after a few weeks of clean reports |

---

## Auth

For v1 (just you):
- **Passkey via WebAuthn** — no passwords, no SMS, works on every modern device
- Signed JWT in an HTTP-only cookie after passkey ceremony
- Single user record in D1; no registration flow needed (seed it manually)

Once outbound is working, add **magic-link login** as a fun dogfood: send yourself a one-time link via your own Email Sending integration.

---

## v1 scope (ship this, then iterate)

1. Receive at `you@yourdomain` → list + read view
2. Send a new message
3. Reply with correct threading headers (`Message-ID`, `In-Reply-To`, `References`)
4. Archive / delete / mark-read
5. Attachment download
6. Search (D1 FTS5 over subject + snippet + body_text)

**Out of v1, candidates for v1.1+:**
- Drafts (autosave to D1 every N seconds)
- Labels / folders beyond inbox/archive/trash
- Filters / rules (run on inbound in the consumer Worker)
- Multi-address / aliases UI
- Push notifications (Web Push)
- Mobile-responsive polish
- Bounce / complaint dashboard
- Export-to-mbox

---

## Implementation order (suggested)

1. **DNS + Routing scaffold** — point your domain at Cloudflare, set up an Email Routing rule that forwards to your existing Gmail. Confirm mail arrives. *Lowest-risk first step; proves DNS is right before any code exists.*
2. **Email Worker that logs to console** — replace the forward rule with a Worker that just logs `from`, `subject`, `size`. Confirms you can intercept.
3. **R2 + Queue plumbing** — Worker streams raw to R2, enqueues a job; consumer Worker just logs the R2 key. No DB yet.
4. **D1 schema + parser** — consumer parses with `postal-mime` and writes rows. View results via `wrangler d1 execute`.
5. **Read-only web UI** — Hono API + SvelteKit list/read views. Hardcoded auth.
6. **Outbound** — verify your address with Cloudflare Email Sending, send a test message via REST API from a script, then wire the compose UI.
7. **Reply threading** — get `Message-ID` / `In-Reply-To` / `References` right; test against Gmail.
8. **Attachments** — download links via signed R2 URLs.
9. **Search** — FTS5 virtual table, populate on insert.
10. **Auth** — passkey flow; remove the hardcoded session.
11. **Cutover** — change MX from Gmail-forwarding to your-Worker-only. **Don't do this until you've used the system in parallel for at least a week.**

---

## Gotchas to expect

- **Deliverability warmup.** First month, expect Gmail/Outlook to spam-folder you. Send slowly, reply to real conversations, build reputation. This is true on any provider, not a Cloudflare-specific issue.
- **Cloudflare doesn't store email.** If your Worker throws before the enqueue, the message is gone. Push to the Queue *before* doing anything that can fail.
- **Worker limits on inbound.** 50 ms CPU, 128 MB memory. A 25 MB email with deep MIME nesting will blow past these — another reason to enqueue first, parse second.
- **Email Sending is beta.** Watch the changelog. Daily caps are based on "account standing" — vague but unlikely to bite a personal mailbox.
- **Free-tier sending only goes to verified addresses.** Fine for "just me" use; relevant if you ever invite others.
- **Reply quoting UI is its own rabbit hole.** Don't try to collapse quoted history in v1. Render the whole thread, ship it.
- **HTML email is hostile.** Sanitize aggressively (DOMPurify), render inside an iframe with `sandbox=""` (no allow-scripts), block remote images by default with a "show images" toggle for tracking-pixel hygiene.
- **Bounces & complaints.** Subscribe to whatever webhook Cloudflare exposes; store them. If you keep mailing a hard-bouncing address, your reputation tanks.
- **Don't cut over MX until you trust it.** Run in parallel (Routing forwards to Gmail *and* hits your Worker) for a week minimum.

---

## Things to read before / while building

- **Cloudflare Email Service docs** — `developers.cloudflare.com/email-service/`
- **Cloudflare Email Routing docs** — `developers.cloudflare.com/email-routing/`
- **postal-mime** — the MIME parser
- **JMAP spec** (RFC 8620 / 8621) — best modern reference for thread/message data models, even if you don't implement JMAP
- **RFC 5322** — internet message format (headers, encoding)
- **RFC 5598** — internet mail architecture (high-level mental model)
- **RFC 8617** — ARC (you don't need this v1, but useful when DMARC gets strict)

---

## Open questions to resolve as you go

- D1 vs external Postgres if the mailbox grows past a few GB — D1 has a 10 GB per-database limit; bodies live in R2 anyway, so D1 should hold metadata for years.
- Do you want IMAP eventually? If yes, design the schema so an IMAP gateway Worker is feasible later (UID per message per folder, etc.).
- Backup strategy: scheduled Worker that exports D1 + R2 to a separate bucket weekly?
- Encryption at rest for bodies? R2 is encrypted by Cloudflare, but client-side encryption is a different threat model and a much bigger project.

---

## Success criteria for v1

- I can read every email sent to my domain in my own UI within 10 seconds of arrival
- I can send a new email and a reply, and Gmail recipients see correct threading
- Attachments work both directions
- Search finds a message I remember by a keyword in the body
- I haven't logged into Workspace for a week and don't miss it
