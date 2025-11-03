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

import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import {
  getCurrentEventState,
  ActionType,
  getActionAnnotation,
  getDeclaration,
  getActionReview,
  InherentFlags
} from '@opencrvs/commons/client'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { useModal } from '@client/v2-events/hooks/useModal'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useActionAnnotation } from '@client/v2-events/features/events/useActionAnnotation'
import { FormLayout } from '@client/v2-events/layouts'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { useSaveAndExitModal } from '@client/v2-events/components/SaveAndExitModal'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { makeFormFieldIdFormikCompatible } from '@client/v2-events/components/forms/utils'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { useRejectionModal } from '../reject/useRejectionModal'
import { useReviewActionConfig } from './useReviewActionConfig'

/**
 *
 * Preview of event to be validated.
 */
export function Review() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.VALIDATE)
  const [{ workqueue: slug }] = useTypedSearchParams(
    ROUTES.V2.EVENTS.VALIDATE.REVIEW
  )
  const events = useEvents()
  const drafts = useDrafts()
  const [modal, openModal] = useModal()
  const navigate = useNavigate()
  const { rejectionModal, handleRejection } = useRejectionModal(eventId)
  const { closeActionView } = useEventFormNavigation()
  const validatorContext = useValidatorContext()

  const event = events.getEvent.findFromCache(eventId).data

  useEffect(() => {
    if (!event) {
      // eslint-disable-next-line no-console
      console.warn(
        `Event with id ${eventId} not found in cache. Redirecting to overview.`
      )
      return navigate(ROUTES.V2.EVENTS.EVENT.buildPath({ eventId }))
    }
  }, [event, eventId, navigate])

  if (!event) {
    return <div />
  }

  const { setAnnotation, getAnnotation } = useActionAnnotation()

  const { saveAndExitModal, handleSaveAndExit } = useSaveAndExitModal()

  const previousAnnotation = getActionAnnotation({
    event,
    actionType: ActionType.VALIDATE
  })

  const annotation = getAnnotation(previousAnnotation)

  const { eventConfiguration: config } = useEventConfiguration(event.type)

  const formConfig = getDeclaration(config)
  const reviewConfig = getActionReview(config, ActionType.VALIDATE)
  const { formatMessage } = useIntlFormatMessageWithFlattenedParams()

  const getFormValues = useEventFormData((state) => state.getFormValues)

  const currentEventState = getCurrentEventState(event, config)
  const previousFormValues = currentEventState.declaration
  const form = getFormValues()

  const reviewActionConfiguration = useReviewActionConfig({
    formConfig,
    declaration: form,
    annotation,
    reviewFields: reviewConfig.fields,
    status: currentEventState.status,
    eventType: event.type,
    validatorContext
  })

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
        ROUTES.V2.EVENTS.VALIDATE.PAGES.buildPath(
          { pageId, eventId },
          {
            from: 'review',
            workqueue: slug
          },
          fieldId ? makeFormFieldIdFormikCompatible(fieldId) : undefined
        )
      )
    }
    return
  }

  async function handleValidation() {
    const confirmedValidation = await openModal<boolean | null>((close) => {
      if (reviewActionConfiguration.messages.modal === undefined) {
        // eslint-disable-next-line no-console
        console.error(
          'Tried to render validate modal without message definitions.'
        )
        return null
      }

      return (
        <ReviewComponent.ActionModal.Accept
          action="Validate"
          close={close}
          copy={{
            ...reviewActionConfiguration.messages.modal,
            eventLabel: config.label
          }}
        />
      )
    })

    if (confirmedValidation) {
      reviewActionConfiguration.onConfirm(eventId)
      closeActionView(slug)
    }
  }

  return (
    <FormLayout
      route={ROUTES.V2.EVENTS.VALIDATE}
      onSaveAndExit={async () =>
        handleSaveAndExit(() => {
          drafts.submitLocalDraft()
          closeActionView(slug)
        })
      }
    >
      <ReviewComponent.Body
        annotation={annotation}
        form={form}
        formConfig={formConfig}
        previousFormValues={previousFormValues}
        reviewFields={reviewConfig.fields}
        title={formatMessage(reviewConfig.title, form)}
        validatorContext={validatorContext}
        onAnnotationChange={(values) => setAnnotation(values)}
        onEdit={handleEdit}
      >
        <ReviewComponent.Actions
          icon={reviewActionConfiguration.icon}
          incomplete={reviewActionConfiguration.incomplete}
          messages={reviewActionConfiguration.messages}
          primaryButtonType={reviewActionConfiguration.buttonType}
          onConfirm={handleValidation}
          onReject={
            currentEventState.flags.includes(InherentFlags.REJECTED)
              ? undefined
              : async () => handleRejection(() => closeActionView(slug))
          }
        />
        {modal}
      </ReviewComponent.Body>
      {saveAndExitModal}
      {rejectionModal}
    </FormLayout>
  )
}
