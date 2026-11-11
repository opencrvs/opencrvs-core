# Pull request guidelines

These rules apply to every pull request in opencrvs-core. They come from the review comments on the 2026 pull requests. Each rule is a request that reviewers made in more than one PR, or that a reviewer stated as a general norm.

Authors: check your PR against this page before you ask for a review. Reviewers: link to the rule (each heading has an anchor) instead of writing the reason again.

Related documents:

- [`CONTEXT.md`](../CONTEXT.md): the domain terms. Use them in code, tests and PR text.
- [`docs/adr/`](adr/): architectural decisions.
- [`packages/client/src/v2-events/STYLEGUIDE.md`](../packages/client/src/v2-events/STYLEGUIDE.md): naming of files, zod schemas, interfaces and functions.
- [`packages/migration/STYLEGUIDE.md`](../packages/migration/STYLEGUIDE.md): naming of migrations.
- [`packages/testland/e2e/HOW-TO-WRITE-A-TEST.md`](../packages/testland/e2e/HOW-TO-WRITE-A-TEST.md): e2e tests that are not flaky.
- [`CLAUDE.md`](../CLAUDE.md): the language rules for PR descriptions, commits and comments on GitHub.

## The short version

1. One concern in each PR. Put other findings in an issue.
2. Fix the root cause. Explain in the description what the problem was and why the fix is correct.
3. Every change of behaviour has a test. A test for a bug fix fails without the fix.
4. Tell countries what they must do: a CHANGELOG entry, the updated `countryconfig-template` and `testland`, and a codemod if config changes.
5. Do not put country-specific values or vendor lock-in into core.
6. Check authorization on the server. Read the identity from the token, not from the payload.
7. Do not cast. Parse at the boundary and make illegal states impossible in the types.
8. Fail loudly. Do not skip bad data or hide an error.
9. Reuse the helpers that exist. Delete the code that nothing uses.
10. A comment says why. Delete comments that repeat the code or are no longer true.
11. Do not edit a migration that may have already run. Write migrations assuming it will run against a live environment with real data. Write queries assuming there can be millions of rows. 
12. Read all the code, comments and text that an agent wrote before you ask a person to review it.

## What the tooling already checks

Do not use review time on these. The tools report them.

- Formatting: Prettier, through `lint-staged` in the pre-commit hook.
- License header on every source file: `pnpm check:license` in the pre-commit hook.
- Branch names: the pre-push hook.
- New unused exports and files: the `lint-knip` job compares the PR with its base branch.
- ESLint. In the events service and the v2 client, this includes no non-null assertion, exhaustive `switch`, no top-level arrow functions, `curly` and the rules of hooks. In CI it also includes `no-floating-promises` and `require-await`.
- Postgres migrations: the `check-postgres-migrations` workflow.

If a review comment repeats in many PRs and a tool can check it, add a lint rule. A rule in a tool is better than a rule on this page.

---

## 1. Scope and description of the PR

### 1.1 Keep each PR to one concern

Do not mix unrelated fixes, refactors or nice-to-have changes into a PR. Open a separate PR or an issue for them. If the fix has an effect on a lot of other code, stop and open an issue. Every `TODO` or `FIXME` that you add links to an issue.

### 1.2 Fix the root cause

Find out why the bug happens before you change core behaviour. Reproduce it first, mainly for a patch release. Do not hide a problem with a workaround in a different layer. If a workaround is necessary, say why in the description and open an issue for the cause.

### 1.3 Write a short description that a reviewer can check

- Describe which problem the PR solves. For a bug fix, give the root cause. If you are working on an issue, link it to the pull request. 
- Say why the solution is correct. Reviewers read the code, so do not describe each change in it.
- Explain every changed default, limit or constant. Reviewers will ask "is this intentional?".
- Add before and after screenshots, or a recording, for a UI change.
- Check the acceptance criteria in the issue. If the PR does not meet one of them, say so.
- Give the PR a title that describes the change. The title becomes the squash commit.

