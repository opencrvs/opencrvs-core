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
import React from 'react'
import { useIntl } from 'react-intl'
import {
  ActionType,
  EventIndex,
  getUUID,
  TranslationConfig,
  SCOPES,
  ACTION_ALLOWED_SCOPES,
  hasAnyOfScopes,
  WorkqueueActionType,
  EventStatus,
  isMetaAction,
  getAvailableActionsForEvent,
  InherentFlags
} from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { useAuthentication } from '@client/utils/userUtils'
import {
  AssignmentStatus,
  getAssignmentStatus,
  getUsersFullName
} from '@client/v2-events/utils'
import { getScope } from '@client/profile/profileSelectors'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { useModal } from '@client/hooks/useModal'
import { AssignModal } from '@client/v2-events/components/AssignModal'
import { useOnlineStatus } from '@client/utils'
import { UnassignModal } from '@client/v2-events/components/UnassignModal'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { getLocations } from '@client/offline/selectors'

const STATUSES_THAT_CAN_BE_ASSIGNED: EventStatus[] = [
  EventStatus.enum.NOTIFIED,
  EventStatus.enum.DECLARED,
  EventStatus.enum.VALIDATED,
  EventStatus.enum.REGISTERED,
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
  onClick: (eventId: string) => Promise<void> | void
  disabled?: boolean
  shouldHide?: (actions: ActionType[]) => boolean
}

export const actionLabels = {
  [ActionType.READ]: {
    id: 'v2.action.view.record',
    description: 'Label for view record',
    defaultMessage: 'View'
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
    defaultMessage: 'Review',
    description:
      'This is shown as the action name anywhere the user can trigger the action from',
    id: 'v2.event.birth.action.validate.label'
  },
  [ActionType.REGISTER]: {
    defaultMessage: 'Review',
    description: 'Label for review record button in dropdown menu',
    id: 'v2.event.birth.action.register.label'
  },
  [ActionType.PRINT_CERTIFICATE]: {
    defaultMessage: 'Print',
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
  const drafts = useDrafts()
  const authentication = useAuthentication()
  const isOnline = useOnlineStatus()
  const { clearEphemeralFormState } = useEventFormNavigation()
  const { findFromCache } = useEvents().getEvent
  const isDownloaded = Boolean(findFromCache(event.id).data)
  const [modal, openModal] = useModal()
  const intl = useIntl()
  const { getUser } = useUsers()
  const locations = useSelector(getLocations)
  const assignedToUser = getUser.useQuery(event.assignedTo || '', {
    enabled: !!event.assignedTo
  })
  const assignedUserFullName = assignedToUser.data
    ? getUsersFullName(assignedToUser.data.name, intl.locale)
    : null
  const assignedOffice = assignedToUser.data?.primaryOfficeId || ''
  const assignedOfficeName = locations[assignedOffice]?.name || null

  /**
   * Refer to https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries
   * This does not immediately execute the query but instead prepares it to be fetched conditionally when needed.
   */
  const { refetch: refetchEvent } = events.getEvent.findFromCache(event.id)

  const { mutate: deleteEvent } = events.deleteEvent.useMutation()

  if (!authentication) {
    throw new Error('Authentication is not available but is required')
  }

  const assignmentStatus = getAssignmentStatus(event, authentication.sub)

  const eventIsAssignedToSelf =
    assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF && isDownloaded

  const openDraft = drafts
    .getAllRemoteDrafts()
    .find((draft) => draft.eventId === event.id)

  const hasDeclarationDraftOpen = openDraft?.action.type === ActionType.DECLARE

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
          const assign = await openModal<boolean>((close) => (
            <AssignModal close={close} />
          ))
          if (!assign) {
            return
          }
          await events.actions.assignment.assign.mutate({
            eventId: event.id,
            assignedTo: authentication.sub,
            refetchEvent
          })
        },
        disabled: !isOnline
      },
      [ActionType.UNASSIGN]: {
        label: actionLabels[ActionType.UNASSIGN],
        onClick: async (workqueue?: string) => {
          const unassign = await openModal<boolean>((close) => (
            <UnassignModal
              assignedSelf={eventIsAssignedToSelf}
              close={close}
              name={assignedUserFullName}
              officeName={assignedOfficeName}
            />
          ))
          if (!unassign) {
            return
          }
          await events.actions.assignment.unassign.mutateAsync({
            eventId: event.id,
            transactionId: getUUID(),
            assignedTo: null
          })
        },
        disabled: !isOnline
      },
      [ActionType.DECLARE]: {
        label: actionLabels[ActionType.DECLARE],
        onClick: (workqueue?: string) => {
          clearEphemeralFormState()
          return navigate(
            ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath(
              { eventId: event.id },
              { workqueue }
            )
          )
        },
        disabled: !(eventIsAssignedToSelf || hasDeclarationDraftOpen),
        // Action menu should not show DECLARE if the user can perform VALIDATE
        shouldHide: (actions) => actions.includes(ActionType.VALIDATE)
      },
      [ActionType.VALIDATE]: {
        label: actionLabels[ActionType.VALIDATE],
        onClick: (workqueue?: string) => {
          clearEphemeralFormState()
          return navigate(
            ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath(
              { eventId: event.id },
              { workqueue }
            )
          )
        },
        disabled: !eventIsAssignedToSelf
      },
      [ActionType.REGISTER]: {
        label: actionLabels[ActionType.REGISTER],
        onClick: (workqueue?: string) => {
          clearEphemeralFormState()
          return navigate(
            ROUTES.V2.EVENTS.REGISTER.REVIEW.buildPath(
              { eventId: event.id },
              { workqueue }
            )
          )
        },
        disabled: !eventIsAssignedToSelf
      },
      [ActionType.PRINT_CERTIFICATE]: {
        label: actionLabels[ActionType.PRINT_CERTIFICATE],
        onClick: (workqueue?: string) => {
          clearEphemeralFormState()
          return navigate(
            ROUTES.V2.EVENTS.PRINT_CERTIFICATE.buildPath(
              { eventId: event.id },
              { workqueue }
            )
          )
        },
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
    authentication,
    modal
  }
}

