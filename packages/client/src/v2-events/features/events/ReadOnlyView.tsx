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
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { noop } from 'lodash'
import {
  ActionType,
  applyDraftToEventIndex,
  getDeclaration,
  getOrThrow,
  getCurrentEventState
} from '@opencrvs/commons/client'
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
import { removeCachedFiles } from '../files/cache'

function ReadonlyView() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.EVENT.RECORD)
  const events = useEvents()
  const event = events.getEvent.viewEvent(eventId)
  const validatorContext = useValidatorContext()

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

  const actionConfiguration = configuration.actions.find(
    (a) => a.type === ActionType.READ
  )
  if (!actionConfiguration) {
    throw new Error('Action configuration not found')
  }

  const { title, fields } = actionConfiguration.review
  const { formatMessage } = useIntlFormatMessageWithFlattenedParams()

  const formConfig = getDeclaration(configuration)

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

  return (
    <ReviewComponent.Body
      readonlyMode
      form={eventStateWithDraft.declaration}
      formConfig={formConfig}
      reviewFields={fields}
      title={formatMessage(title, eventStateWithDraft.declaration)}
      validatorContext={validatorContext}
      onEdit={noop}
    />
  )
}

export const ReadonlyViewIndex = withSuspense(ReadonlyView)
