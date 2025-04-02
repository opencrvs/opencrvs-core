# Configuring V2 Events

## Configuration concepts

### Event

A life event (e.g., dog adoption). An entry in the database describing a past life event and all steps (actions) involved in the process.

On high-level, event defines a form (`declaration`), which specifies the `data` needed to complete event registration.
Information is gathered through specific **declaration actions**. Actions gather additional metadata by defining `review` property. The information input in review fields are part of `action metadata`. Metadata is always specific to action.

Events after registration are called **record actions**. As a rule of thumb, unless **record** needs to be corrected (`REQUEST_CORRECTION`), they can only change metadata.

### Event declaration

1. Declaration defines is a common form configuration for gathering event `data`.
2. Declaration `data` is available to all actions.
3. Actions up to `REGISTER` can make changes to declaration. `(NOTIFY) -> DECLARE -> VALIDATE -> REGISTER`
4. Once event declaration is `REGISTERED`, and becomes a `record`, only `REQUEST_CORRECTION` can update the data.

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

Actions write `data` based on event `declaration` configuration.
Actions may have fields in review page, which write to `metadata`.
"System actions" (e.g. ARCHIVE) are related to action but do not produce data and cannot be configured.

Once `declaration` is registered it becomes a `record`.

#### Record actions

1. `PRINT_CERTIFICATE`
2. `ISSUE_CERTIFICATE`
3. `REQUEST_CORRECTION` // Only action that can modify `data` after `REGISTER`.
   3.1. `REJECT_CORRECTION`
   3.2. `APPROVE_CORRECTION`

By definition, `record` actions modify registered declarations, records.
Record actions can read declaration `data` but only write to `metadata`.
`REQUEST_CORRECTION` makes an exception to this rule.

### General actions

1. `READ`
2. `ASSIGN`
3. `UNASSIGN`
