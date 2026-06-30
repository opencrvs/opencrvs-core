# AGENTS.md — OpenCRVS Core

Guidance for AI coding agents working in this repository. Read this before making changes.

## Project overview

OpenCRVS is a **digital public good for civil registration and vital statistics (CRVS)** — the software that registers births, deaths, and marriages. It is real-world software used by governments, so the data it handles is highly sensitive personal information. Licensed under **MPL-2.0**. Version 2.0 introduces an **event-sourced architecture** (see _Key domain concepts_).

- Docs: https://documentation.opencrvs.org · Website: https://www.opencrvs.org · See also `README.md`.

## Architecture & monorepo layout

Lerna + Yarn workspaces monorepo (`packages/*`). **Node** version pinned in `.nvmrc`. TypeScript throughout.

| Package           | Role                                                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client`, `login` | Frontend apps — React + Vite (tests via Vitest)                                                                                                                           |
| `components`      | Shared UI component library (`@opencrvs/components`)                                                                                                                      |
| `gateway`         | API gateway — Hapi + GraphQL; fronts the backend services                                                                                                                 |
| `auth`            | Authentication / token issuance (Hapi, Redis)                                                                                                                             |
| `events`          | **Main event service** — tRPC, Postgres (Kysely, `kanel`-generated types), Elasticsearch. Current DB schema snapshot: `packages/events/src/tests/postgres-migrations.sql` |
| `documents`       | Hapi-service. Document storage                                                                                                                                            |
| `commons`         | Shared library (`@opencrvs/commons`) used across packages                                                                                                                 |
| `toolkit`         | SDK for building country configurations (tRPC); includes `create-countryconfig`                                                                                           |
| `data-seeder`     | Seeds reference data with Farajaland (synthetic) data                                                                                                                     |
| `migration`       | Database migrations                                                                                                                                                       |
| `api-docs`        | API documentation                                                                                                                                                         |

Data stores in play: **Postgres** (Kysely in `events`), **Elasticsearch** (`events`), **Redis** (`auth`), and **MinIO** (`documents`). **MongoDB** and **InfluxDB** remain only in `migration`, which moves legacy data into Postgres.

## Key domain concepts

Prefer the existing docs over re-deriving these:

- **`ACTIONS.md`** — actions performed on an event record (core vs custom actions, event statuses, flag configurations, and action conditionals).
- **`ADMINISTRATIVE-HIERARCHY.md`** — administrative areas (jurisdictional hierarchy) vs locations (offices/health facilities); every user belongs to a location.

## Common commands (root `package.json`)

- `yarn dev` — run the full stack (`development-environment/dev.sh`).
- `yarn compose:deps` — start Docker dependencies (Postgres, ES, Mongo, etc.).
- `yarn test` — run all package tests. Most packages run `test:compilation` (`tsc --noEmit`) **before** the test runner. Test runner is **Jest** in the older services and **Vitest** in `client` / `events`. Run a single package's tests with `yarn test` inside `packages/<name>`.
- `yarn lint` — ESLint across packages (configured with `--max-warnings=0`).
- `yarn build` — build all packages.

## Conventions

- **TypeScript** everywhere. **ESLint** (`eslint.config.js` + per-package configs), **Prettier** (`.prettierrc`). Lint must pass with zero warnings.
- **License header is mandatory** on every source file (`license-header.txt`, MPL-2.0). Run `yarn add:license` to add it; the pre-commit hook (`.husky/`) runs `yarn check:license` and `lint-staged`.
- **Branch names** must match `^[a-z][a-z0-9\/\-]{1,29}$` (enforced by a husky hook). Examples: `ocrvs-12345`, `fix-login`, `feature/foo-bar`.
- Contribution flow: see `CONTRIBUTING.md` (fork → branch → PR → review).

## Safety & data handling — read carefully

This is production civil-registration software. **Treat all registration data as sensitive PII.** The rules below are the human-readable summary; the **enforced source of truth** is `.claude/settings.json`. Do not attempt to work around them.

- **Never read** secret/PII paths — these are blocked by deny rules and must stay that way:
  `.env` / `.env.*`, `**/.secrets/**`, `**/credentials/**`, `**/data-seeding/**`, `**/*.pem`, `**/*.key`, `**/id_rsa`, `**/id_ed25519`.
- **Never** output, log, paste, or commit real personal data. Use **synthetic data only** (the Farajaland reference configuration).
- **Never** `sudo` or `ssh` — these are blocked.
- Do not commit secrets, credentials, or PII. The repo ships nothing sensitive in tracked files — keep it that way.
- Report security vulnerabilities per `SECURITY.md` (email `team@opencrvs.org`); do not disclose them publicly or in commits/PRs.

## Related repos

Load these lazily when a task needs them:

- **`opencrvs-countryconfig`** — country configuration service, form/certificate templates
- **`opencrvs-farajaland`** — synthetic demo country for testing and E2E
- **`mosip-api`** — MOSIP identity system integration
