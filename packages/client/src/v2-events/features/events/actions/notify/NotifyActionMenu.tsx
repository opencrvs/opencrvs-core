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
  getActionFormFields,
  getActionReview,
  getAvailableActionsForEvent,
  getActionConfig,
  isValidIcon,
  eventAttachmentPath,
  getNotificationForm
} from '@opencrvs/commons/client'
import { Button } from '@opencrvs/components'
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
import { useUserAllowedActions } from '@client/v2-events/features/workqueues/Actions/useUserAllowedActions'
import {
  actionIcons,
  actionLabels
} from '@client/v2-events/features/workqueues/Actions/utils'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import {
  AcceptActionModalResult,
  Review
} from '@client/v2-events/features/events/components/Review'
import { useSaveAndExitModal } from '@client/v2-events/components/SaveAndExitModal'
import { validationErrorsInActionFormExist } from '@client/v2-events/components/forms/validation'
import { useActionAnnotation } from '../../useActionAnnotation'
import { useEventFormData } from '../../useEventFormData'
import { useEventConfiguration } from '../../useEventConfiguration'

/**
 * Notify actions contain actions available on the review page of the notify flow. This can include:
 *   - Notify
 *   - Save and exit
 *   - Delete
 */
function useDeclarationActions(event: EventDocument) {
  const intl = useIntl()
  const eventType = event.type
  const drafts = useDrafts()
  const {
    closeActionView,
    deleteDeclaration,
    modal: deleteDeclarationModal
  } = useEventFormNavigation()
  const { eventConfiguration } = useEventConfiguration(eventType)
  const formConfig = getNotificationForm(eventConfiguration)
  const validatorContext = useValidatorContext(event)
  const declaration = useEventFormData((state) => state.getFormValues())
  const { getAnnotation } = useActionAnnotation()
  const annotation = getAnnotation()
  const [modal, openModal] = useModal()
  const [{ backTo }] = useTypedSearchParams(ROUTES.V2.EVENTS.DECLARE.REVIEW)
  const { saveAndExitModal, handleSaveAndExit } = useSaveAndExitModal()
  const events = useEvents()

  const actionConfig = getActionConfig({
    eventConfiguration,
    actionType: ActionType.DECLARE
  })

  const notifyActionConfig = getActionConfig({
    eventConfiguration,
    actionType: ActionType.NOTIFY
  })

  const dialogCopy =
    actionConfig && 'dialogCopy' in actionConfig
      ? actionConfig.dialogCopy
      : null

  const eventId = event.id

  const actions = {
    [ActionType.NOTIFY]: {
      supportingCopy: notifyActionConfig?.supportingCopy ?? dialogCopy?.notify,
      fields: getActionFormFields(eventConfiguration, ActionType.NOTIFY),
      title: {
        id: 'review.declare.incomplete.confirmModal.title',
        defaultMessage: 'Notify the {event}?',
        description: 'The title for review action modal when declaring'
      },
      onConfirm: (values: AcceptActionModalResult['values']) =>
        events.actions.notify.mutate({
          eventId,
          declaration,
          annotation: { ...annotation, ...values },
          transactionId: uuid()
        })
    }
  }

  const reviewConfig = getActionReview(eventConfiguration, ActionType.NOTIFY)
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

  const eventIndex = getCurrentEventState(event, eventConfiguration)
  const { isActionAllowed } = useUserAllowedActions(eventIndex)

  const onDelete = useCallback(async () => {
    await deleteDeclaration(eventId, backTo)
  }, [eventId, deleteDeclaration, backTo])

  async function handleAction(actionType: keyof typeof actions) {
    const action = actions[actionType]

    const modalResult = await openModal<AcceptActionModalResult | null>(
      (close) => {
        return (
          <Review.ActionModal.Accept
            action="Notify"
            attachmentPath={eventAttachmentPath(eventId)}
            close={close}
            copy={{
              supportingCopy: action.supportingCopy,
              title: action.title,
              onConfirm: actionLabels[actionType]
            }}
            declaration={declaration}
            event={event}
            eventConfiguration={eventConfiguration}
            eventType={intl.formatMessage(eventConfiguration.label)}
            fields={action.fields}
          />
        )
      }
    )

    if (modalResult) {
      action.onConfirm(modalResult.values)
      return closeActionView(backTo)
    }
  }

  const availableActions = getAvailableActionsForEvent(eventIndex)

  return {
    modals: [modal, saveAndExitModal, deleteDeclarationModal],
    actions: [
      {
        icon: isValidIcon(notifyActionConfig?.icon)
          ? notifyActionConfig.icon
          : actionIcons[ActionType.DECLARE],
        label: actionLabels[ActionType.NOTIFY],
        onClick: async () => handleAction(ActionType.NOTIFY),
        hidden:
          !availableActions.includes(ActionType.NOTIFY) ||
          !isActionAllowed(ActionType.NOTIFY),
        disabled: hasValidationErrors
      },
      {
        icon: 'FloppyDisk' as const,
        label: formHeaderMessages.saveExitButton,
        onClick: async () =>
          handleSaveAndExit(() => {
            drafts.submitLocalDraft()
            return closeActionView(backTo)
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
 * Menu component available on the notify review page.
 * We have tried to contain all logic to which actions are available in the notify in this component.
 * */
export function NotifyActionMenu({ event }: { event: EventDocument }) {
  const intl = useIntl()
  const { modals, actions } = useDeclarationActions(event)

  return (
    <>
      <DropdownMenu id="action">
        <DropdownMenu.Trigger asChild>
          <Button
            data-testid="action-dropdownMenu"
            size="medium"
            type="primary"
          >
            {intl.formatMessage(messages.action)} <CaretDown />
          </Button>
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
