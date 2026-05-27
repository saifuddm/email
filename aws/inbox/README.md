# AWS inbox — scaffold

Implementation home for Track 2. Empty until you start the AWS phase.

## Suggested layout (create as you build)

```
inbox/
├── infra/           # CDK or Terraform (SES, S3, DynamoDB, Lambda, API GW)
├── functions/
│   ├── inbound/     # Parse MIME from S3, write DynamoDB
│   ├── api/         # List, read, send, search
│   └── outbound/    # SendRawEmail helper
├── web/             # React inbox UI
└── shared/          # Types, threading helpers (port from CF study)
```

## First commands (when ready)

```bash
# Example — adjust for your IaC choice
cd infra
# cdk deploy  OR  terraform apply
```

## Parity checklist

Mirror the v1 checklist in [STUDY_PLAN.md](../../STUDY_PLAN.md). Log progress in [COMPARE.md](../../COMPARE.md).
