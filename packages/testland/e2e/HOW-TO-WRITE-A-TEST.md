# How to write a test (that is not flaky)

TL;DR:

1. Use `openRecordByTitle` when selecting user from workqueue

- We poll search endpoint, run tests in parallel and only few users to run hundreds of tests.
- Without this method, your test will inevitably end up on a wrong event overview page if you just naively click the name.

2. Use `ensureAssignedToUser` when want to assign user to event in event overview.

- Checks if you are assigned or not. Works on 'Summary' page.
- Known drawback 1: Cannot be used on 'Audit' or 'Record' page.
- Known drawback 2: Assumes ActionMenu and Overview use the same data. Sometimes\* you'll need to wait for search response explicitly

3. Use `triggerDeclarationAction` when you use action menu to trigger action. It will wait for the responses for you.

- We cannot await the triggered actions in the application. This waits until all the action calls respond with ok.

4. use `page.waitForResponse` instead of setting arbitrary timeout.

- For the actions not covered by `triggerDeclarationAction`.
- You need to know what you are waiting for.

\* When user is redirected after action back to event overview (happens only if you come to the event through search), it takes few seconds for the UI to sync up completely. In these scenarios you might need to explicitly wait for the search cache to update.

The search-cache refetch is a `POST` to `event.search` fired _onSuccess of the
action_, and it carries `clauses: [{ id: eventId }]` in its body. Two consequences:

1. Match on the request **body** (`postData`) using the eventId.
2. Attach the listener but only accept it **after the action's own responses have returned**. Several `event.search` calls (page load, workqueues) hit the same endpoint; without the gate you can resolve on a pre-action search and race downstream steps.

`triggerDeclarationAction` / `waitForCorrectionAction` do this for you — pass
`{ waitForUnassign: true, eventId }`. If you must wait manually:

```
// Example: How to know UI is ready without setting 30 second timeout:
    let actionDone = false
    const actionResponse = page
      .waitForResponse((res) => res.url().includes('event.actions.…') && res.ok())
      .then(() => {
        actionDone = true
      })

    const searchCacheRefetchResponse = page.waitForResponse(
      (res) =>
        res.url().includes('event.search') &&
        res.ok() &&
        res.request().method() === 'POST' &&
        (res.request().postData()?.includes(eventId) ?? false) &&
        actionDone // gate: only the post-action refetch counts
    )

    // ... Code to trigger the action.

    await Promise.all([actionResponse, searchCacheRefetchResponse])
```

## Why we need these

1. We have only few users in parallel tests. We cannot check "if outbox is empty" since the test run cannot guarantee it.
2. We constantly poll workqueues. This is a good thing for the actual application. With our setup, we might select the right row, but UI changes underneath us and we end up in wrong event.
3. We cannot await the queries due to offline requirements. Fire & forget, but tests need to wait for responses.

## QA-traceable specs (`qa-testrail-testcases/`)

When writing a spec that maps 1:1 to a TestRail/QA case (i.e. anything under
`qa-testrail-testcases/`), keep one QA case as **one top-level `test()`**,
with `test.step(...)` for each QA sub-step. Do not wrap it in
`test.describe(...)` at all - not `.serial`, not plain either. The file is
already the grouping; if a QA case needs more than one `test()` (e.g. a
positive/negative pair), they just sit side by side at the top level. See
`qa-testrail-testcases/Deduplication/Duplicate Review/*.spec.ts` for the
shape to follow:

```ts
test('1. Cancelling the "X" confirmation leaves the record flagged', async ({ page }) => {
  await test.step('Register the first declaration', async () => { ... })
  await test.step('Declare a second, identical declaration', async () => { ... })
  await test.step('Open the modal and cancel', async () => { ... })
})
```

File names take a numeric prefix matching the QA case's position in its
suite, e.g. `1.birth-event-declaration.spec.ts`.
