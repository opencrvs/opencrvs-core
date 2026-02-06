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
  ClientSpecificAction,
  CtaActionType,
  getOrThrow
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
import { UnassignModal } from '@client/v2-events/components/UnassignModal'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { useQuickActionModal } from '@client/v2-events/features/events/actions/quick-actions/useQuickActionModal'
import { useRejectionModal } from '@client/v2-events/features/events/actions/reject/useRejectionModal'
import { useAuthentication } from '@client/utils/userUtils'

export function useActionOnClick(event: EventIndex) {
  const maybeAuth = useAuthentication()
  const authentication = getOrThrow(
    maybeAuth,
    'Authentication is not available but is required'
  )

  const navigate = useNavigate()
  const events = useEvents()
  const { clearEphemeralFormState, deleteDeclaration } =
    useEventFormNavigation()
  const { eventConfiguration } = useEventConfiguration(event.type)
  const { handleRejection } = useRejectionModal(event.id, event.type, false)
  const { onQuickAction } = useQuickActionModal(
    event.id,
    eventConfiguration,
    event.type
  )
  const [assignModal, openAssignModal] = useModal()
  const { useFindEventFromCache } = events.getEvent
  const cachedEvent = useFindEventFromCache(event.id)
  const { refetch: refetchEvent } = cachedEvent
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
  const isDownloaded = Boolean(cachedEvent.data)
  const assignmentStatus = getAssignmentStatus(event, authentication.sub)

  const isDownloadedAndAssignedToUser =
    assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF && isDownloaded

  const eventId = event.id

  const onClick = useCallback(
    (actionType: CtaActionType | ClientSpecificAction, workqueue?: string) => {
      switch (actionType) {
        case ActionType.ASSIGN:
          return (async () => {
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
          })()
        case ActionType.UNASSIGN:
          return (async () => {
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
          })()
        case ActionType.DELETE:
          return deleteDeclaration(eventId, workqueue)
        case ActionType.DECLARE:
          clearEphemeralFormState()
          return navigate(
            ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath(
              { eventId },
              { workqueue }
            )
          )
        case ActionType.EDIT:
          clearEphemeralFormState()
          return navigate(
            ROUTES.V2.EVENTS.EDIT.REVIEW.buildPath({ eventId }, { workqueue })
          )
        case ActionType.REGISTER:
          return onQuickAction(ActionType.REGISTER, workqueue)
        case ActionType.ARCHIVE:
          return onQuickAction(ActionType.ARCHIVE, workqueue)
        case ActionType.PRINT_CERTIFICATE:
          clearEphemeralFormState()
          return navigate(
            ROUTES.V2.EVENTS.PRINT_CERTIFICATE.buildPath(
              { eventId },
              { workqueue }
            )
          )
        case ActionType.MARK_AS_DUPLICATE:
          clearEphemeralFormState()
          return navigate(
            ROUTES.V2.EVENTS.REVIEW_POTENTIAL_DUPLICATE.buildPath(
              { eventId },
              { workqueue }
            )
          )
        case ActionType.REQUEST_CORRECTION: {
          const correctionPages = eventConfiguration.actions.find(
            (action) => action.type === ActionType.REQUEST_CORRECTION
          )?.correctionForm.pages

          if (!correctionPages) {
            throw new Error('No page ID found for request correction')
          }

          clearEphemeralFormState()

          if (correctionPages.length === 0) {
            return navigate(
              ROUTES.V2.EVENTS.REQUEST_CORRECTION.REVIEW.buildPath(
                { eventId },
                { workqueue }
              )
            )
          }

          return navigate(
            ROUTES.V2.EVENTS.REQUEST_CORRECTION.ONBOARDING.buildPath(
              { eventId, pageId: correctionPages[0].id },
              { workqueue }
            )
          )
        }
        case ClientSpecificAction.REVIEW_CORRECTION_REQUEST:
          clearEphemeralFormState()
          return navigate(
            ROUTES.V2.EVENTS.REVIEW_CORRECTION.REVIEW.buildPath(
              { eventId },
              { workqueue }
            )
          )
        case ActionType.REJECT:
          return handleRejection(() =>
            workqueue
              ? navigate(
                  ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: workqueue })
                )
              : navigate(ROUTES.V2.buildPath({}))
          )
        case ActionType.READ:
          return navigate(
            ROUTES.V2.EVENTS.EVENT.RECORD.buildPath({ eventId }, { workqueue })
          )
      }
    },
    [
      openAssignModal,
      events.actions.assignment,
      eventId,
      authentication.sub,
      refetchEvent,
      isDownloadedAndAssignedToUser,
      assignedUserFullName,
      assignedOfficeName,
      deleteDeclaration,
      clearEphemeralFormState,
      navigate,
      onQuickAction,
      eventConfiguration,
      handleRejection
    ]
  )

  return { onClick, modals: [assignModal] }
}
