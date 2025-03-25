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
  findActiveActionForm,
  getMetadataForAction
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
import { useEventMetadata } from '@client/v2-events/features/events/useEventMeta'
import { FormLayout } from '@client/v2-events/layouts'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { validationErrorsInActionFormExist } from '@client/v2-events/components/forms/validation'
import { useSaveAndExitModal } from '@client/v2-events/components/SaveAndExitModal'

const messages = defineMessages({
  validateActionTitle: {
    id: 'v2.validateAction.title',
    defaultMessage: 'Send for approval',
    description: 'The title for validate action'
  },
  validateActionDescription: {
    id: 'v2.validateAction.description',
    defaultMessage:
      'The informant will receive an email with a registration number that they can use to collect the certificate',
    description: 'The description for validate action'
  },
  validateActionDeclare: {
    id: 'v2.validateAction.Declare',
    defaultMessage: 'Send for approval',
    description: 'The label for declare button of validate action'
  },
  validateActionReject: {
    id: 'v2.validateAction.Reject',
    defaultMessage: 'Reject',
    description: 'The label for reject button of validate action'
  },
  validateActionDescriptionIncomplete: {
    id: 'v2.validateAction.incompleteForm',
    defaultMessage:
      'Please add mandatory information before sending for approval',
    description: 'The description for warning of incomplete form'
  }
})

/**
 *
 * Preview of event to be validated.
 */
export function Review() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.VALIDATE)
  const events = useEvents()
  const drafts = useDrafts()
  const [modal, openModal] = useModal()
  const navigate = useNavigate()
  const { goToHome } = useEventFormNavigation()
  const validateMutation = events.actions.validate

  const [event] = events.getEvent.useSuspenseQuery(eventId)

  const { setMetadata, getMetadata } = useEventMetadata()

  const { saveAndExitModal, handleSaveAndExit } = useSaveAndExitModal()

  const previousMetadata = getMetadataForAction({
    event,
    actionType: ActionType.VALIDATE,
    drafts: []
  })

  const metadata = getMetadata(previousMetadata)

  const { eventConfiguration: config } = useEventConfiguration(event.type)

  const formConfig = findActiveActionForm(config, ActionType.VALIDATE)
  if (!formConfig) {
    throw new Error(
      `No active form configuration found for ${ActionType.VALIDATE} action`
    )
  }

  const getFormValues = useEventFormData((state) => state.getFormValues)
  const previousFormValues = getCurrentEventState(event).data
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
        ROUTES.V2.EVENTS.VALIDATE.PAGES.buildPath(
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
      <ReviewComponent.ActionModal.Accept action="Validate" close={close} />
    ))
    if (confirmedRegistration) {
      validateMutation.mutate({
        eventId,
        data: form,
        transactionId: uuid(),
        metadata,
        duplicates: []
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
          data: {},
          transactionId: uuid(),
          metadata: { message }
        })
      }

      if (rejectAction === REJECT_ACTIONS.ARCHIVE) {
        events.actions.archive.mutate({
          eventId,
          data: {},
          transactionId: uuid(),
          metadata: { message, isDuplicate }
        })
      }

      goToHome()
    }
  }

  const hasValidationErrors = validationErrorsInActionFormExist(
    formConfig,
    form,
    metadata
  )

  return (
    <FormLayout
      route={ROUTES.V2.EVENTS.VALIDATE}
      onSaveAndExit={async () =>
        handleSaveAndExit(() => {
          drafts.submitLocalDraft()
          goToHome()
        })
      }
    >
      <ReviewComponent.Body
        eventConfig={config}
        form={form}
        formConfig={formConfig}
        metadata={metadata}
        previousFormValues={previousFormValues}
        title=""
        onEdit={handleEdit}
        onMetadataChange={(values) => setMetadata(values)}
      >
        <ReviewComponent.Actions
          isPrimaryActionDisabled={hasValidationErrors}
          messages={{
            title: messages.validateActionTitle,
            description: hasValidationErrors
              ? messages.validateActionDescriptionIncomplete
              : messages.validateActionDescription,
            onConfirm: messages.validateActionDeclare,
            onReject: messages.validateActionReject
          }}
          primaryButtonType={'positive'}
          onConfirm={handleRegistration}
          onReject={handleRejection}
        />
        {modal}
      </ReviewComponent.Body>
      {saveAndExitModal}
    </FormLayout>
  )
}
