## Add this for newly created spec to track and delete the event

trackAndDeleteCreatedEvents()

## Which server to run against

Prefer `https://login.e2e.opencrvs.dev` (i.e. `DOMAIN=e2e.opencrvs.dev`) when
running this folder's specs, especially the full 26-file "Birth-Death form"
suite serially. `e2e.opencrvs.dev` is actually the default in
`packages/testland/e2e/constants.ts` (`DOMAIN = process.env.DOMAIN ||
'e2e.opencrvs.dev'`), so it's enough to just not set `DOMAIN`:

```bash
npx playwright test "qa-testrail-testcases/Birth-Death form" --workers=1
```

`https://register.qa.opencrvs.dev` (`DOMAIN=qa.opencrvs.dev`) is a shared QA
server whose gateway rate-limits `/auth/authenticate` to 10 requests/minute
per username - running many tests serially against it (each test does at
least one login, often two counting `trackAndDeleteCreatedEvents()`'s own
cleanup login) trips that limit and cascades into unrelated login failures
across the suite. The `e2e.opencrvs.dev` server doesn't hit this.

## Local-only helpers

`Birth-Death form/helpers.ts` holds a local `selectLocationOption` used only
by files in this folder - it's a copy of `e2e/utils.ts`'s version with an
exact-text match added, since the shared version's substring match is
ambiguous for "Ibombo" (it also matches "Ibombo-north (old)" /
"Ibombo-south (new)"). Kept local rather than editing the shared
`e2e/utils.ts`, which other specs outside this folder depend on.
