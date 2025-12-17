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
import { ActionType, getDeclaration } from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useActionAnnotation } from '@client/v2-events/features/events/useActionAnnotation'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { FormLayout } from '@client/v2-events/layouts'
import { makeFormFieldIdFormikCompatible } from '@client/v2-events/components/forms/utils'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { DeclareActionMenu } from './DeclareActionMenu'

export function Review() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.DECLARE.REVIEW)
  const [{ workqueue: slug }] = useTypedSearchParams(
    ROUTES.V2.EVENTS.DECLARE.REVIEW
  )
  const events = useEvents()
  const navigate = useNavigate()
  const validatorContext = useValidatorContext()
  const { formatMessage } = useIntlFormatMessageWithFlattenedParams()
  const event = events.getEvent.getFromCache(eventId)
  const { eventConfiguration: config } = useEventConfiguration(event.type)
  const formConfig = getDeclaration(config)
  const actionConfiguration = config.actions.find(
    (a) => a.type === ActionType.DECLARE
  )
  if (!actionConfiguration) {
    throw new Error('Action configuration not found')
  }

  const reviewConfig = actionConfiguration.review
  const form = useEventFormData((state) => state.getFormValues())

  const { setAnnotation, getAnnotation } = useActionAnnotation()
  const annotation = getAnnotation()

  function handleEdit({
    pageId,
    fieldId
  }: {
    pageId: string
    fieldId?: string
  }) {
    navigate(
      ROUTES.V2.EVENTS.DECLARE.PAGES.buildPath(
        { pageId, eventId },
        {
          from: 'review',
          workqueue: slug
        },
        fieldId ? makeFormFieldIdFormikCompatible(fieldId) : undefined
      )
    )

    return
  }

  return (
    <FormLayout
      actionComponent={<DeclareActionMenu event={event} />}
      route={ROUTES.V2.EVENTS.DECLARE}
    >
      <ReviewComponent.Body
        annotation={annotation}
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

export const ReviewIndex = withSuspense(Review)