### 1.4 Show a passing e2e run before merge

Post a link to a passing e2e run in the PR. For a UI change, a Chromatic link helps too. If the fix needs a new e2e case, add it in `packages/testland/e2e` in the same PR.

### 1.5 Use the correct base branch

- A fix for a released version goes to the next patch branch of that line, not to a branch that is already released.
- A fix that the live release lines need is backported to them.
- A risky refactor with no user benefit waits until `develop` is on the next release line.

### 1.6 Review the output of agents yourself first

Read all the code, comments, tests and descriptions that an agent wrote before you ask a person to review them. Remove the comments that are not true or not useful. A bot review finding is a suggestion. Check it before you act on it, and say so if it is wrong.

---

## 2. Countries and backwards compatibility

### 2.1 Keep core generic

Core must work for every country without changes in core. Do not hardcode values that a country configures, such as role names (`FIELD_AGENT`), location types (`CRVS_OFFICE`, `HEALTH_FACILITY`) or the phone number pattern. Read them from the country config. Logic that only one country needs belongs in that country's config.

Do not tie core or the toolkit to one vendor or product. Countries cannot change the toolkit, so a dependency on Docker Hub there blocks every country that uses a different registry. In the same way, core services do not depend on MinIO. Do not name a specific product (for example MOSIP) in events or client code.

### 2.2 Do not change what existing config means

- Add a new field instead of giving an existing field a new meaning.
- A new option has a default that keeps the current behaviour for existing countries.
- One config option controls one thing. Do not let a boolean control two behaviours.
- Each action has its own configuration. One action never reuses the config of another action implicitly.

### 2.3 Deprecate before you remove

When the format of config or of a public API changes, keep the old format working for one release:

- Read the old format next to the new one, and log a deprecation warning.
- Add a toolkit codemod that rewrites the old format. The codemod logs a warning for every case that it cannot rewrite.
- Mark the old field `@deprecated`, and name the version that removes it.
- Mark temporary compatibility code with the version that removes it, and open an issue for the removal.

### 2.4 Write a CHANGELOG entry for every change that a country implementer sees

This includes changes to config, to the output of a public API, to scopes, to translation keys and to defaults.

- Put the entry under the correct release and section (breaking changes, new features, improvements, bug fixes, security). Link the issue in the same format as the other entries.
- For a breaking change, say what to use instead, why, and the exact steps. A diff or config example helps.
- Document a breaking change, or a change that requires manual intervention to the top of its section.
- When the PR changes behaviour, check that the existing entries are still correct.

### 2.5 Update `countryconfig-template` and `testland` in the same PR

When core changes something that a country config uses, update `packages/countryconfig-template` and `packages/testland` in the same PR. This includes config, docs and the translation CSVs. If other repositories need a change (farajaland, infrastructure, e2e), link those PRs.

### 2.6 When you remove a feature, remove all of it

Remove the dependency, the environment variables, the endpoints, the Docker Compose entries, the e2e and infrastructure references and the translations. Only the migrations can still name it.

---

## 3. Security and authorization

### 3.1 Check authorization on the server

Every permission check happens in the service that owns the data. When the client hides a button, that is a UX choice. It does not give security. Deny by default. If a PR finds a check that exists only in the client, fix it or open an issue.

For each route, access check is run as middleware, separate from the service logic. In the events package, utilise the existing ones from `packages/events/src/router/middleware`.

### 3.2 Read the identity from the token

Never trust the payload. Always read the identifiers from the token.

Avoid defining APIs which require multiple identifiers as payload.
- `/:eventId/files` access can be validated based on scopes in a token.
- `/:eventId/:fileId` access cannot be validated based on scopes alone but requires additional check that file belongs to an event.
- Get the acting user or client from the token or the tRPC context, not from the request payload.
- If the payload must name a user, check that user against the scopes of the token. Use the procedure type that matches the caller. Do not expose endpoint to a system user if it is only used through client.


