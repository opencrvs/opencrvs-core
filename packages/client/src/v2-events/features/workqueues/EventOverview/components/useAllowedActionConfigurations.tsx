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
  InherentFlags,
  ClientSpecificAction,
  workqueueActions,
  Draft,
  ACTION_ALLOWED_CONFIGURABLE_SCOPES,
  getAuthorizedEventsFromScopes,
  findScope,
  isActionInScope,
  getScopes
} from '@opencrvs/commons/client'
import { IconProps } from '@opencrvs/components/src/Icon'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import {
  AssignmentStatus,
  getAssignmentStatus,
  getUsersFullName
} from '@client/v2-events/utils'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { getScope } from '@client/profile/profileSelectors'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { ITokenPayload } from '@client/utils/authUtils'
import { useModal } from '@client/hooks/useModal'
import { AssignModal } from '@client/v2-events/components/AssignModal'
import { useOnlineStatus } from '@client/utils'
import { UnassignModal } from '@client/v2-events/components/UnassignModal'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { useArchiveModal } from '@client/v2-events/hooks/useArchiveModal'

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
  [ActionType.ARCHIVE]: {
    defaultMessage: 'Archive',
    description: 'Label for archive record button in dropdown menu',
    id: 'v2.event.birth.action.archive.label'
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
  },
  [ActionType.REQUEST_CORRECTION]: {
    defaultMessage: 'Correct record',
    description: 'Label for request correction button in dropdown menu',
    id: 'v2.event.birth.action.request-correction.label'
  },
  [ClientSpecificAction.REVIEW_CORRECTION_REQUEST]: {
    defaultMessage: 'Review',
    description: 'Label for review correction button in dropdown menu',
    id: 'v2.event.action.review-correction.label'
  }
} as const

interface ActionConfig {
  label: TranslationConfig
  icon: IconProps['name']
  onClick: (workqueue?: string) => Promise<void> | void
  disabled?: boolean
  hidden?: boolean
}

interface ActionMenuItem extends ActionConfig {
  type: WorkqueueActionType | ClientSpecificAction
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

  const [assignModal, openAssignModal] = useModal()
  const intl = useIntl()
  const { getUser } = useUsers()
  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()
  const assignedToUser = getUser.useQuery(event.assignedTo || '', {
    enabled: !!event.assignedTo
  })
  const assignedUserFullName = assignedToUser.data
    ? getUsersFullName(assignedToUser.data.name, intl.locale)
    : null
  const assignedOffice = assignedToUser.data?.primaryOfficeId || ''
  const assignedOfficeName =
    locations.find((l) => l.id === assignedOffice)?.name || ''
  const { archiveModal, onArchive } = useArchiveModal()

  /**
   * Refer to https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries
   * This does not immediately execute the query but instead prepares it to be fetched conditionally when needed.
   */
  const { refetch: refetchEvent } = events.getEvent.findFromCache(event.id)

  const { mutate: deleteEvent } = events.deleteEvent.useMutation()
  const { eventConfiguration } = useEventConfiguration(event.type)

  const assignmentStatus = getAssignmentStatus(event, authentication.sub)

  const isDownloadedAndAssignedToUser =
    assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF && isDownloaded
  const hasDeclarationDraftOpen = draft?.action.type === ActionType.DECLARE

  const eventIsWaitingForCorrection = event.flags.includes(
    InherentFlags.CORRECTION_REQUESTED
  )

  const eventId = event.id
  const hasScopeForValidate = isActionInScope(
    authentication.scope,
    ActionType.VALIDATE,
    event.type
  )

  const isRejected = event.flags.includes(InherentFlags.REJECTED)
  const isDeclaredState = event.status === EventStatus.enum.DECLARED
  const isNotifiedState = event.status === EventStatus.enum.NOTIFIED

  // Incomplete declarations are always shown as "Review" for the reviewer.
  const isReviewingIncompleteDeclaration =
    hasScopeForValidate && !isRejected && isNotifiedState

  // Rejected declarations are always shown as "Review" for the reviewer.
  const isReviewingRejectedDeclaration =
    isRejected && (isNotifiedState || isDeclaredState)

