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
  getDeclaration,
  deepMerge,
  RequestedCorrectionAction,
  getCurrentEventState
} from '@opencrvs/commons/client'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { FormLayout } from '@client/v2-events/layouts'
import { ROUTES } from '@client/v2-events/routes'
import { ReviewCorrection } from './ReviewCorrection'

export function Review() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.REVIEW_CORRECTION.REVIEW)
  const events = useEvents()

  const event = events.getEvent.getFromCache(eventId)

  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )
  const eventIndex = getCurrentEventState(event, configuration)

  const formConfig = getDeclaration(configuration)

  const formValuesBeforeCorrection = eventIndex.declaration

  const intlWithData = useIntlFormatMessageWithFlattenedParams()

  const actionConfig = configuration.actions.find(
    (action) => action.type === ActionType.REQUEST_CORRECTION
  )

  if (!actionConfig) {
    throw new Error(
      `Action config for ${ActionType.REQUEST_CORRECTION} was not found. This should never happen`
    )
  }

  const correctionRequestAction = event.actions.find(
    (action): action is RequestedCorrectionAction =>
      action.type === ActionType.REQUEST_CORRECTION
  )

  if (!correctionRequestAction) {
    throw new Error(
      'Request correction action not found. This should never happen'
    )
  }

  const formValuesAfterCorrection = deepMerge(
    formValuesBeforeCorrection,
    correctionRequestAction.declaration
  )

  return (
    <FormLayout route={ROUTES.V2.EVENTS.REVIEW_CORRECTION}>
      <ReviewComponent.Body
        correctionReview={
          <ReviewCorrection
            correctionRequestAction={correctionRequestAction}
            form={formValuesAfterCorrection}
          />
        }
        form={formValuesAfterCorrection}
        formConfig={formConfig}
        isCorrection={true}
        previousFormValues={formValuesBeforeCorrection}
        title={intlWithData.formatMessage(
          actionConfig.label,
          formValuesBeforeCorrection
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
