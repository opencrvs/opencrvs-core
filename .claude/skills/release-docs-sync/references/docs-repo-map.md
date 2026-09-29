# Core → documentation map

Where a core change should show up in `opencrvs/documentation`. Paths are relative to the version directory (`v2.1.0/`). Built from `v2.1.0/SUMMARY.md`. If a later version reorganises pages, update this file from its `SUMMARY.md`.

The docs have three audiences, and one change often touches more than one:

- **functional/** — what the product does (product owners, implementers)
- **technical/guides/** — how to configure, deploy and operate it (country developers, ops)
- **implementation/** — how to run a country project (project leads)

## By core area

| Core area (signal file) | Pages to check |
| --- | --- |
| **Upgrade / breaking changes** (changelog `Upgrade guidance`, `Breaking changes`, `Deprecations`) | `technical/guides/version-upgrades.md`, `implementation/your-opencrvs-project/version-upgrades.md`, `releases/release-notes.md` |
| **Env vars, compose, Helm** (`env-and-deploy`, `env-vars.txt`) | `technical/guides/installation/deploy-set-up-a-server-hosted-environment/create-a-github-environment/environment-secrets-and-variables-explained.md`, `…/deploy/*`, `…/pre-deployment-checklist.md`, `technical/guides/installation/advanced-topics/*` (external data stores, network policy), `technical/architecture/infrastructure.md` |
| **Data stores** (MongoDB/Influx/Elasticsearch/Postgres changes, `migrations`) | `technical/architecture/technical-stack.md`, `technical/architecture/data-architecture.md`, `technical/guides/installation/opencrvs-maintenance-tasks/backup-and-restore/*`, `…/run-backup-and-restore.md`, `technical/guides/installation/advanced-topics/elasticsearch-disk-management.md`, `…/deploy-opencrvs-with-external-data-stores.md` |
| **Scopes, roles, auth, tokens** (`scopes-and-roles`) | `technical/guides/configuration/users/roles-and-scopes.md`, `…/users/how-to-configure-scopes.md`, `…/users/how-*-map-to-*.md`, `functional/markdown/access/security.md`, `functional/markdown/access/user-management.md`, `technical/architecture/security.md` |
| **Event config: forms, fields, actions, flags, conditionals** (`event-config`) | `technical/guides/configuration/events/**` (declaration-and-forms, actions/core-actions, actions/custom-actions, flags, conditionals, summary), `functional/markdown/events/*`, `functional/markdown/workflows/actions.md`, `functional/markdown/records/flags.md`, `technical/apis/toolkit/conditionals.md` |
| **Toolkit public API** (`toolkit-api`) | `technical/apis/toolkit/**` (configuration, advanced-search, conditionals, deduplication, api-client) |
| **Events API / gateway routes** (`events-api`) | `technical/apis/core-apis/README.md` and the GitBook OpenAPI spec (`spec: events-vNN`, **manual in GitBook**), `technical/architecture/integration-architecture.md` |
| **Countryconfig contract** (`countryconfig-contract`) | `technical/apis/country-config-apis/README.md` and GitBook spec (`spec: cc-vNN`, **manual**), `technical/guides/configuration/README.md`, `implementation/your-opencrvs-project/configuration.md` |
| **Integrations, system clients, MOSIP, webhooks** (`integrations`) | `technical/guides/configuration/integrations/**` (create-a-client, authenticate-a-client, integration-*, mosip-*, verifiable-credentials), `functional/markdown/interoperability/*` |
| **Action triggers / async actions / notifications** | `technical/guides/configuration/action-triggers/**`, `functional/markdown/interoperability/action-triggers.md`, `functional/markdown/workflows/communications.md`, `technical/guides/configuration/3.2.9.1-managing-language-content/*` |
| **Search, workqueues, indexing** (`search-and-workqueues`) | `technical/guides/configuration/workqueues.md`, `functional/markdown/workflows/workqueues.md`, `functional/markdown/search/*`, `technical/apis/toolkit/configuration/advanced-search.md` |
| **Certificates** (`certificates`) | `technical/guides/configuration/certificates/**`, `functional/markdown/records/certificates.md`, `implementation/…/guides/guide-certificate-configuration.md` |
| **Locations / administrative areas** (`locations`) | `technical/guides/configuration/administrative-hierarchy/**`, `functional/markdown/workflows/administrative-structure/**`, `technical/guides/configuration/integrations/integration-location-management.md` |
| **Deduplication** | `functional/markdown/workflows/deduplication.md`, `technical/apis/toolkit/deduplication.md` |
| **Sealed records** | `functional/markdown/records/sealed-records.md`, `technical/guides/use-cases/sealed-records.md` |
| **Dashboards / analytics / metrics** | `technical/guides/configuration/dashboards.md`, `functional/markdown/aggregated-data/*` |
| **Monitoring, logging, telemetry** (e.g. Sentry removal) | `technical/guides/monitoring/**`, `technical/architecture/telemetry.md`, `implementation/your-opencrvs-project/monitoring.md` |
| **Legacy data migration** | `technical/guides/data-migration.md`, `functional/markdown/legacy-data/*`, `implementation/your-opencrvs-project/migrate-legacy-data.md` |
| **Client UX (workflows, offline, review pages)** | `functional/markdown/workflows/*`, `functional/markdown/records/*`. Most client bug fixes are n/a. |
| **Core development setup** (monorepo tooling, pnpm/nx, dev scripts) | `technical/guides/contributing/core-development.md` |
| **Auth: tokens, sessions, account recovery** | `technical/architecture/standards.md` §5, `technical/architecture/security.md`, `functional/markdown/access/security.md`, `technical/architecture/README.md` (Redis), `technical/guides/configuration/action-triggers/**` (user triggers + email templates) |
| **Async action confirmation** | `technical/guides/configuration/action-triggers/action-confirmation.md`, `technical/architecture/integration-architecture.md`, `functional/markdown/interoperability/{action-triggers,apis}.md` |
| **New scopes** (any `scopes.ts` addition) | `technical/guides/configuration/integrations/create-a-client.md` scope table, `technical/guides/configuration/users/*`, `functional/markdown/workflows/users.md` scope tables |
| **Audit history labels** (renamed or new action types) | `functional/markdown/records/audit.md` |
| **Toolkit upgrade codemods** (`packages/toolkit/src/migrations/v<version>/`) | `technical/guides/version-upgrades.md` "Version-specific notes", `releases/release-notes.md` — one bullet per codemod saying what it changes |
| **Data seeding** (`packages/data-seeder`) | `technical/guides/installation/opencrvs-maintenance-tasks/seeding-a-server-environment.md` |
| **Infrastructure repo** (`opencrvs/infrastructure`: Ansible, workflows, `yarn environment:*`) | `…/deploy-set-up-a-server-hosted-environment/**` (secrets page, create-a-github-environment, provisioning-servers), `technical/guides/installation/advanced-topics/{ssh-access,kubernetes-cluster-access,disk-space-management}.md`. Not in core: read `origin/develop` of a local `infrastructure` checkout. |
| **Helm chart values** (`charts/**/values.yaml`, toolkit `templates/charts-values/**`) | `technical/guides/installation/advanced-topics/{kubernetes-network-policy,ip-allowlisting,kubernetes-service-accounts,air-gap-installation}.md`, `…/deploy/running-a-dependencies-deployment.md`, backup-and-restore pages |

## Other changelogs to read

The root `CHANGELOG.md` is not the whole story. Also read the release section of `packages/countryconfig-template/CHANGELOG.md` and `packages/mosip-api/CHANGELOG.md` (its `## Unreleased` section until release). MOSIP env var changes are only recorded there.

## Version links

Pages link to core source with a pinned ref. Point them at the release tag (`blob/v<version>/…`), not `develop` or an older beta tag.

## Usually n/a

Test-only changes, CI, dependency bumps without behaviour change, `packages/testland` (internal test country), mocks (`esignet-mock`, `mosip-mock`), and client bug fixes that restore already-documented behaviour. Security fixes are n/a for the docs unless they change configuration or API behaviour. Advisories are published separately.
