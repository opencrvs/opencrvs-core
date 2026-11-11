# Coding standards

These standards apply to all code in opencrvs-core. People and agents use the same pages.

- Authors: read this page and each area page that matches your change. A change is ready for review when every rule on those pages holds for the diff.
- Reviewers: link to the heading of the rule instead of writing the reason again.

The rules come from requests that reviewers repeated in the 2026 pull requests. When a tool can check a rule, add the lint rule and delete the rule from these pages.

## Area pages

This page holds the rules for all code. Each area page holds the rules for one type of change.

| The change touches                                                                                                    | Read                                         |
| --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Something that a country or an external system uses: country config, the REST API, scopes, translation keys, defaults | [public-interfaces.md](public-interfaces.md) |
| A backend service: authorization, routers, calls to other systems                                                     | [services.md](services.md)                   |
| A migration or a database query                                                                                       | [database.md](database.md)                   |
| A test                                                                                                                | [tests.md](tests.md)                         |
| `packages/client`, `packages/components` or `packages/login`                                                          | [client.md](client.md)                       |
| `charts/`, `.github/workflows/` or a dependency                                                                       | [infrastructure.md](infrastructure.md)       |

Other sources:

- [`CONTEXT.md`](../../CONTEXT.md) defines the domain terms.
- [`docs/adr/`](../adr/) holds the architectural decisions.
- [`STYLEGUIDE.md`](../../packages/client/src/v2-events/STYLEGUIDE.md) defines the names of files, zod schemas, types and functions. It applies to all packages.
- [`CONTRIBUTING.md`](../../CONTRIBUTING.md) has the rules for the pull request itself.

## What the tooling checks

The tools report these. Leave them out of a review.

- Formatting, the license header and the branch name: the git hooks.
- New unused exports and files: the `lint-knip` job.
- ESLint: no non-null assertion, exhaustive `switch`, `curly`, the rules of hooks, `no-floating-promises` and `require-await`.
- Postgres migrations: the `check-postgres-migrations` workflow.

## Types

### Fix the type instead of a cast

When the types do not fit, fix the type where it is defined. `as`, `any` and `@ts-expect-error` often hide a bug. A cast or a suppression that must stay has a comment that says why, and a `TODO` that links to an issue.

### Parse at the boundary

Validate input with a zod schema where it enters the system. After that, the type carries the guarantee, and the value is not parsed again. Use a zod schema for `unknown` data instead of manual `typeof` and `Array.isArray` checks.

```ts
// Rejected
.input(z.object({ userId: z.string() }))
// ... later
const id = input.userId as UUID

// Preferred
.input(z.object({ userId: UUID }))
```

### Make illegal states impossible in the types

- Use a discriminated union instead of a set of optional fields with comments.
- Make a field required when core always needs it. Apply its default once, in the schema or in `defineConfig`, instead of `??` at each call site.
- Model only the states that core can produce.

```ts
// Rejected
const Entry = z.object({
  parentId: z.string().nullish(), // admin areas only
  locationType: z.string().nullish() // locations only
})

// Preferred
const Entry = z.discriminatedUnion('kind', [AdminAreaEntry, LocationEntry])
```

### Use the most precise type that exists

Use the domain types in commons, such as `UUID`, `FieldValue`, `ActionType`, `TokenWithBearer` and `PlainDate`, instead of `string` or `unknown`. Use `PlainDate` for a value that is only a date. Prefer `type` and a union of string literals to an enum-like `as const` object.

### Use `null` only to clear a value

`null` means that the user cleared a field. Send `undefined` for a value that is not there. Remove `null` values before a payload leaves the API.

## Errors

### Fail loudly

Bad data or bad config always gives a signal. A reindex fails if it cannot index a record. A codemod warns about each case that it skips. A config with conflicting options is rejected, not partly applied.

### Tell the person who can fix it

A log line is not enough when a user or an operator must act. People who deploy OpenCRVS do not watch the logs.

### Let errors propagate

A `catch` block handles the error or throws the original error again. Return the promise so that the caller waits for the work.

## Structure

### Reuse before you write

Search for an existing helper, hook, schema or component before you add one. Extend the existing function instead of adding a parallel one. Define each enum and each list of statuses once.

Use a feature of the platform, or of a library that the repository already has, before you write your own. Examples are react-query polling, `AbortSignal.timeout` and `useDebounce`.

### Enforce a rule in the types, not at each call site

If every call site must remember to pass a value or call a helper, make the compiler reject the call site that forgets. For example, make the parameter required, or accept only the type that the helper returns. If the types cannot enforce the rule, move it into one helper in commons or into a wrapper component.

### Add a layer only when it does a job

A wrapper or a helper that has one caller and adds nothing belongs at the call site. Prefer a functional style to nested loops that change variables.

### Remove all of it

When you remove code, remove its props, feature flags, translations, debug logs and stale tests too. When you remove a feature, also remove its dependency, environment variables, endpoints, Docker Compose entries, and e2e and infrastructure references. Only the migrations can still name it.

Test code through its public interface. An export that exists only for a test is dead code.

### Follow the events service when conventions differ

Do a common task in the same way as the rest of the repository. If the packages have more than one convention, use the convention of the events service.

### Keep shared code in commons, and only shared code

- `commons` holds code that more than one package uses. Code that one package uses stays in that package.
- Commons and core types do not change for a need that only the UI has.
- A shared module does not import from a feature module.

### Measure before you optimize

A cache or another optimization must give a gain that is larger than the complexity it adds. Measure the gain, and give the result in the PR.

## Naming

The [STYLEGUIDE](../../packages/client/src/v2-events/STYLEGUIDE.md) has the conventions: `get*` and `find*`, no `I` prefix, camelCase acronyms. These rules add to it:

- Rename a function, a variable, an error message or a test title when its behaviour changes.
- A function with a query name, such as `getX` or `isX`, has no side effects.
- Use the terms in `CONTEXT.md`. A new thing gets a name that means nothing else in the code. Add a new term to `CONTEXT.md`.
- Name a thing after what it does, not after the tool that it uses today.
- Use a named constant for a number that is not obvious.

## Comments

- A comment says why the code is as it is. Examples: why `Promise.allSettled` is used, why a migration has no down step, an example match and non-match for a regex.
- The history of the code belongs in the PR description and in `git blame`. This includes file-top summaries, notes about removed behaviour and step numbers.
- Keep a comment short. When the code changes, update or delete its comments and JSDoc.
- Every `TODO` or `FIXME` links to an issue.
- This repository is public. Link only to public channels and documents.
