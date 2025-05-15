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
import { v4 as uuid } from 'uuid'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { useSelector } from 'react-redux'
import {
  getCurrentEventState,
  ActionType,
  getActionAnnotation,
  getDeclaration,
  getActionReview,
  EventStatus
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
import { useSaveAndExitModal } from '@client/v2-events/components/SaveAndExitModal'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { getScope } from '@client/profile/profileSelectors'
import { makeFormFieldIdFormikCompatible } from '@client/v2-events/components/forms/utils'
import { useNotAssignedErrorToast } from '../useNotAssignedErrorToast'
import { useReviewActionConfig } from './useReviewActionConfig'
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

  const [event] = events.getEvent.useSuspenseQuery(eventId)

  const { onPossibleNotAssignedError, NotAssignedErrorToast } =
    useNotAssignedErrorToast(event.trackingId)

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

  const currentEventState = getCurrentEventState(event)
  const previousFormValues = currentEventState.declaration
  const form = getFormValues()

  const scopes = useSelector(getScope) ?? undefined

  const reviewActionConfiguration = useReviewActionConfig({
    formConfig,
    declaration: form,
    annotation,
    scopes,
    reviewFields: reviewConfig.fields
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
            from: 'review'
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
      try {
        await reviewActionConfiguration.onConfirm(eventId)
      } catch (e) {
        onPossibleNotAssignedError(e)
      }

      goToHome()
    }
  }

  async function handleRejection() {
    const confirmedRejection = await openModal<RejectionState | null>(
      (close) => <ReviewComponent.ActionModal.Reject close={close} />
    )
    if (confirmedRejection) {
      const { rejectAction, message, isDuplicate } = confirmedRejection

      try {
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
      } catch (e) {
        onPossibleNotAssignedError(e)
      }

      goToHome()
    }
  }

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
          icon={reviewActionConfiguration.icon}
          incomplete={reviewActionConfiguration.incomplete}
          messages={reviewActionConfiguration.messages}
          primaryButtonType={reviewActionConfiguration.buttonType}
          onConfirm={handleValidation}
          onReject={
            currentEventState.status === EventStatus.REJECTED
              ? undefined
              : handleRejection
          }
        />
        {modal}
      </ReviewComponent.Body>
      {saveAndExitModal}
      <NotAssignedErrorToast />
    </FormLayout>
  )
}
