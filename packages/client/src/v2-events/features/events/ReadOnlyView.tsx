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
import { useLocation } from 'react-router-dom'
import {
  ActionType,
  getActionReview,
  getCurrentEventState,
  applyDraftToEventIndex,
  getDeclaration,
  getOrThrow
} from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { FormLayout } from '@client/v2-events/layouts'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { useAuthentication } from '@client/utils/userUtils'
import { AssignmentStatus, getAssignmentStatus } from '@client/v2-events/utils'
import { useSuspenseAdminLeafLevelLocations } from '../../hooks/useLocations'
import { removeCachedFiles } from '../files/cache'

function ReadonlyView() {
  const { pathname } = useLocation()
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.DECLARE.REVIEW)
  const events = useEvents()
  const event = events.getEvent.viewEvent(eventId)

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

  const locationIds = useSuspenseAdminLeafLevelLocations()

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

  const { title, fields } = getActionReview(configuration, ActionType.READ)
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
  }, [event, pathname, assignmentStatus])

  return (
    <FormLayout route={ROUTES.V2.EVENTS.DECLARE}>
      <ReviewComponent.Body
        readonlyMode
        form={eventStateWithDraft.declaration}
        formConfig={formConfig}
        locationIds={locationIds}
        reviewFields={fields}
        title={formatMessage(title, eventStateWithDraft.declaration)}
        onEdit={noop}
      >
        <></>
      </ReviewComponent.Body>
    </FormLayout>
  )
}

export const ReadonlyViewIndex = withSuspense(ReadonlyView)
