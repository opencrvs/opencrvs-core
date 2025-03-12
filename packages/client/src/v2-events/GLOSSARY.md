| Entity       | Description                                                                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Event        | A life event (e.g., dog adoption). An entry in the database describing a past life event and all steps (actions) involved in the process.                                      |
| EventConfig  | Description of event features defined by the country. Includes configuration for process steps (`Action`) and forms (`ActionConfig`) involved.                                 |
| EventInput   | A subset of an event. Describes fields that can be sent to the system with the intention of either creating or mutating a an event                                             |
| EventIndex   | A subset of an event. Describes how the event is stored in the search index. Contains static fields shared by all event types and custom fields defined by event configuration |
| Draft        | An action that has not been sent yet. Stored with details of the event, creator and creation time. Drafts are deleted when the action is committed.                            |
| User         | User in the system. Might be a practitioner or an admin or something else.                                                                                                     |
| Location     | Describes a physical location. Can be a admin structure, an office or something else. Cannot be anyone's personal home address                                                 |
| Action       | Event contains one or more actions. Action is a system event which triggers a status change. See `ActionConfig`                                                                |
| ActionConfig | Each action defines a form, which needs to be filled in order for the status to change. Configuration can have multiple forms, out of which **only one can be active**.        |
| FormConfig   | Form config defines separate read (`review`) and write (`pages`) configurations for itself.                                                                                    |
| Form data    | A collection of data points, i.e., a single blob of data derived from the history of actions applied to the event. It evolves over time.                                       |
| Metadata     | Metadata is data specific to one singular action like a comment, payment details, verification of identity, signature.                                                         |
