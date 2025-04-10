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
import { defineMessages } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import {
  getCurrentEventState,
  ActionType,
  getActionAnnotation,
  getDeclaration,
  getActionReview
} from '@opencrvs/commons/client'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import {
  REJECT_ACTIONS,
  RejectionState,
  Review as ReviewComponent
} from '@client/v2-events/features/events/components/Review'
import { useModal } from '@client/v2-events/hooks/useModal'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useActionAnnotation } from '@client/v2-events/features/events/useActionAnnotation'
import { FormLayout } from '@client/v2-events/layouts'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { validationErrorsInActionFormExist } from '@client/v2-events/components/forms/validation'
import { useSaveAndExitModal } from '@client/v2-events/components/SaveAndExitModal'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { reviewMessages } from '../messages'

function getTranslations(hasErrors: boolean) {
  const state = hasErrors ? 'incomplete' : ('complete' as const)

  return reviewMessages[state].register
}
/**
 *
 * Preview of event to be registered.
 */
export function Review() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.REGISTER)
  const events = useEvents()
  const drafts = useDrafts()
  const [modal, openModal] = useModal()
  const navigate = useNavigate()
  const { goToHome } = useEventFormNavigation()
  const { saveAndExitModal, handleSaveAndExit } = useSaveAndExitModal()
  const { formatMessage } = useIntlFormatMessageWithFlattenedParams()

  const registerMutation = events.actions.register

  const [event] = events.getEvent.useSuspenseQuery(eventId)

  const previousAnnotation = getActionAnnotation({
    event,
    actionType: ActionType.REGISTER,
    drafts: []
  })

  const { setAnnotation, getAnnotation } = useActionAnnotation()
  const annotation = getAnnotation(previousAnnotation)

  const { eventConfiguration: config } = useEventConfiguration(event.type)

  const formConfig = getDeclaration(config)
  const reviewConfig = getActionReview(config, ActionType.REGISTER)

  const getFormValues = useEventFormData((state) => state.getFormValues)
  const previousFormValues = getCurrentEventState(event).declaration
  const form = getFormValues()

  const incomplete = validationErrorsInActionFormExist({
    formConfig,
    form,
    annotation,
    reviewFields: reviewConfig.fields
  })

  const messages = getTranslations(incomplete)

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
        ROUTES.V2.EVENTS.REGISTER.PAGES.buildPath(
          { pageId, eventId },
          {
            from: 'review'
          },
          fieldId
        )
      )
    }
    return
  }

  async function handleRegistration() {
    const confirmedRegistration = await openModal<boolean | null>((close) => (
      <ReviewComponent.ActionModal.Accept
        action="Register"
        close={close}
        copy={messages.modal}
      />
    ))
    if (confirmedRegistration) {
      registerMutation.mutate({
        eventId,
        declaration: form,
        transactionId: uuid(),
        annotation
      })

      goToHome()
    }
  }

  async function handleRejection() {
    const confirmedRejection = await openModal<RejectionState | null>(
      (close) => <ReviewComponent.ActionModal.Reject close={close} />
    )
    if (confirmedRejection) {
      const { rejectAction, message, isDuplicate } = confirmedRejection

      if (rejectAction === REJECT_ACTIONS.SEND_FOR_UPDATE) {
        events.actions.reject.mutate({
          eventId,
          declaration: {},
          transactionId: uuid(),
          annotation: { message }
        })
      }

      if (rejectAction === REJECT_ACTIONS.ARCHIVE) {
        events.actions.archive.mutate({
          eventId,
          declaration: {},
          transactionId: uuid(),
          annotation: { message, isDuplicate }
        })
      }

      goToHome()
    }
  }

  return (
    <FormLayout
      route={ROUTES.V2.EVENTS.REGISTER}
      onSaveAndExit={async () =>
        handleSaveAndExit(() => {
          drafts.submitLocalDraft()
          goToHome()
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
        onAnnotationChange={(values) => setAnnotation(values)}
        onEdit={handleEdit}
      >
        <ReviewComponent.Actions
          incomplete={incomplete}
          messages={messages}
          primaryButtonType="positive"
          onConfirm={handleRegistration}
          onReject={handleRejection}
        />
        {modal}
      </ReviewComponent.Body>
      {saveAndExitModal}
    </FormLayout>
  )
}
