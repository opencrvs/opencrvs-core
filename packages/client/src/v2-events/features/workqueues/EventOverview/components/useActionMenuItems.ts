/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { useNavigate } from 'react-router-dom'
import {
  ActionType,
  filterUnallowedActions,
  Scope,
  EventIndex,
  getUUID,
  TranslationConfig,
  EventStatus,
  SCOPES,
  ACTION_ALLOWED_SCOPES,
  hasAnyOfScopes,
  IndexMap
} from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { useAuthentication } from '@client/utils/userUtils'
import { AssignmentStatus, getAssignmentStatus } from '@client/v2-events/utils'

function getAssignmentActions(
  assignmentStatus: keyof typeof AssignmentStatus,
  mayUnassignOthers: boolean
) {
  if (assignmentStatus === AssignmentStatus.UNASSIGNED) {
    return [ActionType.ASSIGN]
  }

  if (
    assignmentStatus === AssignmentStatus.ASSIGNED_TO_OTHERS &&
    mayUnassignOthers
  ) {
    return [ActionType.UNASSIGN]
  }

  if (assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF) {
    return [ActionType.UNASSIGN]
  }

  return []
}

/**
 * Actions that can be performed on an event based on its status and user scope.
 */

function getUserActionsByStatus(
  status: EventStatus,
  assignmentActions: ActionType[],
  userScopes: Scope[]
): ActionType[] {
  switch (status) {
    case EventStatus.CREATED: {
      return [ActionType.READ, ActionType.DECLARE, ActionType.DELETE]
    }
    case EventStatus.NOTIFIED:
    case EventStatus.DECLARED: {
      return [...assignmentActions, ActionType.READ, ActionType.VALIDATE]
    }
    case EventStatus.VALIDATED: {
      return [...assignmentActions, ActionType.READ, ActionType.REGISTER]
    }
    case EventStatus.CERTIFIED:
    case EventStatus.REGISTERED: {
      return [
        ...assignmentActions,
        ActionType.READ,
        ActionType.PRINT_CERTIFICATE,
        ActionType.REQUEST_CORRECTION
      ]
    }
    case EventStatus.REJECTED: {
      const validateScopes = ACTION_ALLOWED_SCOPES[ActionType.VALIDATE]
      const canValidate = hasAnyOfScopes(userScopes, validateScopes)

      /**
       * Show 'higher' action when the user has the required scopes.
       */
      const declarationAction = canValidate
        ? ActionType.VALIDATE
        : ActionType.DECLARE

      return [...assignmentActions, ActionType.READ, declarationAction]
    }

    case EventStatus.ARCHIVED:
      return [...assignmentActions, ActionType.READ]
    default:
      return [ActionType.READ]
  }
}

interface ActionConfig {
  label: TranslationConfig
  onClick: (eventId: string) => Promise<void> | void
  disabled?: boolean
}

export const actionLabels = {
  [ActionType.READ]: {
    id: 'v2.action.view.record',
    description: 'Label for view record',
    defaultMessage: 'View record'
  },
  [ActionType.ASSIGN]: {
    defaultMessage: 'Assign',
    description: `Label for the ${ActionType.ASSIGN} action in the action menu`,
    id: 'v2.action.assign.label'
  },
  [ActionType.UNASSIGN]: {
    defaultMessage: 'Unassign',
    description: `Label for the ${ActionType.UNASSIGN} action in the action menu`,
    id: 'v2.action.unassign.label'
  },
  [ActionType.DECLARE]: {
    defaultMessage: 'Declare',
    description:
      'This is shown as the action name anywhere the user can trigger the action from',
    id: 'v2.event.birth.action.declare.label'
  },
  [ActionType.VALIDATE]: {
    defaultMessage: 'Validate',
    description:
      'This is shown as the action name anywhere the user can trigger the action from',
    id: 'v2.event.birth.action.validate.label'
  },
  [ActionType.REGISTER]: {
    defaultMessage: 'Register',
    description: 'Label for review record button in dropdown menu',
    id: 'v2.event.birth.action.register.label'
  },
  [ActionType.PRINT_CERTIFICATE]: {
    defaultMessage: 'Print certificate',
    description:
      'This is shown as the action name anywhere the user can trigger the action from',
    id: 'v2.event.birth.action.collect-certificate.label'
  },
  [ActionType.DELETE]: {
    defaultMessage: 'Delete',
    description: 'Label for delete button in dropdown menu',
    id: 'v2.event.birth.action.delete.label'
  }
} as const

