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
import { useIntl } from 'react-intl'
import { useTypedSearchParams } from 'react-router-typesafe-routes/dom'
import { v4 as uuid } from 'uuid'
import {
  ActionType,
  getDeclaration,
  EventDocument,
  getCurrentEventState,
  getActionReview,
  getAvailableActionsForEvent,
  getActionConfig
} from '@opencrvs/commons/client'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { DropdownMenu } from '@opencrvs/components/lib/Dropdown'
import { CaretDown } from '@opencrvs/components/lib/Icon/all-icons'
import { Icon } from '@opencrvs/components'
import { useModal } from '@client/v2-events/hooks/useModal'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { messages } from '@client/i18n/messages/views/action'
import { ROUTES } from '@client/v2-events/routes'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { messages as formHeaderMessages } from '@client/v2-events/layouts/form/FormHeader'
import { useUserAllowedActions } from '@client/v2-events/features/workqueues/EventOverview/components/useAllowedActionConfigurations'
import { actionLabels } from '@client/v2-events/features/workqueues/EventOverview/components/useAllowedActionConfigurations'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { Review } from '@client/v2-events/features/events/components/Review'
import { useSaveAndExitModal } from '@client/v2-events/components/SaveAndExitModal'
import { validationErrorsInActionFormExist } from '@client/v2-events/components/forms/validation'
import { useCanDirectlyRegister } from '../useCanDirectlyRegister'
import { useActionAnnotation } from '../../useActionAnnotation'
import { useEventFormData } from '../../useEventFormData'
import { useRejectionModal } from '../reject/useRejectionModal'
import { useEventConfiguration } from '../../useEventConfiguration'

/**
 * Declaration actions contain actions available on the review page of the declare flow. This can include:
 *   - Notify (incomplete records)
 *   - Declare (non-incomplete records)
 *   - Validate (aka. 'direct validation', which means declare+validate actions)
 *   - Register (aka. 'direct registration', which means declare+validate+register actions)
 *   - Reject (only available for previously notified events)
 *   - Save and exit
 *   - Delete declaration
 */
