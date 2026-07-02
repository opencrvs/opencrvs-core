# AGENTS.md — OpenCRVS Core

Guidance for AI coding agents working in this Node.js monorepo.

Docs: https://documentation.opencrvs.org

Prefer the existing docs for key concepts instead of re-deriving:

- **`ACTIONS.md`** — actions performed on an event record (core vs custom actions, event statuses, flag configurations, and action conditionals).
- **`ADMINISTRATIVE-HIERARCHY.md`** — administrative areas (jurisdictional hierarchy) vs locations (offices/health facilities)

## Related repos

Load these lazily when a task needs them:

- **`opencrvs-countryconfig`** — country configuration service, form/certificate templates
- **`opencrvs-farajaland`** — synthetic demo country for testing and E2E
- **`opencrvs-integrationland`** - demo country with integrations to 3rd party systems (e.g. MOSIP, E-Signet)
- **`mosip-api`** — MOSIP identity system integration
