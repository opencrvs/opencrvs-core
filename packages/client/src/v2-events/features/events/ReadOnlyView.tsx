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

import React, { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import { noop } from 'lodash'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import {
  ActionType,
  applyDraftToEventIndex,
  EventState,
  getActionAnnotationFields,
  getDeclaration,
  getOrThrow,
  getCurrentEventState,
  UUID,
  getAssignmentStatus,
  AssignmentStatus
} from '@opencrvs/commons/client'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { getAnnotationForActionType } from '@client/v2-events/features/events/components/Action/utils'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { useAuthentication } from '@client/utils/userUtils'
import { useOnlineStatus } from '@client/utils'
import { queryClient, useTRPC } from '@client/v2-events/trpc'

import { useCanAccessEventWithScopes } from '@client/v2-events/hooks/useCanAccessEventWithScopes'
import { removeCachedFiles } from '../files/cache'

const messages = defineMessages({
  offlineTitle: {
    id: 'v2.event.record.offline.title',
    defaultMessage: 'No connection',
    description: 'Title shown on the Record page when the user is offline'
  },
  offlineDescription: {
    id: 'v2.event.record.offline.description',
    defaultMessage:
      'This record has not been downloaded yet so it cannot be opened offline. Please reconnect to the internet to view it.',
    description:
      'Message shown on the Record page when the user is offline and the record has not been cached locally'
  }
})

const OfflineMessageWrapper = styled.div`
  text-align: center;
`

function ReadonlyViewContent({ eventId }: { eventId: UUID }) {
  const events = useEvents()
  const event = events.getEvent.useGetOrDownloadEvent(eventId)
  const validatorContext = useValidatorContext(event)

  const maybeAuth = useAuthentication()
  const authentication = getOrThrow(
    maybeAuth,
    'Authentication is not available but is required'
  )

  const { getRemoteDraftByEventId } = useDrafts()
  const draft = getRemoteDraftByEventId(event.id)
  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )

  const eventStateWithDraft = useMemo(() => {
    const eventState = getCurrentEventState(event, configuration)

    return draft
      ? applyDraftToEventIndex(eventState, draft, configuration)
      : eventState
  }, [draft, event, configuration])

  const assignmentStatus = getAssignmentStatus(
    eventStateWithDraft,
    authentication.sub
  )

  const { formatMessage } = useIntlFormatMessageWithFlattenedParams()

  const formConfig = getDeclaration(configuration)

  const annotation = useMemo((): EventState | undefined => {
    // Collect annotations from all past non-READ actions that have annotation fields
    const pastActionsWithAnnotation = configuration.actions
      .filter((a) => a.type !== ActionType.READ)
      .filter((a) => getActionAnnotationFields(a).length > 0)
      .reduce<EventState>(
        (acc, actionConfig) => ({
          ...acc,
          ...getAnnotationForActionType({
            event,

            actionType: actionConfig.type,
            draft
          })
        }),
        {}
      )

    return Object.keys(pastActionsWithAnnotation).length > 0
      ? pastActionsWithAnnotation
      : undefined
  }, [configuration.actions, event, draft])

  useEffect(() => {
    return () => {
      if (assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF) {
        return
      }
      void (async () => {
        await removeCachedFiles(event)
      })()
    }
  }, [event, assignmentStatus])

  const actionConfiguration = configuration.actions.find(
    (a) => a.type === ActionType.READ
  )
  if (!actionConfiguration) {
    throw new Error('Action configuration not found')
  }

  const { title, fields } = actionConfiguration.review

  return (
    <ReviewComponent.Body
      readonlyMode
      annotation={annotation}
      form={eventStateWithDraft.declaration}
      formConfig={formConfig}
      reviewFields={fields}
      title={formatMessage(title, eventStateWithDraft.declaration)}
      validatorContext={validatorContext}
      onEdit={noop}
    />
  )
}

function OfflineRecordMessage() {
  const intl = useIntl()
  return (
    <Content
      size={ContentSize.SMALL}
      title={intl.formatMessage(messages.offlineTitle)}
    >
      <OfflineMessageWrapper data-testid="record-offline-message">
        {intl.formatMessage(messages.offlineDescription)}
      </OfflineMessageWrapper>
    </Content>
  )
}

function ReadonlyView() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.EVENT.RECORD)
  const [{ backTo }] = useTypedSearchParams(ROUTES.V2.EVENTS.EVENT.RECORD)
  const navigate = useNavigate()
  const { canAccessEventWithScopes } = useCanAccessEventWithScopes(eventId, [
    'record.read'
  ])
  const isOnline = useOnlineStatus()
  const trpc = useTRPC()

  if (!canAccessEventWithScopes()) {
    navigate(ROUTES.V2.EVENTS.EVENT.buildPath({ eventId }, { backTo }))
    return null
  }

  // React Query pauses queries when the browser is offline, so the suspense
  // boundary inside ReadonlyViewContent would hang on a spinner forever if
  // the user opens a record they have not previously downloaded.
  // Render a clear message instead — useOnlineStatus re-renders this when
  // the connection returns, so the content loads automatically.
  const isCachedAsView = queryClient.getQueryData([['view-event', eventId]])
  const isCachedAsAssigned = queryClient.getQueryData(
    trpc.event.get.queryKey({ eventId, waitFor: false })
  )

  if (!isOnline && !isCachedAsView && !isCachedAsAssigned) {
    return <OfflineRecordMessage />
  }

  return <ReadonlyViewContent eventId={eventId} />
}

export const ReadonlyViewIndex = withSuspense(ReadonlyView)
