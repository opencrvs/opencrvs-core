import { ActionDocument, CreatedAction } from '../ActionDocument'
import { EventDocument } from '../EventDocument'
import { EventIndex } from '../EventIndex'
import { EventStatus } from '../EventMetadata'

function getStatusFromActions(actions: Array<ActionDocument>) {
  return actions.reduce<EventStatus>((status, action) => {
    if (action.type === 'CREATE') {
      return 'CREATED'
    }
    if (action.type === 'DECLARE') {
      return 'DECLARED'
    }
    if (action.type === 'DRAFT') {
      return 'DRAFT'
    }
    if (action.type === 'REGISTER') {
      return 'REGISTERED'
    }
    return status
  }, 'CREATED')
}

function getAssignedUserFromActions(actions: Array<ActionDocument>) {
  return actions.reduce<null | string>((status, action) => {
    if (action.type === 'ASSIGN') {
      return action.assignedTo
    }
    if (action.type === 'UNASSIGN') {
      return null
    }
    return status
  }, null)
}

function getData(actions: Array<ActionDocument>) {
  return actions.reduce((status, action) => {
    return {
      ...status,
      ...action.data
    }
  }, {})
}

export function getCurrentEventState(event: EventDocument): EventIndex {
  const creationAction = event.actions.find(
    (action) => action.type === 'CREATE'
  ) as CreatedAction
  const latestAction = event.actions[event.actions.length - 1]

  return {
    id: event.id,
    type: event.type,
    status: getStatusFromActions(event.actions),
    createdAt: event.createdAt,
    createdBy: creationAction.createdBy,
    createdAtLocation: creationAction.createdAtLocation,
    modifiedAt: latestAction.createdAt,
    assignedTo: getAssignedUserFromActions(event.actions),
    updatedBy: latestAction.createdBy,
    data: getData(event.actions)
  }
}