function useDeclarationActions(event: EventDocument) {
  const eventType = event.type
  const drafts = useDrafts()
  const {
    closeActionView,
    deleteDeclaration,
    modal: deleteDeclarationModal
  } = useEventFormNavigation()
  const { eventConfiguration } = useEventConfiguration(eventType)
  const formConfig = getDeclaration(eventConfiguration)
  const validatorContext = useValidatorContext()
  const declaration = useEventFormData((state) => state.getFormValues())
  const { getAnnotation } = useActionAnnotation()
  const annotation = getAnnotation()
  const [modal, openModal] = useModal()
  const { rejectionModal, handleRejection } = useRejectionModal(
    event.id,
    eventType
  )
  const canDirectlyRegister = useCanDirectlyRegister(event)
  const [{ workqueue: slug }] = useTypedSearchParams(
    ROUTES.V2.EVENTS.DECLARE.REVIEW
  )
  const { saveAndExitModal, handleSaveAndExit } = useSaveAndExitModal()
  const events = useEvents()

  const actionConfig = getActionConfig({
    eventConfiguration,
    actionType: ActionType.DECLARE
  })

  const dialogCopy =
    actionConfig && 'dialogCopy' in actionConfig
      ? actionConfig.dialogCopy
      : null

  const actions = {
    [ActionType.NOTIFY]: {
      mutate: events.actions.notify.mutate,
      supportingCopy: dialogCopy?.notify,
      title: {
        id: 'review.declare.incomplete.confirmModal.title',
        defaultMessage: 'Notify the {event}?',
        description: 'The title for review action modal when declaring'
      }
    },
    [ActionType.DECLARE]: {
      mutate: events.actions.declare.mutate,
      supportingCopy: dialogCopy?.declare,
      title: {
        id: 'review.declare.confirmModal.title',
        defaultMessage: 'Declare the {event}?',
        description: 'The title for review action modal when declaring'
      }
    },
    [ActionType.REGISTER]: {
      mutate: events.customActions.registerOnDeclare.mutate,
      supportingCopy: dialogCopy?.register,
      title: {
        id: 'review.register.confirmModal.title',
        defaultMessage: 'Register the {event}?',
        description: 'The title for review action modal when registering'
      }
    }
  }

  const reviewConfig = getActionReview(eventConfiguration, ActionType.DECLARE)
  if (!reviewConfig) {
    throw new Error('Review config not found')
  }

  /**
   * hasValidationErrors is true if:
   * - the form has any field validation errors or
   * - the form is incomplete
   *
   * If hasValidationErrors is true, the user is still able to Notify an event (if they have the required scope)
   */
  const hasValidationErrors = validationErrorsInActionFormExist({
    formConfig,
    form: declaration,
    annotation,
    context: validatorContext,
    reviewFields: reviewConfig.fields
  })

  const { isActionAllowed } = useUserAllowedActions(eventType)
  const eventId = event.id

  const onDelete = useCallback(async () => {
    await deleteDeclaration(eventId)
  }, [eventId, deleteDeclaration])

  async function handleDeclaration(actionType: keyof typeof actions) {
    const action = actions[actionType]

    const confirmedDeclaration = await openModal<boolean | null>((close) => {
      return (
        <Review.ActionModal.Accept
          action="Declare"
          close={close}
          copy={{
            supportingCopy: action.supportingCopy,
            title: action.title,
            onConfirm: actionLabels[actionType]
          }}
        />
      )
    })

    if (confirmedDeclaration) {
      action.mutate({
        eventId,
        declaration,
        annotation,
        transactionId: uuid()
      })
      return closeActionView(slug)
    }
  }

  const eventIndex = getCurrentEventState(event, eventConfiguration)
  const availableActions = getAvailableActionsForEvent(eventIndex)

  return {
    modals: [modal, rejectionModal, saveAndExitModal, deleteDeclarationModal],
    actions: [
      {
        icon: 'Check' as const,
        label: actionLabels[ActionType.REGISTER],
        onClick: async () => handleDeclaration(ActionType.REGISTER),
        hidden: !isActionAllowed(ActionType.REGISTER),
        disabled: hasValidationErrors || !canDirectlyRegister
      },
      {
        icon: 'UploadSimple' as const,
        label: actionLabels[ActionType.DECLARE],
        onClick: async () => handleDeclaration(ActionType.DECLARE),
        hidden: !isActionAllowed(ActionType.DECLARE),
        disabled: hasValidationErrors
      },
      {
        icon: 'UploadSimple' as const,
        label: actionLabels[ActionType.NOTIFY],
        onClick: async () => handleDeclaration(ActionType.NOTIFY),
        hidden:
          !availableActions.includes(ActionType.NOTIFY) ||
          !isActionAllowed(ActionType.NOTIFY)
      },
      // @TODO CIHAN: Do we still need reject here?
      {
        icon: 'FileX' as const,
        label: actionLabels[ActionType.REJECT],
        onClick: async () => handleRejection(() => closeActionView(slug)),
        hidden: !availableActions.includes(ActionType.REJECT)
      },
      {
        icon: 'FloppyDisk' as const,
        label: formHeaderMessages.saveExitButton,
        onClick: async () =>
          handleSaveAndExit(() => {
            drafts.submitLocalDraft()
            return closeActionView(slug)
          }),
        hidden: false
      },
      {
        icon: 'Trash' as const,
        label: formHeaderMessages.deleteDeclaration,
        onClick: async () => onDelete(),
        hidden: !availableActions.includes(ActionType.DELETE)
      }
    ].filter((a) => !a.hidden)
  }
}

/**
 * Menu component available on the declaration review page.
 * We have tried to contain all logic to which actions are available in the declaration in this component.
 * */
export function DeclareActionMenu({ event }: { event: EventDocument }) {
  const intl = useIntl()
  const { modals, actions } = useDeclarationActions(event)

  return (
    <>
      <DropdownMenu id="action">
        <DropdownMenu.Trigger asChild>
          <PrimaryButton
            data-testid="action-dropdownMenu"
            icon={() => <CaretDown />}
            size="medium"
          >
            {intl.formatMessage(messages.action)}
          </PrimaryButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {actions.map(({ onClick, icon, label, disabled }, index) => (
            <DropdownMenu.Item
              key={index}
              disabled={disabled}
              onClick={onClick}
            >
              <Icon color="currentColor" name={icon} size="small" />
              {intl.formatMessage(label)}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu>
      {modals}
    </>
  )
}
