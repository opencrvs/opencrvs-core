# Configuring V2 Events

## Configuration concepts

### Event

How to configure an event
[EventConfig](./EventConfig.ts)

How an event is represented in the system
[EventDocument](./EventDocument.ts)

A life event (e.g., dog adoption). An entry in the database describing a life event and sequence of steps (actions) in the process.

On high-level, event defines a form configuration [DeclarationFormConfig](./FormConfig.ts), which describes the fields needed to complete event registration.

### Actions

How to configure an action
[ActionConfig](./ActionConfig.ts)

How an action is represented in the system
[ActionDocument](./ActionDocument.ts)

[System action types](./ActionType.ts)

In order to register the event a series of actions needs to take place. Actions are performed by users. What actions user can perform depends on their [scopes](./scopes.ts). Actions are performed in [specific order and cannot be skipped](./state/availableActions.ts).

Outside of declaration, actions may include form(s) for gathering additional data related to the event. Action specific metadata is called **annotation**.

When event is submitted the first time, **in full**, as defined in the event configuration, it receives status `DECLARED`. [Statuses and flags](./EventMetadata.ts) restrict which action can take place next.

### Forms, Pages, Fields

How to configure a form
[FormConfig](./FormConfig.ts)

How to configure a page
[PageConfig](./PageConfig.ts)

How to configure a field
[FieldConfig](./FieldConfig.ts)

There are two kinds of forms.

1. Declaration form, which gathers data about the event across the registration process, represented in `declaration` property.
2. Action form, which gathers data specific to the action, represented in `annotation` property, and will vary between actions.

By default, forms can contain multiple pages. Each page consists of fields. Fields are used to gather data or to represent information.
[Each field can be conditionally configured](./Conditional.ts) to be visible or enabled. Appropriate [helpers are provided for the configuration](../conditionals/conditionals.ts).

### Validation, Writing data

[How data is validated in backend](../../../events/src/router/middleware/index)

How field values are represented
[FieldValue](./FieldValue.ts)

Validation is based on the field type and event configuration.
Changing configuration applies the validation to new and **existing** events.

- Declaration actions may pass in partial updates (PATCH)
- Declaration is validated based on all the actions that have been performed earlier.
- Hidden fields should not receive values.

### Reading data

How full event is represented in the system
[EventDocument](./EventDocument.ts)

How aggregated event is represented in the system
[EventIndex](./EventIndex.ts)

Event is represented in two formats.

- `EventDocument` includes all the actions, fetching it requires assignment.
- `EventIndex` includes aggregated snapshot of the event, where all actions are applied, and possible `secured` data filtered out.

When searching events, results are in `EventIndex` format. Most of the time, it is the one you need and is calculated by [getCurrentEventState](./state/index.ts)

### Drafts

How draft is represented in the system
[Draft](./Draft.ts)

Draft is a temporary storage for an action. It is persisted separately from submitted actions and visible only to the creator.
Only single draft can exist for an event at the same time. Draft can represent **any** action.