### 3.3 Do not show that a resource exists

Return the same response for "not found" and "forbidden". Check the permission before you check if the resource exists, so that a caller cannot test which ids exist.

### 3.4 Do not trust internal callers

- Validate the input from other OpenCRVS services and from the country config too.
- Keep destructive operations narrow. For example, a delete accepts only the path prefixes that it owns.
- Do not expose internal routes through the gateway. Keep service tokens short-lived.
- Give each token the least privilege it needs, also in GitHub workflows.
- Keep sensitive fields, such as signatures, out of list endpoints and the search index.
- Do not ship insecure defaults, such as a fixed default password in production.

### 3.5 Read scopes only through the scope helpers

- Use `encodeScope` and `decodeScope` from `packages/commons/src/users/scopes.ts`. Do not compare scope strings with `startsWith` or `===`.
- A user can have more than one scope of the same type. Use all of them. Never read only the first match.
- All the options of a scope are combined with AND. There are no exceptions.
- Before you add a new scope type, check if an option on an existing scope can do the job.
- In tests, build scopes with `encodeScope`.

```ts
// Rejected: reads only one scope, and matches a string
const scope = scopes.find((s) => s.startsWith('type=record.reject'))

// Preferred: decode, and use every accepted scope
const accessLevels = acceptedScopes.map((s) =>
  getScopeOptionValue(s, 'accessLevel')
)
```

### 3.6 Treat the audit log as critical

The service that does the operation writes the audit entry. If the write fails, the operation fails. Test what is written.

### 3.7 Keep dependencies and CI small and audited

- Do not add third-party GitHub Actions that we do not maintain or audit.
- When a security update arrives for a dependency, first check if the code uses it. Remove it if you can.
- Do not put links to private channels or documents in this public repository.

---

## 4. Types and validation

### 4.1 Do not cast

Do not use `as`, `any` or `@ts-expect-error`. When the types do not fit, fix the type where it is defined. A cast often hides a bug. If you cannot avoid a cast or a suppression, add a comment that says why, and a `TODO` to remove it.

### 4.2 Parse at the boundary

Validate input with zod where it enters the system. After that, the type carries the guarantee. Do not parse the same value again.

```ts
// Rejected
.input(z.object({ userId: z.string() }))
// ... later
const id = input.userId as UUID

// Preferred
.input(z.object({ userId: UUID }))
```

Use a zod schema instead of manual `typeof` and `Array.isArray` checks on `unknown` data.

### 4.3 Make illegal states impossible in the types

- Use a discriminated union instead of a set of optional fields with comments.
- Make a field required when core always needs it. Apply its default once, in the schema or in `defineConfig`, not with `??` at each call site.
- Do not add optional fields and fallbacks for states that core cannot produce.

```ts
// Rejected
const Entry = z.object({
  parentId: z.string().nullish(), // admin areas only
  locationType: z.string().nullish() // locations only
})

// Preferred
const Entry = z.discriminatedUnion('kind', [AdminAreaEntry, LocationEntry])
```

### 4.4 Use the most precise type that exists

Use the domain types in commons, such as `UUID`, `FieldValue`, `ActionType`, `TokenWithBearer` and `PlainDate`, instead of `string` or `unknown`. Use `PlainDate` for a value that is only a date, and test date code with more than one timezone offset.

Prefer `type` and string literal unions. Do not add an enum-like `as const` object when a literal union gives the same safety.

### 4.5 Use `null` only to clear a value

`null` means that the user cleared a field. For a value that is not there, send `undefined`, not an empty string. Remove `null` values before a payload leaves the API.

### 4.6 Validate country config early, and keep server validation strict

