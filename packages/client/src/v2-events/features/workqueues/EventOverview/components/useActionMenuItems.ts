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
  EventIndex,
  getUUID,
  TranslationConfig,
  SCOPES,
  ACTION_ALLOWED_SCOPES,
  hasAnyOfScopes,
  InherentFlags,
  WorkqueueActionType,
  AVAILABLE_ACTIONS_BY_EVENT_STATUS,
  EventStatus,
  isMetaAction
} from '@opencrvs/commons/client'
import { IconProps } from '@opencrvs/components/src/Icon'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { useAuthentication } from '@client/utils/userUtils'
import { AssignmentStatus, getAssignmentStatus } from '@client/v2-events/utils'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { getScope } from '@client/profile/profileSelectors'

const STATUSES_THAT_CAN_BE_ASSIGNED: EventStatus[] = [
  EventStatus.enum.NOTIFIED,
  EventStatus.enum.DECLARED,
  EventStatus.enum.VALIDATED,
  EventStatus.enum.REJECTED,
  EventStatus.enum.REGISTERED,
  EventStatus.enum.CERTIFIED,
  EventStatus.enum.ARCHIVED
]

function getAvailableAssignmentActions(
  eventStatus: EventStatus,
  assignmentStatus: keyof typeof AssignmentStatus,
  mayUnassignOthers: boolean
) {
  if (!STATUSES_THAT_CAN_BE_ASSIGNED.includes(eventStatus)) {
    return []
  }

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
interface ActionConfig {
  label: TranslationConfig
  icon: IconProps['name']
  onClick: (workqueue?: string) => Promise<void> | void
  disabled?: boolean
  shouldHide?: (actions: ActionType[]) => boolean
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
  },
  [ActionType.REQUEST_CORRECTION]: {
    defaultMessage: 'Request correction',
    description: 'Label for request correction button in dropdown menu',
    id: 'v2.event.birth.action.request-correction.label'
  }
} as const

export function useAction(event: EventIndex) {
  const scopes = useSelector(getScope) ?? []
  const events = useEvents()
  const navigate = useNavigate()
  const authentication = useAuthentication()
  const { findFromCache } = useEvents().getEvent
  const isDownloaded = Boolean(findFromCache(event.id).data)

  /**
   * Refer to https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries
   * This does not immediately execute the query but instead prepares it to be fetched conditionally when needed.
   */
  const { refetch: refetchEvent } = events.getEvent.findFromCache(event.id)

  const { mutate: deleteEvent } = events.deleteEvent.useMutation()
  const { eventConfiguration } = useEventConfiguration(event.type)

  if (!authentication) {
    throw new Error('Authentication is not available but is required')
  }

  const assignmentStatus = getAssignmentStatus(event, authentication.sub)

  const eventIsAssignedToSelf =
    assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF && isDownloaded

  const eventIsWaitingForCorrection = event.flags.includes(
    InherentFlags.CORRECTION_REQUESTED
  )
  const eventId = event.id

  /**
   * Configuration should be kept simple. Actions should do one thing, or navigate to one place.
   * If you need to extend the functionality, consider whether it can be done elsewhere.
   */
  return {
    config: {
      [ActionType.READ]: {
        label: actionLabels[ActionType.READ],
        icon: 'Eye',
        onClick: () => navigate(ROUTES.V2.EVENTS.VIEW.buildPath({ eventId }))
      },
      [ActionType.ASSIGN]: {
        label: actionLabels[ActionType.ASSIGN],
        icon: 'PushPin',
        onClick: async () => {
          await events.actions.assignment.assign.mutate({
            eventId,
            assignedTo: authentication.sub,
            refetchEvent
          })
        },
        disabled:
          // User may not assign themselves if record is waiting for correction approval/rejection but user is not allowed to do that
          eventIsWaitingForCorrection &&
          !scopes.includes(SCOPES.RECORD_REGISTRATION_CORRECT)
      },
      [ActionType.UNASSIGN]: {
        label: actionLabels[ActionType.UNASSIGN],
        icon: 'ArrowCircleDown',
        onClick: async () => {
          await events.actions.assignment.unassign.mutateAsync({
            eventId,
            transactionId: getUUID(),
            assignedTo: null
          })
        }
      },
      [ActionType.DECLARE]: {
        label: actionLabels[ActionType.DECLARE],
        icon: 'PencilLine',
        onClick: (workqueue?) =>
          navigate(
            ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath(
              { eventId },
              { workqueue }
            )
          ),
        disabled: !eventIsAssignedToSelf,
        // Action menu should not show DECLARE if the user can perform VALIDATE
        shouldHide: (actions) => actions.includes(ActionType.VALIDATE)
      },
      [ActionType.VALIDATE]: {
        label: actionLabels[ActionType.VALIDATE],
        icon: 'PencilLine',
        onClick: (workqueue?) =>
          navigate(
            ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath(
              { eventId },
              { workqueue }
            )
          ),
        disabled: !eventIsAssignedToSelf
      },
      [ActionType.REGISTER]: {
        label: actionLabels[ActionType.REGISTER],
        icon: 'PencilLine',
        onClick: (workqueue?) =>
          navigate(
            ROUTES.V2.EVENTS.REGISTER.REVIEW.buildPath(
              { eventId },
              { workqueue }
            )
          ),
        disabled: !eventIsAssignedToSelf
      },
      [ActionType.PRINT_CERTIFICATE]: {
        label: actionLabels[ActionType.PRINT_CERTIFICATE],
        icon: 'Printer',
        onClick: (workqueue?) =>
          navigate(
            ROUTES.V2.EVENTS.PRINT_CERTIFICATE.buildPath(
              { eventId },
              { workqueue }
            )
          ),
        disabled: !eventIsAssignedToSelf || eventIsWaitingForCorrection,
        shouldHide: () => eventIsWaitingForCorrection
      },
      [ActionType.DELETE]: {
        label: actionLabels[ActionType.DELETE],
        icon: 'Trash',
        onClick: (workqueue?) => {
          deleteEvent({ eventId })
          if (!workqueue) {
            navigate(ROUTES.V2.buildPath({}))
          }
        }
      },
      [ActionType.REQUEST_CORRECTION]: {
        label: actionLabels[ActionType.REQUEST_CORRECTION],
        icon: 'NotePencil',
        onClick: () => {
          const correctionPages = eventConfiguration.actions.find(
            (action) => action.type === ActionType.REQUEST_CORRECTION
          )?.correctionForm.pages

          if (!correctionPages) {
            throw new Error('No page ID found for request correction')
          }

          // If no pages are configured, skip directly to review page
          if (correctionPages.length === 0) {
            navigate(
              ROUTES.V2.EVENTS.REQUEST_CORRECTION.REVIEW.buildPath({ eventId })
            )
            return
          }

          // If pages are configured, navigate to first page
          navigate(
            ROUTES.V2.EVENTS.REQUEST_CORRECTION.ONBOARDING.buildPath({
              eventId,
              pageId: correctionPages[0].id
            })
          )
        },
        disabled: !eventIsAssignedToSelf || eventIsWaitingForCorrection,
        shouldHide: () =>
          eventIsWaitingForCorrection &&
          !scopes.includes(SCOPES.RECORD_REGISTRATION_CORRECT)
      }
    } satisfies Record<WorkqueueActionType, ActionConfig>,
    authentication
  }
}

