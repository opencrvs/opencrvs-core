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
import { useNavigate } from 'react-router-dom'
import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import {
  ActionType,
  getCurrentEventState,
  getNotificationForm,
  eventAttachmentPath
} from '@opencrvs/commons/client'
import { recordAnchorDate } from '@client/v2-events/utils'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useActionAnnotation } from '@client/v2-events/features/events/useActionAnnotation'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useModal } from '@client/v2-events/hooks/useModal'
import { ROUTES } from '@client/v2-events/routes'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { FormLayout } from '@client/v2-events/layouts'
import { makeFormFieldIdFormikCompatible } from '@client/v2-events/components/forms/utils'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { NotifyActionMenu } from './NotifyActionMenu'

export function Review() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.NOTIFY.REVIEW)
  const [{ backTo }] = useTypedSearchParams(ROUTES.V2.EVENTS.NOTIFY.REVIEW)
  const events = useEvents()
  const navigate = useNavigate()
  const { formatMessage } = useIntlFormatMessageWithFlattenedParams()
  const event = events.getEvent.useGetEventFromCache(eventId)
  const validatorContext = useValidatorContext(event)
  const { eventConfiguration: config } = useEventConfiguration(event.type)
  const formConfig = getNotificationForm(config)
  const form = useEventFormData((state) => state.getFormValues())
  const { setAnnotation, getAnnotation } = useActionAnnotation()
  const anchor = recordAnchorDate(getCurrentEventState(event, config))
  const annotation = getAnnotation()

  const actionConfiguration = config.actions.find(
    (a) => a.type === ActionType.NOTIFY
  )

  if (!actionConfiguration) {
    throw new Error('Action configuration not found')
  }

  const reviewConfig = actionConfiguration.review

  function handleEdit({
    pageId,
    fieldId
  }: {
    pageId: string
    fieldId?: string
  }) {
    navigate(
      ROUTES.V2.EVENTS.NOTIFY.PAGES.buildPath(
        { pageId, eventId },
        {
          from: 'review',
          backTo
        },
        fieldId ? makeFormFieldIdFormikCompatible(fieldId) : undefined
      )
    )

    return
  }

  return (
    <FormLayout
      actionComponent={<NotifyActionMenu event={event} />}
      route={ROUTES.V2.EVENTS.NOTIFY}
    >
      <ReviewComponent.Body
        anchor={anchor}
        annotation={annotation}
        attachmentPath={eventAttachmentPath(eventId)}
        form={form}
        formConfig={formConfig}
        reviewFields={reviewConfig.fields}
        title={formatMessage(reviewConfig.title, form)}
        validatorContext={validatorContext}
        onAnnotationChange={(values) => setAnnotation(values)}
        onEdit={handleEdit}
      />
    </FormLayout>
  )
}
