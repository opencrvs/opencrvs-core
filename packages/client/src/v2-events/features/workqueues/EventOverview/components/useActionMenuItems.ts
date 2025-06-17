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
import { useSelector } from 'react-redux'
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
  WorkqueueActionType
} from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { useAuthentication } from '@client/utils/userUtils'
import { AssignmentStatus, getAssignmentStatus } from '@client/v2-events/utils'
import { getScope } from '@client/profile/profileSelectors'

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
    case EventStatus.enum.CREATED: {
      return [ActionType.READ, ActionType.DECLARE, ActionType.DELETE]
    }
    case EventStatus.enum.NOTIFIED:
    case EventStatus.enum.DECLARED: {
      return [...assignmentActions, ActionType.READ, ActionType.VALIDATE]
    }
    case EventStatus.enum.VALIDATED: {
      return [...assignmentActions, ActionType.READ, ActionType.REGISTER]
    }
    case EventStatus.enum.CERTIFIED:
    case EventStatus.enum.REGISTERED: {
      return [
        ...assignmentActions,
        ActionType.READ,
        ActionType.PRINT_CERTIFICATE,
        ActionType.REQUEST_CORRECTION
      ]
    }
    case EventStatus.enum.REJECTED: {
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

    case EventStatus.enum.ARCHIVED:
      return [...assignmentActions, ActionType.READ]
    default:
      return [ActionType.READ]
  }
}

export interface ActionConfig {
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

export function useAction(event: EventIndex) {
  const events = useEvents()
  const navigate = useNavigate()
  const authentication = useAuthentication()

  /**
   * Refer to https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries
   * This does not immediately execute the query but instead prepares it to be fetched conditionally when needed.
   */
  const { refetch: refetchEvent } = events.getEvent.useQuery(event.id, false)

  const { mutate: deleteEvent } = events.deleteEvent.useMutation()

  if (!authentication) {
    throw new Error('Authentication is not available but is required')
  }

  const assignmentStatus = getAssignmentStatus(event, authentication.sub)

  const eventIsAssignedToSelf =
    assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF

  /**
   * Configuration should be kept simple. Actions should do one thing, or navigate to one place.
   * If you need to extend the functionality, consider whether it can be done elsewhere.
   */
  return {
    config: {
      [ActionType.READ]: {
        label: actionLabels[ActionType.READ],
        onClick: (workqueue?: string) =>
          navigate(ROUTES.V2.EVENTS.VIEW.buildPath({ eventId: event.id }))
      },
      [ActionType.ASSIGN]: {
        label: actionLabels[ActionType.ASSIGN],
        onClick: async (workqueue?: string) => {
          await events.actions.assignment.assign.mutate({
            eventId: event.id,
            assignedTo: authentication.sub,
            refetchEvent
          })
        }
      },
      [ActionType.UNASSIGN]: {
        label: actionLabels[ActionType.UNASSIGN],
        onClick: async (workqueue?: string) => {
          await events.actions.assignment.unassign.mutateAsync({
            eventId: event.id,
            transactionId: getUUID(),
            assignedTo: null
          })
        }
      },
      [ActionType.DECLARE]: {
        label: actionLabels[ActionType.DECLARE],
        onClick: (workqueue?: string) =>
          navigate(
            ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath(
              { eventId: event.id },
              { workqueue }
            )
          ),
        disabled: !eventIsAssignedToSelf
      },
      [ActionType.VALIDATE]: {
        label: actionLabels[ActionType.VALIDATE],
        onClick: (workqueue?: string) =>
          navigate(
            ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath(
              { eventId: event.id },
              { workqueue }
            )
          ),
        disabled: !eventIsAssignedToSelf
      },
      [ActionType.REGISTER]: {
        label: actionLabels[ActionType.REGISTER],
        onClick: (workqueue?: string) =>
          navigate(
            ROUTES.V2.EVENTS.REGISTER.REVIEW.buildPath(
              { eventId: event.id },
              { workqueue }
            )
          ),
        disabled: !eventIsAssignedToSelf
      },
      [ActionType.PRINT_CERTIFICATE]: {
        label: actionLabels[ActionType.PRINT_CERTIFICATE],
        onClick: (workqueue?: string) =>
          navigate(
            ROUTES.V2.EVENTS.PRINT_CERTIFICATE.buildPath(
              { eventId: event.id },
              { workqueue }
            )
          ),
        disabled: !eventIsAssignedToSelf
      },
      [ActionType.DELETE]: {
        label: actionLabels[ActionType.DELETE],
        onClick: (workqueue?: string) => {
          deleteEvent({
            eventId: event.id
          })
          if (!workqueue) {
            navigate(ROUTES.V2.buildPath({}))
          }
        }
      }
    } satisfies Record<WorkqueueActionType, ActionConfig>,
    authentication
  }
}

/**
 * @returns a list of action menu items based on the event state and scopes provided.
 */
export function useActionMenuItems(event: EventIndex) {
  const scopes = useSelector(getScope) ?? []
  const { config, authentication } = useAction(event)

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
