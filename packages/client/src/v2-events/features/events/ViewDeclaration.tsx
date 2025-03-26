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
import {
  ActionType,
  EventConfig,
  EventDocument,
  findActiveActionForm,
  getMetadataForAction
} from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useEventMetadata } from '@client/v2-events/features/events/useEventMeta'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { FormLayout } from '@client/v2-events/layouts'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'

const READ_ONLY_MODE_ALLOWED_ACTIONS = [
  ActionType.APPROVE_CORRECTION,
  ActionType.REGISTER,
  ActionType.VALIDATE,
  ActionType.DECLARE
]

function findLastActionFormConfigForReadOnlyMode(
  config: EventConfig,
  event: EventDocument
) {
  for (const actionType of READ_ONLY_MODE_ALLOWED_ACTIONS) {
    const availableAllowedAction = event.actions.find(
      (a) => a.type === actionType
    )
    if (availableAllowedAction) {
      return findActiveActionForm(config, actionType)
    }
  }
}

function findLastActionMetadata(event: EventDocument) {
  for (const actionType of READ_ONLY_MODE_ALLOWED_ACTIONS) {
    const availableAllowedAction = event.actions.find(
      (a) => a.type === actionType
    )
    if (availableAllowedAction) {
      return getMetadataForAction({ event, actionType, drafts: [] })
    }
  }
}

function View() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.VIEW)
  const { getEventState, getEvent } = useEvents()
  const { formatMessage } = useIntlFormatMessageWithFlattenedParams()
  const currentEventState = getEventState.useSuspenseQuery(eventId)
  const { eventConfiguration: config } = useEventConfiguration(
    currentEventState.type
  )
  const [fullEvent] = getEvent.useSuspenseQuery(eventId)
  const formConfig = findLastActionFormConfigForReadOnlyMode(config, fullEvent)

  if (!formConfig) {
    throw new Error('No active form configuration found for declare action')
  }

  const form = useEventFormData((state) =>
    state.getFormValues(currentEventState.data)
  )

  const { setMetadata, getMetadata } = useEventMetadata()
  const metadata = getMetadata(findLastActionMetadata(fullEvent))

  return (
    <FormLayout route={ROUTES.V2.EVENTS.DECLARE}>
      <ReviewComponent.Body
        readonlyMode
        eventConfig={config}
        form={form}
        formConfig={formConfig}
        metadata={metadata}
        title={formatMessage(formConfig.review.title, form)}
        onEdit={() => {}}
        onMetadataChange={(values) => setMetadata(values)}
      >
        <></>
      </ReviewComponent.Body>
    </FormLayout>
  )
}

export const ViewDeclaration = View