  const isReviewingDeclaration =
    isReviewingIncompleteDeclaration || isReviewingRejectedDeclaration

  // By default, field agent has both scopes for incomplete (notify) and complete (declare) actions.
  // As a business rule, for notified event, client hides the declare action if the user has no scope for validate.
  const shouldHideDeclareAction =
    isNotifiedState && !hasScopeForValidate && !isRejected

  /**
   * Configuration should be kept simple. Actions should do one thing, or navigate to one place.
   * If you need to extend the functionality, consider whether it can be done elsewhere.
   */
  return {
    modals: [assignModal, archiveModal],
    config: {
      [ActionType.READ]: {
        label: actionLabels[ActionType.READ],
        icon: 'Eye' as const,
        onClick: () => navigate(ROUTES.V2.EVENTS.VIEW.buildPath({ eventId }))
      },
      [ActionType.ASSIGN]: {
        label: actionLabels[ActionType.ASSIGN],
        icon: 'PushPin' as const,
        onClick: async (workqueue?: string) => {
          const assign = await openAssignModal<boolean>((close) => (
            <AssignModal close={close} />
          ))
          if (!assign) {
            return
          }
          await events.actions.assignment.assign.mutate({
            eventId,
            assignedTo: authentication.sub,
            refetchEvent
          })
        },
        disabled:
          !isOnline ||
          // User may not assign themselves if record is waiting for correction approval/rejection but user is not allowed to do that
          (eventIsWaitingForCorrection &&
            !authentication.scope.includes(SCOPES.RECORD_REGISTRATION_CORRECT)),
        hidden: isNotifiedState && !isRejected && !hasScopeForValidate
      },
      [ActionType.UNASSIGN]: {
        label: actionLabels[ActionType.UNASSIGN],
        icon: 'ArrowCircleDown' as const,
        onClick: async () => {
          const unassign = await openAssignModal<boolean>((close) => (
            <UnassignModal
              assignedSelf={isDownloadedAndAssignedToUser}
              close={close}
              name={assignedUserFullName}
              officeName={assignedOfficeName}
            />
          ))
          if (!unassign) {
            return
          }
          await events.actions.assignment.unassign.mutateAsync({
            eventId,
            transactionId: getUUID(),
            assignedTo: null
          })
        },
        disabled: !isOnline
      },
      [ActionType.DECLARE]: {
        icon: 'PencilLine' as const,
        // NOTE: Only label changes for convenience. Trying to actually VALIDATE before DECLARE will not work.
        label: isReviewingDeclaration
          ? actionLabels[ActionType.VALIDATE]
          : actionLabels[ActionType.DECLARE],
        onClick: (workqueue?: string) => {
          clearEphemeralFormState()
          return navigate(
            ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath(
              { eventId },
              { workqueue }
            )
          )
        },
        disabled: !(isDownloadedAndAssignedToUser || hasDeclarationDraftOpen),
        hidden: shouldHideDeclareAction
      },
      [ActionType.VALIDATE]: {
        label: actionLabels[ActionType.VALIDATE],
        icon: 'PencilLine' as const,
        onClick: (workqueue?: string) => {
          clearEphemeralFormState()
          return navigate(
            ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath(
              { eventId },
              { workqueue }
            )
          )
        },
        disabled: !isDownloadedAndAssignedToUser
      },
      [ActionType.ARCHIVE]: {
        label: actionLabels[ActionType.ARCHIVE],
        icon: 'Archive' as const,
        onClick: async () => {
          await onArchive(event.id)
        },
        disabled: !isDownloadedAndAssignedToUser
      },
      [ActionType.REGISTER]: {
        label: actionLabels[ActionType.REGISTER],
        icon: 'PencilLine' as const,
        onClick: (workqueue?: string) => {
          clearEphemeralFormState()
          return navigate(
            ROUTES.V2.EVENTS.REGISTER.REVIEW.buildPath(
              { eventId },
              { workqueue }
            )
          )
        },
        disabled: !isDownloadedAndAssignedToUser
      },
      [ActionType.PRINT_CERTIFICATE]: {
        label: actionLabels[ActionType.PRINT_CERTIFICATE],
        icon: 'Printer' as const,
        onClick: (workqueue?: string) => {
          clearEphemeralFormState()
          return navigate(
            ROUTES.V2.EVENTS.PRINT_CERTIFICATE.buildPath(
              { eventId },
              { workqueue }
            )
          )
        },
        disabled: !isDownloadedAndAssignedToUser || eventIsWaitingForCorrection,
        hidden: eventIsWaitingForCorrection
      },
      [ActionType.DELETE]: {
        label: actionLabels[ActionType.DELETE],
        icon: 'Trash' as const,
        onClick: (workqueue?: string) => {
          deleteEvent({
            eventId: event.id
          })
          // What if there is a workqueue?
          if (!workqueue) {
            navigate(ROUTES.V2.buildPath({}))
          }
        },
        disabled: !isDownloadedAndAssignedToUser
      },
      [ActionType.REQUEST_CORRECTION]: {
        label: actionLabels[ActionType.REQUEST_CORRECTION],
        icon: 'NotePencil' as const,
        onClick: () => {
          const correctionPages = eventConfiguration.actions.find(
            (action) => action.type === ActionType.REQUEST_CORRECTION
          )?.correctionForm.pages

          if (!correctionPages) {
            throw new Error('No page ID found for request correction')
          }

          clearEphemeralFormState()

          // If no pages are configured, skip directly to review page
          if (correctionPages.length === 0) {
            navigate(ROUTES.V2.EVENTS.CORRECTION.REVIEW.buildPath({ eventId }))
            return
          }

          // If pages are configured, navigate to first page
          navigate(
            ROUTES.V2.EVENTS.CORRECTION.ONBOARDING.buildPath({
              eventId,
              pageId: correctionPages[0].id
            })
          )
        },
        disabled: !isDownloadedAndAssignedToUser || eventIsWaitingForCorrection,
        hidden: eventIsWaitingForCorrection
      },
      [ClientSpecificAction.REVIEW_CORRECTION_REQUEST]: {
        label: actionLabels[ClientSpecificAction.REVIEW_CORRECTION_REQUEST],
        icon: 'NotePencil' as const,
        onClick: () => {
          clearEphemeralFormState()
          navigate(
            ROUTES.V2.EVENTS.CORRECTION.REVIEW.buildPath({
              eventId
            })
          )
        },
        disabled: !isDownloadedAndAssignedToUser,
        hidden: !eventIsWaitingForCorrection
      }
    } satisfies Record<WorkqueueActionType & ClientSpecificAction, ActionConfig>
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

  const { config, modals } = useViewableActionConfigurations(
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

  const allowedWorkqueueConfigs: ActionMenuItem[] = [
    ...availableAssignmentActions,
    ...availableEventActions,
    ...openDraftAction
  ]
    // deduplicate after adding the draft
    .filter((action, index, self) => self.indexOf(action) === index)
    .filter(
      (action): action is WorkqueueActionType | ClientSpecificAction =>
        ClientSpecificAction.REVIEW_CORRECTION_REQUEST === action ||
        workqueueActions.safeParse(action).success
    )
    .filter((a) => isActionInScope(scopes, a, event.type))
    // We need to transform data and filter out hidden actions to ensure hasOnlyMetaAction receives the correct values.
    .map((a) => ({ ...config[a], type: a }))
    .filter((a: ActionConfig) => {
      console.log('a', a)
      return !a.hidden
    })

  // Check if the user can perform any action other than READ, ASSIGN, or UNASSIGN
  const hasOnlyMetaActions = allowedWorkqueueConfigs.every(({ type }) =>
    isMetaAction(type)
  )

  // If user has no other allowed actions, return only READ.
  // This is to prevent users from assigning or unassigning themselves to events which they cannot do anything with.
  if (hasOnlyMetaActions) {
    return [
      modals,
      [
        {
          ...config[ActionType.READ],
          type: ActionType.READ
        }
      ].filter((a: ActionConfig) => !a.hidden)
    ] satisfies [React.ReactNode, ActionMenuItem[]]
  }

  return [modals, allowedWorkqueueConfigs] satisfies [
    React.ReactNode,
    ActionMenuItem[]
  ]
}
