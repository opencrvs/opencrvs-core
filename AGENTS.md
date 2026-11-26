# AGENTS.md — OpenCRVS Core

Guidance for AI coding agents working in this Node.js monorepo.

Docs: https://github.com/opencrvs/documentation

Prefer the existing docs for key concepts instead of re-deriving:

- **`ACTIONS.md`** — actions performed on an event record (core vs custom actions, event statuses, flag configurations, and action conditionals).
- **`ADMINISTRATIVE-HIERARCHY.md`** — administrative areas (jurisdictional hierarchy) vs locations (offices/health facilities)
- **`FORWARD-MERGE.md`** — how changes move from older release lines to newer lines and `develop`, and how to handle security fixes

## Related repos

Load these lazily when a task needs them:

- **`opencrvs-countryconfig`** — country configuration service, form/certificate templates
- **`opencrvs-farajaland`** — synthetic demo country for testing and E2E
- **`opencrvs-integrationland`** - demo country with integrations to 3rd party systems (e.g. MOSIP, E-Signet)
- **`mosip-api`** — MOSIP identity system integration

## Release lines and forward merges

Read `FORWARD-MERGE.md` before you work on a `release/X.Y.x` or `forward-merge/*` branch. The rules:

- Make a fix on the oldest supported release line that has the bug, not on `develop`. The forward-merge workflow carries it to the newer lines.
- Never merge `develop` or a newer line into an older line.
- On a `forward-merge/*` branch, keep the target line's code, behaviour and versions (`package.json`, Helm charts). Apply each change from the source line to the target line's code, and leave out a change that does not apply.
- Do not push a security fix under embargo to a public branch or PR. Use the advisory's private fork.
