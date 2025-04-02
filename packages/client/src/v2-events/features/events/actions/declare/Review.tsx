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
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { useSelector } from 'react-redux'
import {
  ActionType,
  getActionReview,
  getDeclaration,
  SCOPES
} from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useEventMetadata } from '@client/v2-events/features/events/useEventMeta'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useModal } from '@client/v2-events/hooks/useModal'
import { ROUTES } from '@client/v2-events/routes'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { FormLayout } from '@client/v2-events/layouts'
import { makeFormFieldIdFormikCompatible } from '@client/v2-events/components/forms/utils'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { getScope } from '@client/profile/profileSelectors'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { useSaveAndExitModal } from '@client/v2-events/components/SaveAndExitModal'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { validationErrorsInActionFormExist } from '@client/v2-events/components/forms/validation'
import { useReviewActionConfig } from './useReviewActionConfig'

export function Review() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.DECLARE.REVIEW)
  const events = useEvents()
  const drafts = useDrafts()
  const navigate = useNavigate()
  const [modal, openModal] = useModal()
  const { formatMessage } = useIntlFormatMessageWithFlattenedParams()
  const { goToHome } = useEventFormNavigation()
  const { saveAndExitModal, handleSaveAndExit } = useSaveAndExitModal()

  const event = events.getEventState.useSuspenseQuery(eventId)

  const { eventConfiguration: config } = useEventConfiguration(event.type)

  const formConfig = getDeclaration(config)
  const reviewConfig = getActionReview(config, ActionType.DECLARE)

  const form = useEventFormData((state) => state.getFormValues())

  const { setMetadata, getMetadata } = useEventMetadata()
  const metadata = getMetadata()

  const scopes = useSelector(getScope) ?? undefined

  const reviewActionConfiguration = useReviewActionConfig({
    formConfig,
    form,
    metadata,
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
        <ReviewComponent.EditModal close={close}></ReviewComponent.EditModal>
      )))

    if (confirmedEdit) {
      navigate(
        ROUTES.V2.EVENTS.DECLARE.PAGES.buildPath(
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

  const hasValidationErrors = validationErrorsInActionFormExist({
    formConfig,
    form,
    metadata,
    reviewFields: reviewConfig.fields
  })

  async function handleDeclaration() {
    const confirmedDeclaration = await openModal<boolean | null>((close) => (
      <ReviewComponent.ActionModal.Accept
        action="Declare"
        close={close}
        copy={reviewActionConfiguration.messages.modal}
        incomplete={hasValidationErrors}
      />
    ))
    if (confirmedDeclaration) {
      reviewActionConfiguration.onConfirm(eventId)

      goToHome()
    }
  }

  return (
    <FormLayout
      route={ROUTES.V2.EVENTS.DECLARE}
      onSaveAndExit={async () =>
        handleSaveAndExit(() => {
          drafts.submitLocalDraft()
          goToHome()
        })
      }
    >
      <ReviewComponent.Body
        form={form}
        formConfig={formConfig}
        metadata={metadata}
        reviewFields={reviewConfig.fields}
        title={formatMessage(reviewConfig.title, form)}
        onEdit={handleEdit}
        onMetadataChange={(values) => setMetadata(values)}
      >
        <ReviewComponent.Actions
          canSendIncomplete={scopes?.includes(SCOPES.RECORD_SUBMIT_INCOMPLETE)}
          isPrimaryActionDisabled={reviewActionConfiguration.isDisabled}
          messages={reviewActionConfiguration.messages}
          primaryButtonType={reviewActionConfiguration.buttonType}
          onConfirm={handleDeclaration}
        />
      </ReviewComponent.Body>
      {modal}
      {saveAndExitModal}
    </FormLayout>
  )
}

export const ReviewIndex = withSuspense(Review)
