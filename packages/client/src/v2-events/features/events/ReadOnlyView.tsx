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
import {
  ActionType,
  applyDraftToEventIndex,
  EventState,
  getActionAnnotationFields,
  getDeclaration,
  getOrThrow,
  getCurrentEventState,
  UUID
} from '@opencrvs/commons/client'
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
import { AssignmentStatus, getAssignmentStatus } from '@client/v2-events/utils'
import { useCanAccessEventWithScopes } from '@client/v2-events/hooks/useCanAccessEventWithScopes'
import { removeCachedFiles } from '../files/cache'

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

function ReadonlyView() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.EVENT.RECORD)
  const [{ workqueue }] = useTypedSearchParams(ROUTES.V2.EVENTS.EVENT.RECORD)
  const navigate = useNavigate()
  const { canAccessEventWithScopes } = useCanAccessEventWithScopes(eventId, [
    'record.read'
  ])

  if (!canAccessEventWithScopes()) {
    navigate(ROUTES.V2.EVENTS.EVENT.buildPath({ eventId }, { workqueue }))
    return null
  }

  return <ReadonlyViewContent eventId={eventId} />
}

export const ReadonlyViewIndex = withSuspense(ReadonlyView)
