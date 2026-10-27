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
import React, { useCallback } from 'react'
import { MessageDescriptor, useIntl } from 'react-intl'
import { useTypedSearchParams } from 'react-router-typesafe-routes/dom'
import {
  ActionType,
  getActionForm,
  EventDocument,
  FieldConfig,
  getCurrentEventState,
  getActionReview,
  getAvailableActionsForEvent,
  eventAttachmentPath
} from '@opencrvs/commons/client'
import { useModal } from '@client/v2-events/hooks/useModal'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { ROUTES } from '@client/v2-events/routes'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { messages as formHeaderMessages } from '@client/v2-events/layouts/form/FormHeader'
import { useUserAllowedActions } from '@client/v2-events/features/workqueues/Actions/useUserAllowedActions'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import {
  AcceptActionModalResult,
  Review
} from '@client/v2-events/features/events/components/Review'
import { useSaveAndExitModal } from '@client/v2-events/components/SaveAndExitModal'
import { validationErrorsInActionFormExist } from '@client/v2-events/components/forms/validation'
import { useActionAnnotation } from '../useActionAnnotation'
import { useEventFormData } from '../useEventFormData'
import { useEventConfiguration } from '../useEventConfiguration'
import { ActionMenuDropdown, ActionMenuItem } from './ActionMenuDropdown'

type ReviewPageActionType = typeof ActionType.DECLARE | typeof ActionType.NOTIFY

/** An action which is confirmed through the accept modal before it is submitted. */
interface ConfirmableAction {
  /** Label of the modal's confirm button */
  confirmLabel: MessageDescriptor
  title: MessageDescriptor
  supportingCopy?: MessageDescriptor
  /** Fields shown in the modal */
  fields: FieldConfig[]
  onConfirm: (values: AcceptActionModalResult['values']) => void
}

const modalActionNames = {
  [ActionType.DECLARE]: 'Declare',
  [ActionType.NOTIFY]: 'Notify'
} satisfies Record<ReviewPageActionType, string>

/**
 * Shared state and actions of the review pages of the declare and notify flows:
 *   - form validation state
 *   - opening the accept modal for an action and closing the action view once confirmed
 *   - Save and exit
 *   - Delete draft
 */
function useReviewPageActions(
  event: EventDocument,
  actionType: ReviewPageActionType
) {
  const intl = useIntl()
  const drafts = useDrafts()
  const {
    closeActionView,
    deleteDeclaration,
    modal: deleteDeclarationModal
  } = useEventFormNavigation()
  const { eventConfiguration } = useEventConfiguration(event.type)
  const validatorContext = useValidatorContext(event)
  const declaration = useEventFormData((state) => state.getFormValues())
  const { getAnnotation } = useActionAnnotation()
  const annotation = getAnnotation()
  const [modal, openModal] = useModal()
  const [{ backTo }] = useTypedSearchParams(
    actionType === ActionType.NOTIFY
      ? ROUTES.V2.EVENTS.NOTIFY.REVIEW
      : ROUTES.V2.EVENTS.DECLARE.REVIEW
  )
  const { saveAndExitModal, handleSaveAndExit } = useSaveAndExitModal()

  const eventId = event.id
  const formConfig = getActionForm(eventConfiguration, actionType)

  const reviewConfig = getActionReview(eventConfiguration, actionType)
  if (!reviewConfig) {
    throw new Error('Review config not found')
  }

  /**
   * hasValidationErrors is true if:
   * - the form has any field validation errors or
   * - the form is incomplete
   */
  const hasValidationErrors = validationErrorsInActionFormExist({
    formConfig,
    form: declaration,
    annotation,
    context: validatorContext,
    reviewFields: reviewConfig.fields
  })

  const eventIndex = getCurrentEventState(event, eventConfiguration)
  const { isActionAllowed } = useUserAllowedActions(eventIndex)
  const availableActions = getAvailableActionsForEvent(eventIndex)

  const onDelete = useCallback(async () => {
    await deleteDeclaration(eventId, backTo)
  }, [eventId, deleteDeclaration, backTo])

  async function confirmAction(action: ConfirmableAction) {
    const modalResult = await openModal<AcceptActionModalResult | null>(
      (close) => (
        <Review.ActionModal.Accept
          action={modalActionNames[actionType]}
          attachmentPath={eventAttachmentPath(eventId)}
          close={close}
          copy={{
            supportingCopy: action.supportingCopy,
            title: action.title,
            onConfirm: action.confirmLabel
          }}
          declaration={declaration}
          event={event}
          eventConfiguration={eventConfiguration}
          eventType={intl.formatMessage(eventConfiguration.label)}
          fields={action.fields}
        />
      )
    )

    if (modalResult) {
      // Don't await the action.onConfirm call to avoid blocking the UI.
      void action.onConfirm(modalResult.values)
      return closeActionView(backTo)
    }
  }

  const commonActions: ActionMenuItem[] = [
    {
      icon: 'FloppyDisk',
      label: formHeaderMessages.saveExitButton,
      onClick: async () =>
        handleSaveAndExit(() => {
          drafts.submitLocalDraft()
          return closeActionView(backTo)
        })
    }
  ]

  if (availableActions.includes(ActionType.DELETE)) {
    commonActions.push({
      icon: 'Trash',
      label: formHeaderMessages.deleteDraft,
      onClick: async () => onDelete()
    })
  }

  return {
    eventConfiguration,
    declaration,
    annotation,
    hasValidationErrors,
    isActionAllowed,
    availableActions,
    confirmAction,
    commonActions,
    modals: [modal, saveAndExitModal, deleteDeclarationModal]
  }
}

/** Review page state an action menu builds its own actions from. */
export type ReviewPageState = Omit<
  ReturnType<typeof useReviewPageActions>,
  'commonActions' | 'modals'
>

/**
 * "Action" dropdown of the declare and notify review pages. Renders the actions the caller
 * builds from the review page state, followed by Save and exit and Delete draft, and the
 * modals they open.
 */
export function ReviewPageActionMenu({
  event,
  actionType,
  getActions
}: {
  event: EventDocument
  actionType: ReviewPageActionType
  getActions: (state: ReviewPageState) => ActionMenuItem[]
}) {
  const { commonActions, modals, ...state } = useReviewPageActions(
    event,
    actionType
  )

  return (
    <ActionMenuDropdown
      actions={[...getActions(state), ...commonActions]}
      modals={modals}
    />
  )
}