- Validate country config in `defineConfig` and `defineRoles`, so that the country sees the error at build time.
- Use one schema from commons for this. The events service, the toolkit and the seeder then reject the same input.
- The server still validates every request.
- Do not make core validation weaker to work around a client bug. Fix the client.
- Invalid input returns `BAD_REQUEST`, with a message that names the problem and where it is (for example the event id and the version).

---

## 5. Errors

### 5.1 Fail loudly

Do not skip, drop or hide bad data or bad config without a signal. A reindex fails if it cannot index a record. A codemod warns about each case that it skips. A config with conflicting options is rejected, not partly applied.

### 5.2 Tell the person who can fix it

A log line is not enough when a user or an operator must act. People who deploy OpenCRVS do not watch the logs. In the client, show a visible error instead of rendering nothing.

### 5.3 Let errors propagate

Do not catch an error and then drop it. Throw the original error. Return the promise instead of starting work that nobody waits for.

---

## 6. Code structure

### 6.1 Reuse before you write

Search for an existing helper, hook, schema or component before you add one. Extend the existing function instead of adding a parallel one next to it. Define each enum and each list of statuses once.

### 6.2 Put a rule that every caller must remember into one place

If every call site must remember to pass a value or call a helper, move the rule into one helper in commons or into a wrapper component. Then a call site cannot forget it.

### 6.3 Write small functions, and do not add empty layers

Give each function one job. Prefer a functional style to nested loops that change variables. Do not add a wrapper or a helper that has one caller and adds nothing. Put that code at the call site.

### 6.4 Delete dead code

Remove unused functions, exports, props, feature flags, translations, commented-out code, debug logs and stale tests. Do not export code only so that a test can use it. Test it through the public interface.

### 6.5 Use the library or platform first

Use a feature of a library that we already have, or of the platform, before you write your own (for example react-query polling, `AbortSignal.timeout`, `useDebounce`). If you write your own, say why in the PR. A good reason is that the library is large and the repository does not use it yet.

### 6.6 Follow the patterns of the other services

Do a common task in the same way as the rest of the repository. For example, read environment variables with envalid `cleanEnv`, and use `devDefault` for defaults that apply only in development. Use `nx` in CI. Keep tool configuration in one place, for example in `pnpm-workspace.yaml`. If there are multiple conventions, always prefer one from events service.

### 6.7 Respect the package boundaries

- `commons` holds code that more than one package uses. Code that only the client uses stays in the client.
- Do not change commons or core types for a need that only the UI has.
- A shared module does not import from a feature module.
- In client code, import from `@opencrvs/commons/client`.

### 6.8 Events service

- Keep routers thin. Scope checks go in middleware, and the rules go in service functions.
- A procedure that is part of the public API has an OpenAPI `.meta({ openapi })` block.
- Add a REST endpoint as a tRPC procedure. Do not add URL rewrites or gateway code for it, and do not change the tRPC context for one route.
- Store document paths as paths, not as full URLs. Only the documents service builds bucket URLs. See [ADR 0003](adr/0003-a-records-prefix-owns-its-attachments.md) for the prefix of a record.

---

## 7. Database, migrations and performance

### 7.1 Do not edit a migration that can already have run

A deployed database does not run a migration again after it has run. Add a new migration, with a timestamp later than the latest one. Do not rename a migration (see the migration STYLEGUIDE). After a schema change, run `generate-db-types` in `packages/events`.

### 7.2 Write data migrations for the data of a whole country

Do not load all rows into memory. Work in batches. Put the schema change and the data copy in separate steps. Join on indexed columns. Plain SQL is often shorter and faster than code. Check the order in which the migrations of different services run.

### 7.3 Let Postgres do the work

- Filter in the query, not in memory after you fetch the rows.
- Use one query for many items. Do not run `Promise.all` over a list of queries.
- Add indexes and foreign keys.
- Do not query the inside of `jsonb` columns. Keep them as blobs of data.
- Do not store data that is already stored somewhere else.
- Put writes that belong together in one transaction.

