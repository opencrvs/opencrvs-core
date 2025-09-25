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
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import {
  ActionType,
  getDeclaration,
  getCurrentEventState
} from '@opencrvs/commons/client'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { FormLayout } from '@client/v2-events/layouts'
import { ROUTES } from '@client/v2-events/routes'
import { makeFormFieldIdFormikCompatible } from '@client/v2-events/components/forms/utils'
import { validationErrorsInActionFormExist } from '@client/v2-events/components/forms/validation'
import { useSuspenseAdminLeafLevelLocations } from '@client/v2-events/hooks/useLocations'
import { hasFieldChanged } from '../utils'

export function Review() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.REQUEST_CORRECTION.REVIEW)
  const [{ workqueue: slug }] = useTypedSearchParams(
    ROUTES.V2.EVENTS.VALIDATE.REVIEW
  )
  const intl = useIntl()
  const navigate = useNavigate()
  const events = useEvents()
  const locationIds = useSuspenseAdminLeafLevelLocations()

  const event = events.getEvent.getFromCache(eventId)

  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )
  const eventIndex = getCurrentEventState(event, configuration)

  const formConfig = getDeclaration(configuration)

  const getFormValues = useEventFormData((state) => state.getFormValues)
  const form = getFormValues()

  const previousFormValues = eventIndex.declaration

  const formFields = formConfig.pages.flatMap((page) => page.fields)
  const changedFields = formFields.filter((f) =>
    hasFieldChanged(f, form, previousFormValues)
  )
  const anyValuesHaveChanged = changedFields.length > 0

  const intlWithData = useIntlFormatMessageWithFlattenedParams()

  const actionConfig = configuration.actions.find(
    (action) => action.type === ActionType.REQUEST_CORRECTION
  )

  if (!actionConfig) {
    throw new Error(
      `Action config for ${ActionType.REQUEST_CORRECTION} was not found. This should never happen`
    )
  }

  const incomplete = validationErrorsInActionFormExist({
    formConfig,
    form,
    locationIds
  })

  return (
    <FormLayout route={ROUTES.V2.EVENTS.REQUEST_CORRECTION}>
      <ReviewComponent.Body
        form={form}
        formConfig={formConfig}
        isCorrection={true}
        locationIds={locationIds}
        previousFormValues={previousFormValues}
        title={intlWithData.formatMessage(
          actionConfig.label,
          previousFormValues
        )}
        onEdit={({ pageId, fieldId }) => {
          navigate(
            ROUTES.V2.EVENTS.REQUEST_CORRECTION.PAGES.buildPath(
              { pageId, eventId },
              {
                from: 'review',
                workqueue: slug
              },
              fieldId ? makeFormFieldIdFormikCompatible(fieldId) : undefined
            )
          )
        }}
      >
        <PrimaryButton
          key="continue_button"
          disabled={!anyValuesHaveChanged || incomplete}
          id="continue_button"
          onClick={() => {
            navigate(
              ROUTES.V2.EVENTS.REQUEST_CORRECTION.SUMMARY.buildPath(
                { eventId },
                { workqueue: slug }
              )
            )
          }}
        >
          {intl.formatMessage(buttonMessages.continueButton)}
        </PrimaryButton>
      </ReviewComponent.Body>
    </FormLayout>
  )
}
