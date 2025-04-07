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

const messages = defineMessages({
  registerActionTitle: {
    id: 'v2.registerAction.title',
    defaultMessage: 'Register member',
    description: 'The title for register action'
  },
  registerActionDescription: {
    id: 'v2.registerAction.description',
    defaultMessage:
      'By clicking register, you confirm that the information entered is correct and the member can be registered.',
    description: 'The description for register action'
  },
  registerActionDeclare: {
    id: 'v2.registerAction.Declare',
    defaultMessage: 'Register',
    description: 'The label for declare button of register action'
  },
  registerActionReject: {
    id: 'v2.registerAction.Reject',
    defaultMessage: 'Reject',
    description: 'The label for reject button of register action'
  },
  registerActionDescriptionIncomplete: {
    id: 'v2.registerAction.incompleteForm',
    defaultMessage:
      'Please add mandatory information correctly before registering.',
    description: 'The label for warning of incomplete form'
  }
})

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
      <ReviewComponent.ActionModal.Accept action="Register" close={close} />
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

  const hasValidationErrors = validationErrorsInActionFormExist({
    formConfig,
    form,
    annotation,
    reviewFields: reviewConfig.fields
  })

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
          incomplete={hasValidationErrors}
          messages={{
            title: messages.registerActionTitle,
            description: hasValidationErrors
              ? messages.registerActionDescriptionIncomplete
              : messages.registerActionDescription,
            onConfirm: messages.registerActionDeclare,
            onReject: messages.registerActionReject
          }}
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
