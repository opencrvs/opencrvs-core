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
