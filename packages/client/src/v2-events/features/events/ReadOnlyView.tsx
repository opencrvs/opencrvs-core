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
  deepDropNulls
} from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { ROUTES } from '@client/v2-events/routes'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { useAuthentication } from '@client/utils/userUtils'
import { AssignmentStatus, getAssignmentStatus } from '@client/v2-events/utils'
import { removeCachedFiles } from '../files/cache'
import { useEventOverviewInfo } from '../workqueues/EventOverview/components/useEventOverviewInfo'

function ReadonlyView() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.EVENT.RECORD)
  const { getRemoteDraftByEventId } = useDrafts()
  const { eventIndex, fullEvent, shouldShowFullOverview } =
    useEventOverviewInfo(eventId)
  const draft = getRemoteDraftByEventId(eventIndex.id)
  const { eventConfiguration } = useEventConfiguration(eventIndex.type)

  const eventWithDrafts = draft
    ? deepDropNulls(
        applyDraftToEventIndex(eventIndex, draft, eventConfiguration)
      )
    : eventIndex

  const validatorContext = useValidatorContext(fullEvent)
  const maybeAuth = useAuthentication()
  const { formatMessage } = useIntlFormatMessageWithFlattenedParams()

  const authentication = getOrThrow(
    maybeAuth,
    'Authentication is not available but is required'
  )

  const assignmentStatus = getAssignmentStatus(
    eventWithDrafts,
    authentication.sub
  )

  const actionConfiguration = eventConfiguration.actions.find(
    (a) => a.type === ActionType.READ
  )
  if (!actionConfiguration) {
    throw new Error('Action configuration not found')
  }

  const { title, fields } = actionConfiguration.review

  const formConfig = getDeclaration(eventConfiguration)

  useEffect(() => {
    return () => {
      if (
        assignmentStatus === AssignmentStatus.ASSIGNED_TO_SELF ||
        !fullEvent
      ) {
        return
      }

      void (async () => {
        await removeCachedFiles(fullEvent)
      })()
    }
  }, [fullEvent, assignmentStatus])

  if (!shouldShowFullOverview) {
    // @TODO: Ask Jon about the desired UI here.
    return <div>{'No full overview!!'}</div>
  }

  return (
    <ReviewComponent.Body
      readonlyMode
      form={eventWithDrafts.declaration}
      formConfig={formConfig}
      reviewFields={fields}
      title={formatMessage(title, eventWithDrafts.declaration)}
      validatorContext={validatorContext}
      onEdit={noop}
    />
  )
}

export const ReadonlyViewIndex = withSuspense(ReadonlyView)
