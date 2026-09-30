# Driving offline-first SPAs

Failure modes that look like a broken selector but are not. All of these cost
real debugging time on a controlled-input, service-worker, bundler-dev-server
app; none of them are specific to one codebase.

## Synthetic input silently does not commit

Controlled-input libraries (formik, react-hook-form, react-select) track state
from trusted events. Setting `input.value` or dispatching a synthetic
`PointerEvent`/`ChangeEvent` through `run-code` updates the DOM but not the
component state, so:

- the field visually holds text while the review step still reports it empty
- canvas widgets that gate on trusted pointers (signature pads) leave their
  confirm button disabled

Use real interactions — `click`, `type`, `fill`, `drag` — and after a text
field, press `Tab` or click elsewhere. Blur is what commits the value.

```bash
playwright-cli click e42
playwright-cli type "Jane"
playwright-cli press Tab      # ← without this the value can be dropped
```

## Refs go stale on rerender

A snapshot's refs (`e15`) are valid for that render only. Take one snapshot per
screen and act on it immediately; do not snapshot, reason for several steps,
then click. If a click reports a missing ref after the page changed, re-snapshot
rather than retrying the old ref.

## Lazy route chunks die offline

A dev server serves routes as dynamic imports, so going offline and then
entering a route the session has never loaded gives a blank page — an empty
root element with no test ids. The chunk fetch failed; the selectors were never
wrong.

Warm the route up first, in the **same** page session:

```js
// 1. walk the whole flow online so the modules land in the registry
// 2. then go offline and repeat it
await page.context().setOffline(true)
```

Two rules follow:

- Never `goto` while offline — that is a document request. Navigate to the entry
  page online, go offline, then click through so routing stays client-side.
- `page.reload()` fails with `net::ERR_INTERNET_DISCONNECTED` when the dev build
  ships no service worker. For a cold boot, close the page and open a new one in
  the same context.

## Conditional pages break fixed-order scripts

When a wizard shows pages conditionally, a script that assumes page order hangs
on a page that never renders. Loop on the URL until the terminal route:

```js
while (!page.url().includes('/review')) {
  await fillCurrentPage(page)
  await page.getByRole('button', { name: /^Continue$/ }).click()
}
```

## A test id scoped to one screen is not a global

The same visible label can carry a test id on one screen and none on the next.
When a `[data-testid=...]` lookup times out on a page where the control is
plainly visible, fall back to the accessible role:

```js
await page.getByRole('button', { name: /^Continue$/ }).click()
```

Also check whether the attribute is `id` rather than `data-testid` — dialogs
often build `#confirm_<Action>` ids, and the action segment may be hardcoded to
one value regardless of which button opened the dialog.

## Dev-server reloads reset app state mid-flow

Editing app source while a flow is in progress triggers an HMR reload, which
sends the app back through whatever gate it boots into — login, a PIN screen, an
onboarding step. If a run inexplicably lands on an auth screen, check whether
something rebuilt. Either finish the run before editing, or re-authenticate as
part of the script.
