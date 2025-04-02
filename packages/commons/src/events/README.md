# Configuring V2 Events

## Configuration concepts

### Event

A life event (e.g., dog adoption). An entry in the database describing a past life event and all steps (actions) involved in the process.

On high-level, event defines a form (`declaration`), which specifies the fields needed to complete event registration.
Annotations are gathered through **actions**. Declaration actions define `review` property. The information input in review fields are separate additions to declaration.

Once event has been registered, it becomes a `record`. Actions after registration **record actions**.

### Event declaration

1. Declaration defines a form configuration for gathering event data.
2. Declaration is available to all actions.
3. Actions up to `REGISTER` can make changes to declaration. `(NOTIFY) -> DECLARE -> VALIDATE -> REGISTER`

### Actions

[see up to date ActionConfig](packages/commons/src/events/ActionConfig.ts)

#### Pre-declaration actions

1. `CREATE`
2. `DELETE`

#### Declaration actions

1. `DECLARE` | `NOTIFY`
2. `VALIDATE`
   2.1. `REJECT_DECLARATION`
   2.2. `MARK_AS_DUPLICATE`,
   2.3. `ARCHIVE`
3. `REGISTER`

Actions update `declaration` based on the event configuration.
Actions may have additional fields in review page. These fields are action specific annotations, and are not part of the declaration form.
"System actions" (e.g. `ARCHIVE`) act on events but are not configurable.

Once `declaration` is registered it becomes a `record`.

#### Record actions

1. `PRINT_CERTIFICATE`
2. `ISSUE_CERTIFICATE`
3. `REQUEST_CORRECTION`
   3.1. `REJECT_CORRECTION`
   3.2. `APPROVE_CORRECTION`

By definition, `record` actions modify registered declarations, records.
Record actions can read declaration but do not modify it. Making changes to existing record is done through `CORRECTION` actions.

### General actions

1. `READ`
2. `ASSIGN`
3. `UNASSIGN`
