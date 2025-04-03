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

import React from 'react'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { noop } from 'lodash'
import {
  ActionType,
  EventConfig,
  EventDocument,
  getActionReview,
  getDeclaration,
  getActionAnnotation
} from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useActionAnnotation } from '@client/v2-events/features/events/useActionAnnotation'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { FormLayout } from '@client/v2-events/layouts'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { withSuspense } from '@client/v2-events/components/withSuspense'

// These are the allowed actions based on which we can read a declarations data
const READ_ONLY_MODE_ALLOWED_ACTIONS = [
  ActionType.REGISTER,
  ActionType.VALIDATE,
  ActionType.DECLARE
]

function getLastActionReviewConfig(config: EventConfig, event: EventDocument) {
  for (const actionType of READ_ONLY_MODE_ALLOWED_ACTIONS) {
    const availableAllowedAction = event.actions.find(
      (a) => a.type === actionType
    )

    if (availableAllowedAction) {
      return getActionReview(config, actionType)
    }
  }

  throw new Error('No allowed action found')
}

function findLastActionMetadata(event: EventDocument) {
  for (const actionType of READ_ONLY_MODE_ALLOWED_ACTIONS) {
    const availableAllowedAction = event.actions.find(
      (a) => a.type === actionType
    )
    if (availableAllowedAction) {
      return getActionAnnotation({ event, actionType, drafts: [] })
    }
  }
}

function ReadonlyView() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.VIEW)
  const { getEventState, getEvent } = useEvents()
  const { formatMessage } = useIntlFormatMessageWithFlattenedParams()
  const currentEventState = getEventState.useSuspenseQuery(eventId)
  const { eventConfiguration: config } = useEventConfiguration(
    currentEventState.type
  )
  const [fullEvent] = getEvent.useSuspenseQuery(eventId)
  const formConfig = getDeclaration(config)

  const form = useEventFormData((state) =>
    state.getFormValues(currentEventState.declaration)
  )

  const reviewConfig = getLastActionReviewConfig(config, fullEvent)

  const { setAnnotation: setMetadata, getAnnotation: getMetadata } =
    useActionAnnotation()
  const annotation = getMetadata(findLastActionMetadata(fullEvent))

  return (
    <FormLayout route={ROUTES.V2.EVENTS.DECLARE}>
      <ReviewComponent.Body
        readonlyMode
        annotation={annotation}
        form={form}
        formConfig={formConfig}
        title={formatMessage(reviewConfig.title, form)}
        onAnnotationChange={(values) => setMetadata(values)}
        onEdit={noop}
      >
        <></>
      </ReviewComponent.Body>
    </FormLayout>
  )
}

export const ReadonlyViewIndex = withSuspense(ReadonlyView)
