# Configuring V2 Events

## Configuration concepts

### Event

How to configure an event
[EventConfig](./EventConfig.ts)

How an event is represented in the system
[EventDocument](./EventDocument.ts)

A life event (e.g. dog adoption). An entry in the database describing a life event and the sequence of steps (actions) in the process.

On a high level, SI defines a form configuration for the event, [DeclarationFormConfig](./FormConfig.ts), which describes the fields needed to complete registration.

### Actions

How to configure an action
[ActionConfig](./ActionConfig.ts)

How an action is represented in the system
[ActionDocument](./ActionDocument.ts)

[System action types](./ActionType.ts)

In order to register the event, a series of actions need to take place. Actions are performed by users. What actions a user can perform depends on their [scopes](./scopes.ts). Actions are performed in a [specific order and cannot be skipped](./state/availableActions.ts).

Outside of the declaration, actions may include form(s) for gathering additional data related to the event. Action-specific metadata is called **annotation**.

When an event is submitted for the first time, **in full**, as defined in the event configuration, it receives the status `DECLARED`. [Statuses and flags](./EventMetadata.ts) restrict which actions can take place next.

#### Action status

Every stored action carries an [ActionStatus](./ActionStatus.ts): `Requested`, `Accepted` or `Rejected`.

[Confirmable actions](./ActionType.ts) (`ConfirmableActions`: `NOTIFY`, `DECLARE`, `EDIT`, `REGISTER`, `REJECT`, `ARCHIVE`, `UNARCHIVE`, `PRINT_CERTIFICATE`, `REQUEST_CORRECTION`, `APPROVE_CORRECTION`, `REJECT_CORRECTION`, `REVOKE_REGISTRATION`, `REINSTATE_REGISTRATION` and `CUSTOM`) are stored in two steps:

1. A `Requested` action is written first. It holds the user's declaration, annotation and content, and the metadata of the user who performed it (`createdBy`, `createdAtLocation`, ...).
2. Country config's action confirmation API is called. A `200` stores an `Accepted` action, a `400` stores a `Rejected` action. A `202` leaves the `Requested` action pending until the country config calls the `accept` or `reject` endpoint.

The `Accepted`/`Rejected` action points back to the `Requested` one through `originalActionId`. Its declaration and annotation are empty unless the confirmation response provided some. Use `getCompleteActionDeclaration`, `getCompleteActionAnnotation` and `getCompleteActionContent` to read the merged values, rather than reading either action on its own.

All other actions (`CREATE`, `ASSIGN`, `UNASSIGN`, `READ`, `DUPLICATE_DETECTED`, `MARK_AS_DUPLICATE`, `MARK_AS_NOT_DUPLICATE`) are stored directly as `Accepted`, with no `Requested` counterpart.

Only `Accepted` actions change the event state (see `getAcceptedActions`). A record's action list therefore usually contains both the `Requested` and `Accepted` copy of each confirmable action, so look actions up by type **and** status rather than by type or position. `generateEventDocument` and `generateActionDocuments` in [test.utils.ts](./test.utils.ts) produce the same pairs, so tests see realistic data by default. `generateActionDocument` builds a single action with an explicit status, for edge cases such as pending or rejected requests.

#### Quick actions

Some actions have their own complete flow on the UI, this includes:

- Declaration
- Certificate printing
- Correction

It's good to note that the declaration flow will also validate, or validate and register if the user has the scope for it.

However, certain actions are executed via a simple modal on the event overview. These are called **quick actions**. These include:

- Validation (of a declared event)
- Registration (of a declared event)
- Rejection
- Archival

Quick actions can be added with the [useQuickActionModal.tsx](../../../client/src/v2-events/features/events/actions/quick-actions/useQuickActionModal.tsx)

### Forms, Pages, Fields

How to configure a form
[FormConfig](./FormConfig.ts)

How to configure a page
[PageConfig](./PageConfig.ts)

How to configure a field
[FieldConfig](./FieldConfig.ts)

There are two kinds of forms:

1. Declaration form, which gathers data about the event across the registration process, represented in the `declaration` property.
2. Action form, which gathers data specific to the action, represented in the `annotation` property, and varies between actions.

By default, forms can contain multiple pages. Each page consists of fields. Fields are used to gather data or represent information.  
[Each field can be conditionally configured](./Conditional.ts) to be visible or enabled. Appropriate [helpers are provided for configuration](../conditionals/conditionals.ts).

### Validation, Writing data

[How data is validated in the backend](../../../events/src/router/middleware/index.ts)

How field values are represented
[FieldValue](./FieldValue.ts)

Validation is based on the field type and event configuration.
Changing the configuration applies validation to new and **existing** events.

- Declaration actions may pass in partial updates (PATCH).
- The declaration is validated based on all the actions that have been performed earlier.
- Hidden fields should not receive values.

### Reading data

How a full event is represented in the system
[EventDocument](./EventDocument.ts)

How an aggregated event is represented in the system
[EventIndex](./EventIndex.ts)

An event is represented in two formats:

1. `EventDocument` includes all the actions; fetching it requires assignment.
2. `EventIndex` includes an aggregated snapshot of the event, where all actions are applied and any `secured` data filtered out.

When searching events, results are returned in the `EventIndex` format. Most of the time, this is the format you need, and it is calculated by [getCurrentEventState](./state/index.ts).

### Drafts

How a draft is represented in the system  
[Draft](./Draft.ts)

A draft is temporary storage for an action. It is persisted separately from submitted actions and is visible only to the creator.  
Only a single draft can exist for an event at a time. A draft can represent **any** action.
