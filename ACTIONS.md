# Actions

Actions represent operations performed on an event record, such as a birth declaration. They determine the resulting state of the record and include, for example, form data submitted to that record.

## Core actions

Core actions, as the name suggests, are defined within the core and are available for all event types. They often contain specific UI elements or logic. In v2.0, the available core actions are:

- `CREATE`
- `READ`
- `ASSIGN` & `UNASSIGN`
- `DELETE`
- `NOTIFY`
- `DECLARE`\*, `VALIDATE`\* & `REGISTER`\*
- `REJECT`\*
- `ARCHIVE`
- `PRINT_CERTIFICATE`\*
- `REQUEST_CORRECTION`\*, `APPROVE_CORRECTION` & `REJECT_CORRECTION`
- `DUPLICATE_DETECTED`, `MARK_AS_DUPLICATE` & `MARK_AS_NOT_DUPLICATE`

_\* are configurable core actions, this is related to the flag configurations and action conditionals below_

Core actions can also change the event’s status, which custom actions cannot do.  
In v2.0, the available event statuses are:

`CREATED`, `NOTIFIED`, `DECLARED`, `REGISTERED`, `ARCHIVED`

The status is applied by the corresponding action.

## Custom actions

Custom actions are non-core actions that are defined only in the country configuration using `ActionType.CUSTOM`. All custom actions are “quick actions”, executed via a dialog on the event overview page. They can be configured with flag configurations, action conditionals, and a custom form displayed in the dialog.

<!-- TODO: add screenshot of custom action dialog here -->

## Flag configurations

Flag configurations define flags that should be added to or removed from a record when an action is executed. They can be applied either unconditionally (if no conditionals are specified) or conditionally based on factors such as form data, the role of the executing user, or the record’s current status or flags.

Flag configurations can be applied to any custom action and to any core action that supports configuration.

An example of a flag configuration, where the flag `approval-required-for-late-registration` is added if the `child.dob` form value is over 365 days in the past:

**Example:** Adding the flag `approval-required-for-late-registration` when `child.dob` is more than 365 days in the past:

```js
flags: [
  {
    id: 'approval-required-for-late-registration',
    operation: 'add',
    conditional: not(field('child.dob').isAfter().days(365).inPast())
  }
]
```

## Action conditionals

Action conditionals determine whether an action should be visible or enabled based on the record’s status or flags.

Like flag conditionals, they may be applied to any custom action and to any core action that supports configuration.

**Example:** Showing an action only when the record has the approval-required-for-late-registration flag:

```js
conditionals: [
  {
    type: ConditionalType.SHOW,
    conditional: flag('approval-required-for-late-registration')
  }
]
```

## Beyond v2.0

After the release of v2.0, we will review which core actions could be removed and implemented instead as custom actions within our Farajaland configuration. We expect the following actions may be transitioned to custom actions:

- `VALIDATE`
- `REJECT`
- `ARCHIVE`
- `DELETE`

These actions can be implemented easily as custom actions and are not necessarily required for all event types.
