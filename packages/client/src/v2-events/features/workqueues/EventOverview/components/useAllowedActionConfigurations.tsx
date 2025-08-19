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
  workqueueActions,
  Draft,
  InherentFlags
} from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { AssignmentStatus, getAssignmentStatus } from '@client/v2-events/utils'
import { getScope } from '@client/profile/profileSelectors'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { ITokenPayload } from '@client/utils/authUtils'
import { useModal } from '@client/hooks/useModal'
import { AssignModal } from '@client/v2-events/components/AssignModal'
import { useOnlineStatus } from '@client/utils'

const STATUSES_THAT_CAN_BE_ASSIGNED: EventStatus[] = [
  EventStatus.enum.NOTIFIED,
  EventStatus.enum.DECLARED,
  EventStatus.enum.VALIDATED,
  EventStatus.enum.REGISTERED,
  EventStatus.enum.ARCHIVED
]

function getAvailableAssignmentActions(
  event: EventIndex,
  authentication: ITokenPayload
) {
  const assignmentStatus = getAssignmentStatus(event, authentication.sub)
  const eventStatus = event.status
  const mayUnassignOthers = authentication.scope.includes(
    SCOPES.RECORD_UNASSIGN_OTHERS
  )

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
  hidden?: boolean
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

interface ActionMenuItem
  extends Partial<Record<WorkqueueActionType, ActionConfig>> {
  type: ActionType
}

/**
 * Get viewable actions for event
 * @param event The event to get actions for.
 * @param authentication The user's authentication information.
 * @returns A mapping of action types to their configurations. Not necessarily all actions are enabled without changes. (e.g. assignment is missing.)
 */
function useViewableActionConfigurations(
  event: EventIndex,
  authentication: ITokenPayload,
  draft?: Draft
) {
  const events = useEvents()
  const navigate = useNavigate()

  const isOnline = useOnlineStatus()
  const { clearEphemeralFormState } = useEventFormNavigation()

  const { findFromCache } = useEvents().getEvent
  const isDownloaded = Boolean(findFromCache(event.id).data)
  const [modal, openModal] = useModal()

  /**
   * Refer to https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries
   * This does not immediately execute the query but instead prepares it to be fetched conditionally when needed.
   */
  const { refetch: refetchEvent } = events.getEvent.findFromCache(event.id)

  const { mutate: deleteEvent } = events.deleteEvent.useMutation()

  const assignmentStatus = getAssignmentStatus(event, authentication.sub)

  const isDownloadedAndAssignedToUser =
    assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF && isDownloaded

  const hasDeclarationDraftOpen = draft?.action.type === ActionType.DECLARE

  const hasScopeForValidate = hasAnyOfScopes(
    authentication.scope,
    ACTION_ALLOWED_SCOPES[ActionType.VALIDATE]
  )
  const isRejected = event.flags.includes(InherentFlags.REJECTED)
  const isNotifiedState = event.status === EventStatus.enum.NOTIFIED
  // What reads on the button is important but secondary. We need to perform the actions in certain order for them to succeed.
  const shouldShowDeclareAsReview =
    hasScopeForValidate && !isRejected && isNotifiedState

  // By default, field agent has both scopes for incomplete (notify) and complete (declare) actions.
  // As a business rule, for notified event, client hides the declare action if the user has no scope for validate.
  const shouldHideDeclareAction =
    isNotifiedState && !hasScopeForValidate && !isRejected

  /**
   * Configuration should be kept simple. Actions should do one thing, or navigate to one place.
   * If you need to extend the functionality, consider whether it can be done elsewhere.
   */
  return {
    modal,
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
        hidden: isNotifiedState && !isRejected && !hasScopeForValidate,
        disabled: !isOnline
      },
      [ActionType.UNASSIGN]: {
        label: actionLabels[ActionType.UNASSIGN],
        onClick: async (workqueue?: string) => {
          await events.actions.assignment.unassign.mutateAsync({
            eventId: event.id,
            transactionId: getUUID(),
            assignedTo: null
          })
        },
        disabled: !isOnline
      },
      [ActionType.DECLARE]: {
        // NOTE: Only label changes for convenience. Trying to actually VALIDATE before DECLARE will not work.
        label: shouldShowDeclareAsReview
          ? actionLabels[ActionType.VALIDATE]
          : actionLabels[ActionType.DECLARE],
        onClick: (workqueue?: string) => {
          clearEphemeralFormState()
          return navigate(
            ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath(
              { eventId: event.id },
              { workqueue }
            )
          )
        },
        disabled: !(isDownloadedAndAssignedToUser || hasDeclarationDraftOpen),
        hidden: shouldHideDeclareAction
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
        disabled: !isDownloadedAndAssignedToUser
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
        disabled: !isDownloadedAndAssignedToUser
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
        disabled: !isDownloadedAndAssignedToUser
      },
      [ActionType.DELETE]: {
        label: actionLabels[ActionType.DELETE],
        onClick: (workqueue?: string) => {
          deleteEvent({
            eventId: event.id
          })
          // What if there is a workqueue?
          if (!workqueue) {
            navigate(ROUTES.V2.buildPath({}))
          }
        }
      }
    } satisfies Record<WorkqueueActionType, ActionConfig>
  }
}

/**
 *
 * NOTE: In principle, you should never add new business rules to the `useAction` hook alone. All the actions are validated by the server and their order is enforced.
 * Each action has their own route and will take care of the actions needed. If you "skip" action (e.g. showing 'VALIDATE' instead of 'DECLARE') by directing the user to the wrong route, it will fail at the end.
 *
 * @returns a tuple containing a modal (which must be rendered in the parent where this hook is called) and a list of action menu items based on the event state and scopes provided.
 */
export function useAllowedActionConfigurations(
  event: EventIndex,
  authentication: ITokenPayload
) {
  const scopes = useSelector(getScope) ?? []
  const drafts = useDrafts()

  const openDraft = drafts
    .getAllRemoteDrafts()
    .find((draft) => draft.eventId === event.id)

  const { config, modal } = useViewableActionConfigurations(
    event,
    authentication,
    openDraft
  )

  const availableAssignmentActions = getAvailableAssignmentActions(
    event,
    authentication
  )
  const availableEventActions = getAvailableActionsForEvent(event)

  const openDraftAction = openDraft ? [openDraft.action.type] : []

  const allowedWorkqueueActions = [
    ...availableAssignmentActions,
    ...availableEventActions,
    ...openDraftAction
  ]
    // deduplicate after adding the draft
    .filter((action, index, self) => self.indexOf(action) === index)
    .filter(
      (action): action is WorkqueueActionType =>
        workqueueActions.safeParse(action).success
    )
    .filter((a) => {
      const requiredScopes = ACTION_ALLOWED_SCOPES[a]
      return requiredScopes === null
        ? true
        : hasAnyOfScopes(scopes, requiredScopes)
    })

  // Check if the user can perform any action other than READ, ASSIGN, or UNASSIGN
  const hasOnlyMetaActions = allowedWorkqueueActions.every(isMetaAction)

  // If user has no other allowed actions, return only READ.
  // This is to prevent users from assigning or unassigning themselves to events which they cannot do anything with.
  if (hasOnlyMetaActions) {
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
    allowedWorkqueueActions
      .map((a) => ({ ...config[a], type: a }))
      .filter((a: ActionConfig) => !a.hidden)
  ] satisfies [React.ReactNode, ActionMenuItem[]]
}
