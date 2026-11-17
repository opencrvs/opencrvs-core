# Client

Read this page when a change touches `packages/client`, `packages/components` or `packages/login`. [Coding standards](README.md) has the rules for all code. The [v2-events README](../../packages/client/src/v2-events/README.md) has the directory structure and the route components.

## Write new code on the v2 stack

New client code uses tRPC and the v2 components. Redux and GraphQL are for existing code only. Import commons from `@opencrvs/commons/client`.

## Derive state during render

Compute a value during render, or set the initial state when the view opens. `useEffect` is not for copying props into state, or for resetting or syncing state. Put the side effects of a mutation in its `onSuccess` and `onError` handlers.

```ts
// Rejected
useEffect(() => {
  if (mutation.isError) dispatch(showError())
}, [mutation.isError])

// Preferred
useMutation({ ..., onError: () => dispatch(showError()) })
```

## Keep data logic out of views

When a list can grow large, sort, filter and page it in the query or the procedure, not in the component that shows it. A view can sort or filter a small list that it already has. Configure a refetch in the query, not in the component.

## Pass behaviour in

- Pass behaviour to a component through props or field config. A component does not find out its own context.
- Each input component handles its own value shape. `FormFieldGenerator` knows the value structure of no input.
- A hook handles its own performance cost. Memoize an expensive derivation, and leave a cheap one as it is.

## Show a visible error

When a user must act, show an error in the UI. A view that renders nothing hides the problem.

## Check offline, mobile and accessibility

- When you change the data flow, check that offline mode and the persisted cache still work.
- Check UI changes in mobile view and against the Figma design.
- Keep keyboard access working.
- Use `text-align: start` instead of `left`, so that right-to-left languages work.

## Copy and translations

- Give each text its own translation key.
- Write the `id` and the `defaultMessage` of each message in the code as fixed strings. The `extract:translations` check cannot read a message that is created at runtime, so it cannot make sure that the country config has the key.
- Use [ICU message](https://unicode-org.github.io/icu/userguide/format_parse/messages/) placeholders and `select` in one message instead of strings or punctuation that are joined to a translated message.
- When you add, change or remove a message, update `client.csv` in `countryconfig-template` and in `testland`.

```ts
// Rejected: joins text to a translated message
formatMessage(messages.title) + '?'

// Rejected: the message id is created at runtime
const label = { id: `event.${type}.label`, defaultMessage: type }

// Preferred: one message, with a placeholder
const integrationType = {
  id: 'integration.type',
  defaultMessage: '{type, select, HEALTH {Health integration} other {Unknown}}'
}
```
