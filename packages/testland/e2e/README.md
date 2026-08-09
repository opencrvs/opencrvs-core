# e2e testing

### Run against a local environment

From the repository root:

```
pnpm e2e:dev            # the environment this git worktree owns
pnpm e2e:dev --env foo  # a named environment (pnpm env:list shows them)
```

This is the entry point to use. Every local environment has its own ports and
its own database (see `docs/adr/0003-multiple-local-environments.md`), and
`pnpm e2e:dev` loads that environment's contract before starting Playwright, so
the suite drives the stack you meant. `packages/dev-cli` owns the arithmetic;
`constants.ts` only reads `CLIENT_APP_URL`, `LOGIN_URL`, `GATEWAY_URL`,
`AUTH_URL` and `METABASE_PORT` out of the contract.

`pnpm --filter @opencrvs/testland e2e-dev` still works and keeps its name. With
no contract in the shell it falls back to slot 0's ports, which is right in a
single checkout and in CI — and wrong in a linked worktree, where it silently
creates declarations, users and corrections in the primary environment's
database and still passes. That is what `pnpm e2e:dev` exists to prevent.

### Run against a deployed environment

`NODE_TLS_REJECT_UNAUTHORIZED=0 DOMAIN=<your-env>.opencrvs.dev pnpm e2e`

`e2e` and `e2e-win` target the deployed domain and are not local-environment
consumers.

### Dashboard specs

`testcases/dashboard` is excluded unless `DASHBOARD_E2E=true`, and needs a
Metabase started by hand:

```
pnpm --filter @opencrvs/testland metabase
```

`run-dev.sh` reads `METABASE_PORT` and `TARGET_DB` from the contract, so it
serves on the calling environment's port against that environment's database.
Load the contract into the shell first — either start it from a shell where
`pnpm dev` exported it, or `eval "$(pnpm --silent env:lookup)"` (add
`--env <name>` for another environment).

## How to write a test

[See how to write a test that is not flaky](./HOW-TO-WRITE-A-TEST.md)

## How E2E CI sharding works

[See how CI shards are planned and run](./SHARDING.md)

## How to debug E2E tests on CI

1. Go to E2E repository https://github.com/opencrvs/e2e
2. Find the `Deploy & run E2E` action run that failed
3. Locate the failing test(s)
4. Under `upload-artifact` step, download the artifact
5. Unzip the downloaded artifact

   ### CLI approach

   6. run `npx playwright show-report path-to-unzipped-report` and open the link (`Serving HTML report at http://localhost:9323.`)
   7. Select the failing test
   8. Detailed view of the case is opened
   9. Further down, you see screenshots taken during the failure and trace.
   10. Click `trace` thubmnail

   ### Click through UI approach

   6. Open the `index.html` file in browser
   7. Select the failing test
   8. Detailed view of the case is opened
   9. Further down, you see screenshots taken during the failure and trace.
   10. Download `trace`
   11. Open browser, go to https://trace.playwright.dev
   12. Open the previously downloaded trace .zip

You are now able to debug the failed test case as it would have happened on your local environment

![alt text](e2e-debug-steps.png 'E2E debug steps')