const ACTION_MENU_ACTIONS_BY_EVENT_STATUS = {
  [EventStatus.enum.NOTIFIED]: [
    ActionType.READ,
    ActionType.VALIDATE,
    ActionType.ARCHIVE,
    ActionType.REJECT
  ]
} satisfies Partial<Record<EventStatus, ActionType[]>>

interface ActionMenuItem
  extends Partial<Record<WorkqueueActionType, ActionConfig>> {
  type: ActionType
}
/**
 * @returns a tuple containing a modal (which must be rendered in the parent where this hook is called)
 * and a list of action menu items based on the event state and scopes provided.
 */
export function useActionMenuItems(event: EventIndex) {
  const scopes = useSelector(getScope) ?? []
  const { config, authentication, modal } = useAction(event)

  const availableAssignmentActions = getAvailableAssignmentActions(
    event.status,
    getAssignmentStatus(event, authentication.sub),
    authentication.scope.includes(SCOPES.RECORD_UNASSIGN_OTHERS)
  )

  // Find actions available based on the event status
  const availableActions =
    !event.flags.includes(InherentFlags.REJECTED) &&
    event.status in ACTION_MENU_ACTIONS_BY_EVENT_STATUS
      ? ACTION_MENU_ACTIONS_BY_EVENT_STATUS[
          event.status as keyof typeof ACTION_MENU_ACTIONS_BY_EVENT_STATUS
        ]
      : getAvailableActionsForEvent(event)

  const drafts = useDrafts()

  const openDraft = drafts
    .getAllRemoteDrafts()
    .find((draft) => draft.eventId === event.id)

  const actions = [...availableAssignmentActions, ...availableActions]
    /*
     * Ensure that if there is an open draft, that action is always included in the list
     */
    .concat(openDraft ? [openDraft.action.type] : [])
    .filter((action, index, self) => self.indexOf(action) === index)

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

  // Filter out actions which are not visible based on the action config
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
      modal,
      [
        {
          ...config[ActionType.READ],
          type: ActionType.READ
        }
      ]
    ] satisfies [React.ReactNode, ActionMenuItem[]]
  }

  return [
    modal,
    visibleActions.map((a) => ({ ...config[a], type: a }))
  ] satisfies [React.ReactNode, ActionMenuItem[]]
}
