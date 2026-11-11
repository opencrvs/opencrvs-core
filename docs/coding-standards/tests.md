# Tests

Read this page when a change adds or changes a test. [Coding standards](README.md) has the rules for all code. For e2e tests, also follow [`HOW-TO-WRITE-A-TEST.md`](../../packages/testland/e2e/HOW-TO-WRITE-A-TEST.md).

## Every change of behaviour has a test

- A bug fix comes with a test that reproduces the bug. The test fails without the fix.
- Test at the layer where the bug is. Prefer integration tests at the level of the endpoint to unit tests that make the behaviour hard to follow or change.
- Cover the negative cases and each acceptance criterion of the issue.
- A new tRPC procedure has access tests (allowed and forbidden, for each caller type) and functional tests. If an endpoint can return more than one item, test it with 0, 1 and more items.
- Test date code with more than one timezone offset.

## Choose the cheapest test that covers the change

- For a change in the client only, write a Storybook interaction test (`*.interaction.stories.tsx`). Screenshots and Jest view tests do not replace it.
- Keep e2e tests for important flows that cross services. E2e tests use a lot of CI time.
- Keep one test suite for a behaviour.

## Assert the result, not the call

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

## Use the existing test helpers

- Build data with `generateEventConfig`, `generateEventDocument` and `generateActionDocument` from `packages/commons/src/events/test.utils.ts`. In the events service, use `setupTestCase` and `createTestClient`.
- Build tokens from user properties with `generateToken`, and scopes with `encodeScope`.
- Test with the caller type that production uses. If a system client calls the endpoint, the test uses a system client.
- Find fixtures by their properties, not by array index.
- Write the values that the test depends on in full.
- Define one data object and refer to it in the test.

```ts
// Rejected
const otherUser = users[1]

// Preferred
const otherUser = users.find((u) => u.primaryOfficeId !== me.primaryOfficeId)
```

## A mock behaves like the real endpoint

This includes its failure cases. Prefer real dependencies (testcontainers) to global mocks. Test inputs and outcomes, not which internal functions were called.

## Make tests deterministic and readable

- Wait for a signal, such as `waitFor` or `page.waitForResponse`, instead of a fixed time.
- In the events service, the `waitFor` option waits for indexing. Set `waitFor: false` in a test that does not check indexing.
- In Storybook, find elements by label (`findByLabelText`). Do setup in `beforeEach`. When an endpoint changes shape, update the default MSW handlers.
- In e2e tests, use the shared helpers in `packages/testland/e2e`, and use faker for names.
- A test title says the behaviour that the test checks.
- A `skip` has a reason. `test.only` stays out of the merge.
