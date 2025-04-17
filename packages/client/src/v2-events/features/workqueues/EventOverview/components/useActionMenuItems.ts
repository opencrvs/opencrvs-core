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
  getAvailableActionsByScopes,
  Scope,
  EventIndex,
  getUUID,
  TranslationConfig,
  EventStatus
} from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { useAuthentication } from '@client/utils/userUtils'

/**
 * Actions that can be performed on an event based on its status, independent of the user scopes.
 *
 */
function getActionsByStatus(event: EventIndex): ActionType[] {
  switch (event.status) {
    case EventStatus.CREATED: {
      return [
        ActionType.READ,
        ActionType.DECLARE,
        ActionType.DELETE,
        ActionType.ASSIGN,
        ActionType.UNASSIGN
      ]
    }

    case EventStatus.NOTIFIED:
    case EventStatus.DECLARED: {
      return [
        ActionType.READ,
        ActionType.VALIDATE,
        ActionType.ASSIGN,
        ActionType.UNASSIGN
      ]
    }
    case EventStatus.VALIDATED: {
      return [
        ActionType.READ,
        ActionType.REGISTER,
        ActionType.ASSIGN,
        ActionType.UNASSIGN
      ]
    }
    case EventStatus.CERTIFIED:
    case EventStatus.REGISTERED: {
      return [
        ActionType.READ,
        ActionType.PRINT_CERTIFICATE,
        ActionType.REQUEST_CORRECTION,
        ActionType.ASSIGN,
        ActionType.UNASSIGN
      ]
    }
    case EventStatus.REJECTED: {
      return [
        ActionType.READ,
        ActionType.DECLARE,
        ActionType.VALIDATE,
        ActionType.ASSIGN,
        ActionType.UNASSIGN
      ]
    }
    case EventStatus.ARCHIVED:
    default:
      return [ActionType.READ]
  }
}

interface ActionConfig {
  label: TranslationConfig
  onClick: (eventId: string) => Promise<void> | void
}

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

  const config = {
    [ActionType.READ]: {
      label: {
        id: 'v2.action.view.record',
        description: 'Label for view record',
        defaultMessage: 'View record'
      },
      onClick: (eventId: string) =>
        navigate(ROUTES.V2.EVENTS.VIEW.buildPath({ eventId }))
    },
    [ActionType.ASSIGN]: {
      label: {
        defaultMessage: 'Assign',
        description: `Label for the ${ActionType.ASSIGN} action in the action menu`,
        id: 'v2.action.assign.label'
      },
      onClick: async (eventId: string) => {
        await events.actions.assignment.assign.mutate({
          eventId,
          assignedTo: authentication.sub,
          refetchEvent
        })
      }
    },
    [ActionType.UNASSIGN]: {
      label: {
        defaultMessage: 'Unassign',
        description: `Label for the ${ActionType.UNASSIGN} action in the action menu`,
        id: 'v2.action.unassign.label'
      },
      onClick: (eventId: string) => {
        events.actions.assignment.unassign.mutate({
          eventId,
          transactionId: getUUID(),
          assignedTo: null
        })
      }
    },
    [ActionType.DECLARE]: {
      label: {
        defaultMessage: 'Declare',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.birth.action.declare.label'
      },
      onClick: (eventId: string) =>
        navigate(ROUTES.V2.EVENTS.DECLARE.buildPath({ eventId }))
    },
    [ActionType.VALIDATE]: {
      label: {
        defaultMessage: 'Validate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.birth.action.validate.label'
      },
      onClick: (eventId: string) =>
        navigate(ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({ eventId }))
    },
    [ActionType.REGISTER]: {
      label: {
        defaultMessage: 'Register',
        description: 'Label for review record button in dropdown menu',
        id: 'v2.event.birth.action.register.label'
      },
      onClick: (eventId: string) =>
        navigate(ROUTES.V2.EVENTS.REGISTER.REVIEW.buildPath({ eventId }))
    },
    [ActionType.PRINT_CERTIFICATE]: {
      label: {
        defaultMessage: 'Print certificate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.birth.action.collect-certificate.label'
      },
      onClick: (eventId: string) =>
        navigate(ROUTES.V2.EVENTS.PRINT_CERTIFICATE.buildPath({ eventId }))
    }
  } satisfies Partial<Record<ActionType, ActionConfig>>

  const actionsByStatus = getActionsByStatus(event)
  const availableActions = getAvailableActionsByScopes(actionsByStatus, scopes)

  return availableActions
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
