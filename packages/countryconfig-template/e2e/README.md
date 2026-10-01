# E2E tests

Sample [Playwright](https://playwright.dev) tests for your country configuration. Replace or extend `login.e2e.ts` with tests that cover your own forms, workqueues and certificates. Name test files `*.e2e.ts`: Playwright only runs those, and vitest (`pnpm test`) ignores them.

## Run locally

Against the local Tilt environment, press the trigger button of the `e2e-tests` resource (under `6.Tests`) in the Tilt UI, or run:

```bash
DOMAIN=opencrvs.localhost SCHEME=http pnpm e2e
```

Against services started with `pnpm dev` on localhost ports:

```bash
pnpm e2e:dev
```

Against a deployed environment:

```bash
DOMAIN=<your-environment-domain> pnpm e2e
```

| Variable                       | Default            | Description                                                         |
| ------------------------------ | ------------------ | ------------------------------------------------------------------- |
| `DOMAIN`                       | `localhost`        | Domain after the `login.`, `gateway.` and other subdomains          |
| `SCHEME`                       | `https`            | URL scheme                                                          |
| `E2E_USERNAME`, `E2E_PASSWORD` | `c.lungu` / `test` | User from `src/data-seeding/employees/source/default-employees.csv` |

## Run after every deployment

1. Run `environment:init` in your infrastructure repository and answer **yes** to _"Would you like to configure e2e tests for this environment?"_. This stores `E2E_ENABLED=true` on the GitHub environment and this repository as `COUNTRYCONFIG_REPOSITORY`.
2. The infrastructure `deploy-opencrvs.yml` workflow then calls `e2e.yml`, which checks out this repository, runs `pnpm e2e` against the environment's `DOMAIN` and uploads the HTML report as a workflow artifact.

E2E tests usually create records, so `environment:init` only offers them for environments without PII data, and never for staging or production.