const ACTION_MENU_ACTIONS_BY_EVENT_STATUS = {
  [EventStatus.enum.NOTIFIED]: [
    ActionType.READ,
    ActionType.VALIDATE,
    ActionType.ARCHIVE,
    ActionType.REJECT
  ],
  [EventStatus.enum.REJECTED]: [
    ActionType.READ,
    ActionType.DECLARE,
    ActionType.VALIDATE
  ]
} satisfies Partial<Record<EventStatus, ActionType[]>>

/**
 * @returns a list of action menu items based on the event state and scopes provided.
 */
export function useActionMenuItems(event: EventIndex) {
  const scopes = useSelector(getScope) ?? []
  const { config, authentication } = useAction(event)

  const availableAssignmentActions = getAvailableAssignmentActions(
    event.status,
    getAssignmentStatus(event, authentication.sub),
    authentication.scope.includes(SCOPES.RECORD_UNASSIGN_OTHERS)
  )

  // Find actions available based on the event status
  const availableActions =
    event.status in ACTION_MENU_ACTIONS_BY_EVENT_STATUS
      ? ACTION_MENU_ACTIONS_BY_EVENT_STATUS[
          event.status as keyof typeof ACTION_MENU_ACTIONS_BY_EVENT_STATUS
        ]
      : AVAILABLE_ACTIONS_BY_EVENT_STATUS[event.status]

  const actions = [...availableAssignmentActions, ...availableActions]

  // Filter out actions which are not configured
  const supportedActions = actions.filter(
    (action): action is keyof typeof config =>
      Object.keys(config).includes(action)
  )

  // Filter out actions which are not allowed based on user scopes
  const allowedActions = supportedActions.filter((a) => {
    const requiredScopes = ACTION_ALLOWED_SCOPES[a]
    return requiredScopes === null
      ? true
      : hasAnyOfScopes(scopes, requiredScopes)
  })

  // Filter out actions which are not visible based on the action config 'shouldHide' function
  const visibleActions = allowedActions.filter((a) => {
    const actionConfig = config[a]

    return 'shouldHide' in actionConfig
      ? !actionConfig.shouldHide(allowedActions)
      : true
  })

  // Check if the user can perform any action other than READ, ASSIGN, or UNASSIGN
  const hasOtherAllowedActions = visibleActions.some((a) => !isMetaAction(a))

  // If user has no other allowed actions, return only READ.
  // This is to prevent users from assigning or unassigning themselves to events which they cannot do anything with.

  if (!hasOtherAllowedActions) {
    return [
      {
        ...config[ActionType.READ],
        type: ActionType.READ
      }
    ]
  }

  return visibleActions.map((a) => ({ ...config[a], type: a }))
}
