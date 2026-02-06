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
import React, { useCallback } from 'react'
import { useIntl } from 'react-intl'
import {
  ActionType,
  EventIndex,
  getUUID,
  InherentFlags,
  ClientSpecificAction,
  Draft,
  isActionInScope,
  ITokenPayload
} from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import {
  AssignmentStatus,
  getAssignmentStatus,
  getUsersFullName
} from '@client/v2-events/utils'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { useModal } from '@client/hooks/useModal'
import { AssignModal } from '@client/v2-events/components/AssignModal'
import { useOnlineStatus } from '@client/utils'
import { UnassignModal } from '@client/v2-events/components/UnassignModal'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { useQuickActionModal } from '@client/v2-events/features/events/actions/quick-actions/useQuickActionModal'
import { useRejectionModal } from '@client/v2-events/features/events/actions/reject/useRejectionModal'
import { buttonMessages } from '@client/i18n/messages'
import { ActionConfig, actionLabels, ActionMenuActionType } from './utils'

/**
 * Get viewable actions for event
 * @param event The event to get actions for.
 * @param authentication The user's authentication information.
 * @returns A mapping of action types to their configurations. Not necessarily all actions are enabled without changes. (e.g. assignment is missing.)
 */
export function useViewableActionConfigurations(
  event: EventIndex,
  authentication: ITokenPayload,
  draft?: Draft
) {
  const events = useEvents()

  const { useFindEventFromCache } = events.getEvent

  const navigate = useNavigate()
  const isOnline = useOnlineStatus()

  const {
    clearEphemeralFormState,
    modal: deleteModal,
    deleteDeclaration
  } = useEventFormNavigation()

  const cachedEvent = useFindEventFromCache(event.id)
  const isDownloaded = Boolean(cachedEvent.data)
  const [assignModal, openAssignModal] = useModal()
  const intl = useIntl()

  const { getUser } = useUsers()

  const { getLocations } = useLocations()

  const locations = getLocations.useSuspenseQuery()

  const assignedToUser = getUser.useQuery(event.assignedTo || '', {
    enabled: !!event.assignedTo
  })

  const assignedUserFullName = assignedToUser.data
    ? getUsersFullName(assignedToUser.data.name, intl.locale)
    : null
  const assignedOffice = assignedToUser.data?.primaryOfficeId
  const assignedOfficeName =
    (assignedOffice && locations.get(assignedOffice)?.name) || ''

  const onDelete = useCallback(
    async (workqueue?: string) => {
      await deleteDeclaration(event.id, workqueue)
    },
    [event, deleteDeclaration]
  )
  const { rejectionModal, handleRejection } = useRejectionModal(
    event.id,
    event.type,
    false
  )
  const { refetch: refetchEvent } = cachedEvent

  const { eventConfiguration } = useEventConfiguration(event.type)

  const assignmentStatus = getAssignmentStatus(event, authentication.sub)
  const isDownloadedAndAssignedToUser =
    assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF && isDownloaded
  const hasDeclarationDraftOpen = draft?.action.type === ActionType.DECLARE
  const eventIsWaitingForCorrection = event.flags.includes(
    InherentFlags.CORRECTION_REQUESTED
  )
  const eventId = event.id
  const isAssignmentInProgress = events.actions.assignment.assign.isAssigning(
    event.id
  )
  const userMayCorrect = isActionInScope(
    authentication.scope,
    ActionType.REQUEST_CORRECTION,
    event.type
  )

  const { quickActionModal, onQuickAction } = useQuickActionModal(
    event.id,
    eventConfiguration,
    event.type
  )

  const getAction = (type: ActionType) => {
    return eventConfiguration.actions.find((action) => action.type === type)
  }

  const result = {
    modals: [assignModal, deleteModal, rejectionModal, quickActionModal],
    config: {
      // Core actions
      [ActionType.ASSIGN]: {
        label: actionLabels[ActionType.ASSIGN],
        icon: 'PushPin' as const,
        onClick: async () => {
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
          // User may not assign themselves if record is waiting for correction approval/rejection but user is not allowed to do that
          !isOnline || (eventIsWaitingForCorrection && !userMayCorrect)
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
      [ActionType.ARCHIVE]: {
        label: actionLabels[ActionType.ARCHIVE],
        icon: 'Archive' as const,
        onClick: async (workqueue) =>
          onQuickAction(ActionType.ARCHIVE, workqueue),
        disabled: !isDownloadedAndAssignedToUser
      },
      [ActionType.MARK_AS_DUPLICATE]: {
        label: actionLabels[ActionType.MARK_AS_DUPLICATE],
        icon: 'PencilLine' as const,
        onClick: (workqueue?: string) => {
          clearEphemeralFormState()
          return navigate(
            ROUTES.V2.EVENTS.REVIEW_POTENTIAL_DUPLICATE.buildPath(
              { eventId },
              { workqueue }
            )
          )
        },
        disabled: !isDownloadedAndAssignedToUser || isAssignmentInProgress
      },
      [ActionType.DELETE]: {
        label: actionLabels[ActionType.DELETE],
        icon: 'Trash' as const,
        onClick: onDelete,
        disabled: !isDownloadedAndAssignedToUser
      },
      [ActionType.DECLARE]: {
        icon: getAction(ActionType.DECLARE)?.icon ?? ('PencilLine' as const),
        label: hasDeclarationDraftOpen
          ? buttonMessages.update
          : actionLabels[ActionType.DECLARE],
        onClick: (workqueue) => {
          clearEphemeralFormState()
          return navigate(
            ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath(
              { eventId },
              { workqueue }
            )
          )
        },
        disabled: !(isDownloadedAndAssignedToUser || hasDeclarationDraftOpen)
      },
      [ActionType.EDIT]: {
        icon: 'PencilLine' as const,
        label: actionLabels[ActionType.EDIT],
        onClick: (workqueue) => {
          clearEphemeralFormState()
          return navigate(
            ROUTES.V2.EVENTS.EDIT.REVIEW.buildPath({ eventId }, { workqueue })
          )
        },
        disabled: !isDownloadedAndAssignedToUser
      },
      [ActionType.REJECT]: {
        label: actionLabels[ActionType.REJECT],
        icon: getAction(ActionType.REJECT)?.icon ?? 'FileX',
        onClick: async (workqueue) =>
          handleRejection(() =>
            workqueue
              ? navigate(
                  ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: workqueue })
                )
              : navigate(ROUTES.V2.buildPath({}))
          ),
        disabled: !isDownloadedAndAssignedToUser
      },
      [ActionType.REGISTER]: {
        label: actionLabels[ActionType.REGISTER],
        icon: getAction(ActionType.REGISTER)?.icon ?? ('PencilLine' as const),
        onClick: async (workqueue) =>
          onQuickAction(ActionType.REGISTER, workqueue),
        disabled: !isDownloadedAndAssignedToUser
      },
      [ActionType.PRINT_CERTIFICATE]: {
        label: actionLabels[ActionType.PRINT_CERTIFICATE],
        icon:
          getAction(ActionType.PRINT_CERTIFICATE)?.icon ?? ('Printer' as const),
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
      [ActionType.REQUEST_CORRECTION]: {
        label: actionLabels[ActionType.REQUEST_CORRECTION],
        icon:
          getAction(ActionType.REQUEST_CORRECTION)?.icon ??
          ('NotePencil' as const),
        onClick: (workqueue?: string) => {
          const correctionPages = eventConfiguration.actions.find(
            (action) => action.type === ActionType.REQUEST_CORRECTION
          )?.correctionForm.pages

          if (!correctionPages) {
            throw new Error('No page ID found for request correction')
          }

          clearEphemeralFormState()

          // If no pages are configured, skip directly to review page
          if (correctionPages.length === 0) {
            navigate(
              ROUTES.V2.EVENTS.REQUEST_CORRECTION.REVIEW.buildPath(
                { eventId },
                { workqueue }
              )
            )
            return
          }

          // If pages are configured, navigate to first page
          navigate(
            ROUTES.V2.EVENTS.REQUEST_CORRECTION.ONBOARDING.buildPath(
              {
                eventId,
                pageId: correctionPages[0].id
              },
              { workqueue }
            )
          )
        },
        disabled: !isDownloadedAndAssignedToUser || eventIsWaitingForCorrection,
        hidden: eventIsWaitingForCorrection
      },
      [ClientSpecificAction.REVIEW_CORRECTION_REQUEST]: {
        label: actionLabels[ClientSpecificAction.REVIEW_CORRECTION_REQUEST],
        icon: 'NotePencil' as const,
        onClick: (workqueue?: string) => {
          clearEphemeralFormState()
          navigate(
            ROUTES.V2.EVENTS.REVIEW_CORRECTION.REVIEW.buildPath(
              {
                eventId
              },
              { workqueue }
            )
          )
        },
        disabled: !isDownloadedAndAssignedToUser,
        hidden: !eventIsWaitingForCorrection
      }
    } satisfies Record<ActionMenuActionType, ActionConfig>
  }

  return result
}