### 7.4 Keep I/O bounded and batched

- Run independent calls in parallel with `Promise.all`. Move calls out of loops, and send one call for many items when the API allows it.
- Put a limit on an operation that can grow without limit (a list of keys, a prefix scan, an error message).
- Do not hold a database lock while you wait for an external system.
- Use the `waitFor` option, which waits for indexing, only when the client needs the new index at once. In tests that do not check indexing, set `waitFor: false`.

### 7.5 Add a cache only when it is worth it

A cache or another optimization must give a gain that is larger than the complexity it adds. Measure it, and say the result in the PR.

---

## 8. Naming

### 8.1 A name says what the code does

Rename a function, a variable, an error message or a test title when its behaviour changes. A function with a query name, such as `getX` or `isX`, has no side effects. `getX` throws when not found. `findX` may return undefined. Use a named constant for a number that is not obvious.

### 8.2 Use the domain terms, and do not reuse them

Use the terms in `CONTEXT.md`. Do not give a new thing a name that already means something else in the code (for example `EventMetadata`, or "search scope"). If you need a new term, add it to `CONTEXT.md`.

### 8.3 Follow the naming conventions

- `get*` returns a value or throws. `find*` can return `undefined`. See `getOrThrow` in commons.
- Interfaces and types have no `I` prefix: `AvatarProps`, not `IAvatarProps`.
- Do not use abbreviations. Write known acronyms in camelCase, and match the casing of names that already exist: `printPdf`, not `printPDF`.
- Do not name a thing after the tool that it uses today. Name it after what it does.
- In core, scope "options" are called options, not "attributes".

---

## 9. Comments

### 9.1 A comment says why, not what

Add a comment where the reason for the code is not clear from the code. For example: why `Promise.allSettled` is used, why a migration has no down step, or an example match and non-match for a regex. Do not write a comment that repeats what the code says.

### 9.2 Keep history out of the code

Do not write file-top summaries, notes about removed behaviour, issue links or step numbers in comments. They become stale fast, and `git blame` already gives the history. Put the history and the reason for a change in the PR description.

### 9.3 Keep comments short and true

A comment that is long or that sounds generated will not be read. When the code changes, update or delete its comments and JSDoc. Fix a comment that says the opposite of what the code does.

---

## 10. Tests

### 10.1 Every change of behaviour has a test

- A bug fix comes with a test that reproduces the bug. The test fails without the fix.
- Test at the layer where the bug is. Prefer integration tests at endpoint level. Avoid unit tests that make the behaviour hard to follow or change later.
- Cover the negative cases and each acceptance criterion of the issue.
- A new tRPC procedure has access tests (allowed and forbidden, for each caller type) and functional tests. If endpoint can return multiple values, ensure it works with 0, 1 and more items.
- Code that is about to be removed can go without new tests. Say so in the PR.

### 10.2 Assert the result, not the call

Read the state back through the API or the database and assert it. Assert the exact error. Check that a side effect that must not happen did not happen.

```ts
// Rejected: checks only what the call returned
const res = await client.event.actions.assignment.unassign(payload)
expect(res.actions.at(-1)?.type).toEqual(ActionType.UNASSIGN)

// Preferred: read the record back and check its state
await client.event.actions.assignment.unassign(payload)
const event = await client.event.get({ eventId })
expect(getCurrentEventState(event, config).assignedTo).toBeNull()

// Preferred: assert the exact error
await expect(
  client.event.actions.register.request(payload)
).rejects.toMatchObject(new TRPCError({ code: 'BAD_REQUEST', message: '...' }))
```

### 10.3 Use the existing test helpers

- Build data with `generateEventConfig`, `generateEventDocument` and `generateActionDocument` (in `packages/commons/src/events/test.utils.ts`), and in the events service with `setupTestCase` and `createTestClient`.
- Build tokens from user properties, for example with `generateToken`. Do not hardcode JWTs.
- Test with the caller type that production uses. If a system client calls the endpoint, the test uses a system client.
- Find fixtures by their properties, not by array index.
- Write the values that the test depends on in full.
- Define one data object and refer to it in the test. Do not copy the same payload many times. Prefer data generators when possible.