/**
 * @returns a list of action menu items based on the event state and scopes provided.
 */
export function useActionMenuItems(event: EventIndex, scopes: Scope[]) {
  const events = useEvents()
  const navigate = useNavigate()
  const authentication = useAuthentication()
  /**
   * Refer to https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries
   * This does not immediately execute the query but instead prepares it to be fetched conditionally when needed.
   */
  const { refetch: refetchEvent } = events.getEvent.useQuery(event.id, false)

  if (!authentication) {
    throw new Error('Authentication is not available but is required')
  }

  const { mutate: deleteEvent } = events.deleteEvent.useMutation()

  const assignmentStatus = getAssignmentStatus(event, authentication.sub)

  const eventIsAssignedToSelf =
    assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF

  /**
   * Configuration should be kept simple. Actions should do one thing, or navigate to one place.
   * If you need to extend the functionality, consider whether it can be done elsewhere.
   */
  const config = {
    [ActionType.READ]: {
      label: actionLabels[ActionType.READ],
      onClick: (eventId: string) =>
        navigate(ROUTES.V2.EVENTS.VIEW.buildPath({ eventId }))
    },
    [ActionType.ASSIGN]: {
      label: actionLabels[ActionType.ASSIGN],
      onClick: async (eventId: string) => {
        await events.actions.assignment.assign.mutate({
          eventId,
          assignedTo: authentication.sub,
          refetchEvent
        })
      }
    },
    [ActionType.UNASSIGN]: {
      label: actionLabels[ActionType.UNASSIGN],
      onClick: (eventId: string) => {
        events.actions.assignment.unassign.mutate({
          eventId,
          transactionId: getUUID(),
          assignedTo: null
        })
      }
    },
    [ActionType.DECLARE]: {
      label: actionLabels[ActionType.DECLARE],
      onClick: (eventId: string) =>
        navigate(ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({ eventId })),
      disabled: !eventIsAssignedToSelf
    },
    [ActionType.VALIDATE]: {
      label: actionLabels[ActionType.VALIDATE],
      onClick: (eventId: string) =>
        navigate(ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({ eventId })),
      disabled: !eventIsAssignedToSelf
    },
    [ActionType.REGISTER]: {
      label: actionLabels[ActionType.REGISTER],
      onClick: (eventId: string) =>
        navigate(ROUTES.V2.EVENTS.REGISTER.REVIEW.buildPath({ eventId })),
      disabled: !eventIsAssignedToSelf
    },
    [ActionType.PRINT_CERTIFICATE]: {
      label: actionLabels[ActionType.PRINT_CERTIFICATE],
      onClick: (eventId: string) =>
        navigate(ROUTES.V2.EVENTS.PRINT_CERTIFICATE.buildPath({ eventId })),
      disabled: !eventIsAssignedToSelf
    },
    [ActionType.DELETE]: {
      label: actionLabels[ActionType.DELETE],
      onClick: (eventId: string) => {
        deleteEvent({
          eventId
        })
        navigate(ROUTES.V2.buildPath({}))
      }
    }
  } satisfies Partial<Record<ActionType, ActionConfig>>

  const assignmentActions = getAssignmentActions(
    getAssignmentStatus(event, authentication.sub),
    authentication.scope.includes(SCOPES.RECORD_UNASSIGN_OTHERS)
  )

  const availableActions = getUserActionsByStatus(
    event.status,
    assignmentActions,
    scopes
  )

  const allowedActions = filterUnallowedActions(availableActions, scopes)
  return allowedActions
    .filter((action): action is keyof typeof config =>
      Object.keys(config).includes(action)
    )
    .map((action) => {
      return {
        ...config[action],
        type: action
      }
    })
}
