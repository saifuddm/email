# AWS track

| Path | Purpose |
|------|---------|
| `inbox/` | Your SES mailbox (build during Track 2) |
| Study sections 01–08 | In [index.html](../index.html) (sidebar: Track 2) |

Finish Cloudflare Track 1 Phase 2 before starting AWS sections.

## Planned stack (v1)

- Inbound: SES receipt rule → S3 → SNS → Lambda
- Metadata: DynamoDB
- Blobs: S3
- Outbound: SES SendRawEmail
- API: API Gateway + Lambda
- UI: React
- Auth: Cognito or API key

See `index.html` → Track 2 for phases and milestones.
