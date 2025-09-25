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
import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import {
  ActionType,
  EventStatus,
  getActionReview,
  getCurrentEventState,
  getDeclaration,
  InherentFlags,
  LocationType
} from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useActionAnnotation } from '@client/v2-events/features/events/useActionAnnotation'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useModal } from '@client/v2-events/hooks/useModal'
import { ROUTES } from '@client/v2-events/routes'
import {
  REJECT_ACTIONS,
  RejectionState,
  Review as ReviewComponent
} from '@client/v2-events/features/events/components/Review'
import { FormLayout } from '@client/v2-events/layouts'
import { makeFormFieldIdFormikCompatible } from '@client/v2-events/components/forms/utils'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { useSaveAndExitModal } from '@client/v2-events/components/SaveAndExitModal'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { useUserAllowedActions } from '@client/v2-events/features/workqueues/EventOverview/components/useAllowedActionConfigurations'
import { useContext } from '@client/v2-events/hooks/useContext'
import { useReviewActionConfig } from './useReviewActionConfig'

export function Review() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.DECLARE.REVIEW)
  const [{ workqueue: slug }] = useTypedSearchParams(
    ROUTES.V2.EVENTS.DECLARE.REVIEW
  )
  const events = useEvents()
  const drafts = useDrafts()
  const navigate = useNavigate()
  const userContext = useContext()

  const [modal, openModal] = useModal()
  const { formatMessage } = useIntlFormatMessageWithFlattenedParams()
  const { closeActionView } = useEventFormNavigation()
  const { saveAndExitModal, handleSaveAndExit } = useSaveAndExitModal()
  const locationIds = userContext.leafAdminStructureLocationIds

  const event = events.getEvent.getFromCache(eventId)

  const { eventConfiguration: config } = useEventConfiguration(event.type)

  const currentEventState = getCurrentEventState(event, config)

  const formConfig = getDeclaration(config)
  const reviewConfig = getActionReview(config, ActionType.DECLARE)

  const form = useEventFormData((state) => state.getFormValues())

  const { setAnnotation, getAnnotation } = useActionAnnotation()
  const annotation = getAnnotation()

  const { isActionAllowed } = useUserAllowedActions(event.type)

  const reviewActionConfiguration = useReviewActionConfig({
    eventType: event.type,
    formConfig,
    declaration: form,
    annotation,
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
            from: 'review',
            workqueue: slug
          },
          fieldId ? makeFormFieldIdFormikCompatible(fieldId) : undefined
        )
      )
    }

    return
  }

  async function handleDeclaration() {
    const confirmedDeclaration = await openModal<boolean | null>((close) => {
      if (reviewActionConfiguration.messages.modal === undefined) {
        // eslint-disable-next-line no-console
        console.error(
          'Tried to render declare modal without message definitions.'
        )
        return null
      }

      return (
        <ReviewComponent.ActionModal.Accept
          action="Declare"
          close={close}
          copy={{
            ...reviewActionConfiguration.messages.modal,
            eventLabel: config.label
          }}
        />
      )
    })

    if (confirmedDeclaration) {
      reviewActionConfiguration.onConfirm(eventId)
      closeActionView(slug)
    }
  }

  async function handleRejection() {
    const confirmedRejection = await openModal<RejectionState | null>(
      (close) => <ReviewComponent.ActionModal.Reject close={close} />
    )
    if (confirmedRejection) {
      const { rejectAction, message, isDuplicate } = confirmedRejection

      if (rejectAction === REJECT_ACTIONS.SEND_FOR_UPDATE) {
        if (isDuplicate) {
          events.customActions.archiveOnDuplicate.mutate({
            eventId,
            declaration: {},
            transactionId: uuid(),
            content: { reason: message },
            context: userContext
          })
        } else {
          events.actions.reject.mutate({
            eventId,
            declaration: {},
            transactionId: uuid(),
            annotation: {},
            content: { reason: message }
          })
        }
      }

      if (rejectAction === REJECT_ACTIONS.ARCHIVE) {
        events.actions.archive.mutate({
          eventId,
          declaration: {},
          transactionId: uuid(),
          annotation: {},
          content: { reason: message }
        })
      }
      closeActionView(slug)
    }
  }

  return (
    <FormLayout
      route={ROUTES.V2.EVENTS.DECLARE}
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
        locationIds={locationIds}
        reviewFields={reviewConfig.fields}
        title={formatMessage(reviewConfig.title, form)}
        onAnnotationChange={(values) => setAnnotation(values)}
        onEdit={handleEdit}
      >
        <ReviewComponent.Actions
          canSendIncomplete={isActionAllowed(ActionType.NOTIFY)}
          icon={reviewActionConfiguration.icon}
          incomplete={reviewActionConfiguration.incomplete}
          messages={reviewActionConfiguration.messages}
          primaryButtonType={reviewActionConfiguration.buttonType}
          onConfirm={handleDeclaration}
          onReject={
            currentEventState.status === EventStatus.enum.NOTIFIED &&
            !currentEventState.flags.includes(InherentFlags.REJECTED)
              ? handleRejection
              : undefined
          }
        />
      </ReviewComponent.Body>
      {modal}
      {saveAndExitModal}
    </FormLayout>
  )
}

export const ReviewIndex = withSuspense(Review)
