# E2E tests

Sample [Playwright](https://playwright.dev) tests for your country configuration. Replace or extend `login.e2e.ts` with tests that cover your own forms, workqueues and certificates. Name test files `*.e2e.ts`: Playwright only runs those, and vitest (`pnpm test`) ignores them.

## Run locally

Against the local Tilt environment, press the trigger button of the `e2e-tests` resource (under `6.Tests`) in the Tilt UI, or run:

```bash
pnpm e2e
```

Same command with UI:

```bash
pnpm e2e --ui
```

Against a deployed environment:

```bash
SCHEME=https DOMAIN=<your-environment-domain> pnpm e2e
```

| Variable                       | Default              | Description                                                                                     |
| ------------------------------ | -------------------- | ----------------------------------------------------------------------------------------------- |
| `DOMAIN`                       | `opencrvs.localhost` | Domain after the `login.` and `register.` and other subdomains. |
| `SCHEME`                       | `http`               | URL scheme                                                                                      |
| `E2E_USERNAME`, `E2E_PASSWORD` | `c.lungu` / `test`   | User from `src/data-seeding/employees/source/default-employees.csv`                             |
