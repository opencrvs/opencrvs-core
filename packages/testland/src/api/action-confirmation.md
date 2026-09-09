# Action Confirmation API

Some event actions require additional confirmation from the Country Configuration API before they can be accepted. This process is known as **action confirmation**.

### Supported Actions

The following actions currently support action confirmation:

- `ActionType.NOTIFY`
- `ActionType.DECLARE`
- `ActionType.REGISTER`
- `ActionType.REJECT`
- `ActionType.ARCHIVE`
- `ActionType.PRINT_CERTIFICATE`

For implementation examples, see [src/api/registration/index.ts](./registration/index.ts).

## Initial Confirmation Request

When a user initiates an action, an HTTP `POST` request is sent to the Country Configuration API at:

```
/events/{event}/actions/{action}
```

By default, an interceptor is configured for all event actions, returning an `HTTP 200` response. This is defined in [src/index.ts#L575](../../src/index.ts#L575).

To add a custom action confirmation handler, you can define a route as follows:

```typescript
server.route({
  method: 'POST',
  path: `/events/my-event-name/actions/${ActionType.ARCHIVE}`,
  handler: // handler function,
  options: {
    tags: ['api', 'events'],
    description: 'Custom action confirmation handler for archive actions'
  }
})
```

## Confirmation Handling

Action confirmation can be handled either **synchronously** or **asynchronously**, depending on the requirements.

### Synchronous Confirmation

For immediate confirmation, the API must return one of the following responses:

- **Accept:** `HTTP 200` → `return h.response().code(200);`
- **Reject:** `HTTP 400` → `return h.response().code(400);`

The action will be accepted or rejected instantly.

### Asynchronous Confirmation

For cases where confirmation is not available immediately (e.g., requiring human approval), the API should return `HTTP 202` for the initial confirmation request, e.g. `return h.response().code(202);`.

This places the action in a `Requested` state until it is later accepted or rejected.

#### Accepting an Action Asynchronously

To accept the action asynchronously after returning `HTTP 202`, use the following approach:

```typescript
const event = await client.event.actions.archive.accept.mutate({
  ...action, // Action input
  transactionId: uuidv4(),
  eventId,
  actionId
})
```

#### Rejecting an Action Asynchronously

To reject the action asynchronously after returning `HTTP 202`, use the following approach:

```typescript
const event = await client.event.actions.archive.reject.mutate({
  transactionId: uuidv4(),
  eventId,
  actionId
})
```

## Special Case: Registration Confirmation

The **registration confirmation** process is unique because it requires returning a **registration number** upon confirmation.

### Initial Confirmation Request Response

When confirming registration synchronously, the response must include a registration number:

```typescript
return h
  .response({ registrationNumber: generateRegistrationNumber() })
  .code(200)
```

### Asynchronous Registration Confirmation

For asynchronous registration confirmation, use the following approach:

```typescript
const event = await client.event.actions.register.accept.mutate({
  ...action,
  transactionId: uuidv4(),
  eventId,
  actionId,
  registrationNumber: generateRegistrationNumber()
})
```

### Modifying the Registration Number

By default, the system generates a registration number consisting of 12 random uppercase alphanumeric characters (e.g., `PD9TL0RL12RO`). This logic is implemented in [src/api/registration/registrationNumber.ts](./registration/registrationNumber.ts).

To customize the registration number format, modify the `generateRegistrationNumber()` function to return a string of your choice.
