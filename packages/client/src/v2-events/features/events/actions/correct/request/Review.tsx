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
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { ActionType, getDeclaration } from '@opencrvs/commons/client'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { useModal } from '@client/v2-events/hooks/useModal'
import { FormLayout } from '@client/v2-events/layouts'
import { ROUTES } from '@client/v2-events/routes'
import { makeFormFieldIdFormikCompatible } from '@client/v2-events/components/forms/utils'

export function Review() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.REQUEST_CORRECTION.REVIEW)
  const events = useEvents()
  const intl = useIntl()
  const [modal, openModal] = useModal()
  const navigate = useNavigate()

  const event = events.getEventState.useSuspenseQuery(eventId)

  const { eventConfiguration: config } = useEventConfiguration(event.type)
  const formConfig = getDeclaration(config)

  const getFormValues = useEventFormData((state) => state.getFormValues)

  const form = getFormValues()

  async function handleEdit({
    pageId,
    fieldId,
    confirmation
  }: {
    pageId: string
    fieldId?: string
    confirmation?: boolean
  }) {
    const confirmedEdit =
      confirmation ||
      (await openModal<boolean | null>((close) => (
        <ReviewComponent.EditModal close={close} />
      )))

    if (confirmedEdit) {
      navigate(
        ROUTES.V2.EVENTS.REQUEST_CORRECTION.PAGES.buildPath(
          { pageId, eventId },
          {
            from: 'review'
          },
          fieldId ? makeFormFieldIdFormikCompatible(fieldId) : undefined
        )
      )
    }
    return
  }

  const previousFormValues = event.declaration
  const valuesHaveChanged = Object.entries(form).some(
    ([key, value]) => previousFormValues[key] !== value
  )
  const intlWithData = useIntlFormatMessageWithFlattenedParams()

  const actionConfig = config.actions.find(
    (action) => action.type === ActionType.REQUEST_CORRECTION
  )

  if (!actionConfig) {
    throw new Error(
      `Action config for ${ActionType.REQUEST_CORRECTION} was not found. This should never happen`
    )
  }

  return (
    <FormLayout route={ROUTES.V2.EVENTS.REGISTER}>
      <ReviewComponent.Body
        form={form}
        formConfig={formConfig}
        previousFormValues={previousFormValues}
        title={intlWithData.formatMessage(
          actionConfig.label,
          previousFormValues
        )}
        onEdit={handleEdit}
      >
        <PrimaryButton
          key="continue_button"
          disabled={!valuesHaveChanged}
          id="continue_button"
          onClick={() => {
            // eslint-disable-next-line no-console
            console.log('CIHAN TODO navigate to summary?')
          }}
        >
          {intl.formatMessage(buttonMessages.continueButton)}
        </PrimaryButton>
        {modal}
      </ReviewComponent.Body>
    </FormLayout>
  )
}
