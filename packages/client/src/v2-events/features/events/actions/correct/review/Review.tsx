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
import { useSelector } from 'react-redux'
import {
  ActionType,
  EventState,
  getDeclaration,
  InherentFlags,
  SCOPES,
  isMetaAction,
  deepMerge,
  Action,
  RequestedCorrectionAction,
  getCompleteActionDeclaration,
  getCurrentEventState,
  ActionDocument,
  getAcceptedActions
} from '@opencrvs/commons/client'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { FormLayout } from '@client/v2-events/layouts'
import { ROUTES } from '@client/v2-events/routes'
import { getScope } from '@client/profile/profileSelectors'
import { isLastActionCorrectionRequest } from '../utils'

function isRequestCorrectionAction(
  action: Action
): action is RequestedCorrectionAction & { declaration: EventState } {
  return action.type === 'REQUEST_CORRECTION'
}

export function Review() {
  const scopes = useSelector(getScope)
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.REVIEW_CORRECTION.REVIEW)
  const events = useEvents()

  const event = events.getEvent.getFromCache(eventId)

  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )
  const eventIndex = getCurrentEventState(event, configuration)

  const formConfig = getDeclaration(configuration)

  const getFormValues = useEventFormData((state) => state.getFormValues)
  const form = getFormValues()

  const previousFormValues = eventIndex.declaration

  const intlWithData = useIntlFormatMessageWithFlattenedParams()

  const actionConfig = configuration.actions.find(
    (action) => action.type === ActionType.REQUEST_CORRECTION
  )

  if (!actionConfig) {
    throw new Error(
      `Action config for ${ActionType.REQUEST_CORRECTION} was not found. This should never happen`
    )
  }

  const writeActions: ActionDocument[] = getAcceptedActions(event).filter(
    (a) => !isMetaAction(a.type)
  )
  const lastWriteAction = writeActions[writeActions.length - 1]

  const completeDeclaration = getCompleteActionDeclaration(
    {},
    event,
    lastWriteAction
  )
  lastWriteAction.declaration = completeDeclaration
  const lastActionIsCorrectionRequest = isLastActionCorrectionRequest(event)

  const canReviewCorrection =
    eventIndex.flags.includes(InherentFlags.CORRECTION_REQUESTED) &&
    scopes?.includes(SCOPES.RECORD_REGISTRATION_CORRECT)

  if (canReviewCorrection && !lastActionIsCorrectionRequest) {
    throw new Error(
      `Last action is not a correction request. Last action type: ${lastWriteAction.type}`
    )
  }

  const isReviewCorrection =
    canReviewCorrection && lastActionIsCorrectionRequest

  const formWithNewValues =
    isReviewCorrection && isRequestCorrectionAction(lastWriteAction)
      ? deepMerge(form, lastWriteAction.declaration)
      : form

  return (
    <FormLayout route={ROUTES.V2.EVENTS.REVIEW_CORRECTION}>
      <ReviewComponent.Body
        form={formWithNewValues}
        formConfig={formConfig}
        isCorrection={true}
        isReviewCorrection={isReviewCorrection}
        previousFormValues={previousFormValues}
        title={intlWithData.formatMessage(
          actionConfig.label,
          previousFormValues
        )}
        /*
         * @todo isReviewCorrection, onEdit & readyonlyMode needs to be reviewed
         * as they there seems to be some reduntant ones among them
         */
        /* eslint-disable-next-line @typescript-eslint/no-empty-function */
        onEdit={() => {}}
      />
    </FormLayout>
  )
}