```ts
// Rejected
const otherUser = users[1]

// Preferred
const otherUser = users.find((u) => u.primaryOfficeId !== me.primaryOfficeId)
```

### 10.4 Mocks must not hide failures

A mock behaves like the real endpoint, including its failure cases. Prefer real dependencies (testcontainers) to global mocks. Test inputs and outcomes, not which internal functions were called.

### 10.5 Choose the cheapest test that covers the change

- For a regression in the client only, write a Storybook interaction test (`*.interaction.stories.tsx`). Screenshots do not replace it.
- Keep e2e tests for important flows that cross services. E2e tests use a lot of CI time.
- Keep one test suite for a behaviour, not two suites that overlap.
- New client tests are Storybook tests, not Jest view tests.

### 10.6 Make tests deterministic and readable

- Wait for a signal (`waitFor`, `page.waitForResponse`). Do not wait for a fixed time.
- In Storybook, find elements by label (`findByLabelText`), not with `querySelector`. Do setup in `beforeEach`, not in `loaders`. When an endpoint changes shape, update the default MSW handlers.
- In e2e tests, follow `HOW-TO-WRITE-A-TEST.md`, use the shared helpers in `packages/testland/e2e`, and use faker for names.
- A test title says the behaviour that the test checks.
- Do not merge `test.only`, or a `skip` that has no reason.

---

## 11. Client

### 11.1 Derive state during render

Do not use `useEffect` to copy props into state, or to reset or sync state. Compute the value during render, or set the initial state when the view opens. Put the side effects of a mutation in its `onSuccess` and `onError` handlers.

```ts
// Rejected
useEffect(() => {
  if (mutation.isError) dispatch(showError())
}, [mutation.isError])

// Preferred
useMutation({ ..., onError: () => dispatch(showError()) })
```

### 11.2 Keep data logic out of views

Sort, filter and refetch in the query or the procedure, not in the component that shows the data.

### 11.3 Pass behaviour in, do not detect it

- Pass behaviour to a component through props or field config. A component does not try to find out its own context.
- Each input component handles its own value shape. `FormFieldGenerator` does not know the value structure of any input.
- A hook handles its own performance cost, so that callers do not have to. Memoize an expensive derivation. Do not memoize a cheap one.
- Do not return before a hook is called. Split the code into a guard component and a body component if you need to. ESLint checks this.

### 11.4 Write new code on the v2 stack

New client code uses tRPC and the v2 components. Do not add new code that uses Redux, GraphQL or the v1 `FormFieldGenerator`.

### 11.5 Check offline, mobile and accessibility

When you change the data flow of the client, check that offline mode and the persisted cache still work. Check UI changes in mobile view and against the Figma design. Keep keyboard access working. Use `text-align: start`, not `left`, so that right-to-left languages work.

### 11.6 Copy and translations

- Give each text its own translation key. Do not use one key for two different texts.
- Use ICU placeholders and `select` in one message. Do not join strings or punctuation to a translated message.
- When you add or change a message, update `client.csv` in `countryconfig-template` and in `testland`. Remove the keys that are no longer used.
- Do not hardcode the locale or the application name. Use `APPLICATION_NAME`.

```ts
// Rejected: joins text to a translated message
formatMessage(messages.title) + '?'

// Preferred: one message, with a placeholder
const integrationType = {
  id: 'integration.type',
  defaultMessage: '{type, select, HEALTH {Health integration} other {Unknown}}'
}
```

---

## 12. Helm charts

Put default values in `values.yaml`. Prefer this to `| default` or helper logic in templates. Then the operator can see what the final Kubernetes manifest will be.
