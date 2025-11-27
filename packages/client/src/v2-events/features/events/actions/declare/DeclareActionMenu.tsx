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
import {
  EventIndex,
  ActionType,
  getDeclaration,
  EventStatus
} from '@opencrvs/commons/client'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { DropdownMenu } from '@opencrvs/components/lib/Dropdown'
import { CaretDown } from '@opencrvs/components/lib/Icon/all-icons'
import { useModal } from '@client/v2-events/hooks/useModal'
import { useRejectionModal } from '../reject/useRejectionModal'
import { Icon } from '@opencrvs/components'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { messages } from '@client/i18n/messages/views/action'
import { ROUTES } from '@client/v2-events/routes'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { messages as formHeaderMessages } from '@client/v2-events/layouts/form/FormHeader'
import { useUserAllowedActions } from '@client/v2-events/features/workqueues/EventOverview/components/useAllowedActionConfigurations'
import { actionLabels } from '@client/v2-events/features/workqueues/EventOverview/components/useAllowedActionConfigurations'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { useEventConfiguration } from '../../useEventConfiguration'
import { useEventFormData } from '../../useEventFormData'
import { useActionAnnotation } from '../../useActionAnnotation'
import { useReviewActionConfig } from './useReviewActionConfig'
import { Review } from '@client/v2-events/features/events/components/Review'
import { v4 as uuid } from 'uuid'
import { useSaveAndExitModal } from '@client/v2-events/components/SaveAndExitModal'

function useDeclarationActions(event: EventIndex) {
  const drafts = useDrafts()
  const intl = useIntl()
  const { closeActionView, deleteDeclaration } = useEventFormNavigation()
  const eventType = event.type
  const { eventConfiguration } = useEventConfiguration(eventType)
  const formConfig = getDeclaration(eventConfiguration)
  const validatorContext = useValidatorContext()
  const declaration = useEventFormData((state) => state.getFormValues())
  const { getAnnotation } = useActionAnnotation()
  const annotation = getAnnotation()
  const [modal, openModal] = useModal()
  const { rejectionModal, handleRejection } = useRejectionModal(event.id)
  const [{ workqueue: slug }] = useTypedSearchParams(
    ROUTES.V2.EVENTS.DECLARE.REVIEW
  )
  const { saveAndExitModal, handleSaveAndExit } = useSaveAndExitModal()

  const events = useEvents()

  const mutateFns = {
    [ActionType.NOTIFY]: events.actions.notify.mutate,
    [ActionType.DECLARE]: events.actions.declare.mutate,
    [ActionType.VALIDATE]: events.customActions.validateOnDeclare.mutate,
    [ActionType.REGISTER]: events.customActions.registerOnDeclare.mutate
  }

  const actionConfiguration = eventConfiguration.actions.find(
    (a) => a.type === ActionType.DECLARE
  )
  if (!actionConfiguration) {
    throw new Error('Action configuration not found')
  }

  const reviewConfig = actionConfiguration.review

  // @TODO CIHAN: can we clean up useReviewActionConfig?
  const reviewActionConfiguration = useReviewActionConfig({
    eventType,
    formConfig,
    declaration,
    annotation,
    reviewFields: reviewConfig.fields,
    validatorContext
  })

  const { isActionAllowed } = useUserAllowedActions(eventType)
  const eventId = event.id

  const onDelete = useCallback(async () => {
    await deleteDeclaration(eventId)
  }, [eventId, deleteDeclaration])

  async function handleDeclaration(actionType: keyof typeof mutateFns) {
    const mutateFn = mutateFns[actionType]

    const confirmedDeclaration = await openModal<boolean | null>((close) => {
      if (reviewActionConfiguration.messages.modal === undefined) {
        // eslint-disable-next-line no-console
        console.error(
          'Tried to render declare modal without message definitions.'
        )
        return null
      }

      return (
        <Review.ActionModal.Accept
          action="Declare"
          close={close}
          copy={{
            // @TODO: make these configurable in action config?
            ...reviewActionConfiguration.messages.modal,
            onConfirm: actionLabels[actionType],
            eventLabel: eventConfiguration.label
          }}
        />
      )
    })

    if (confirmedDeclaration) {
      mutateFn({
        eventId,
        declaration,
        annotation,
        transactionId: uuid()
      })
      closeActionView(slug)
    }
  }

  return {
    modals: [modal, rejectionModal, saveAndExitModal],
    actions: [
      {
        icon: 'PencilLine' as const,
        label: intl.formatMessage(actionLabels[ActionType.REGISTER]),
        onClick: () => handleDeclaration(ActionType.REGISTER),
        hidden: !isActionAllowed(ActionType.REGISTER),
        // @TODO: disabled if flags block?
        disabled: reviewActionConfiguration.incomplete
      },
      {
        icon: 'PencilLine' as const,
        label: intl.formatMessage(actionLabels[ActionType.VALIDATE]),
        onClick: () => handleDeclaration(ActionType.VALIDATE),
        hidden: !isActionAllowed(ActionType.VALIDATE),
        // @TODO: disabled if flags block?
        disabled: reviewActionConfiguration.incomplete
      },
      {
        icon: 'PencilLine' as const,
        label: intl.formatMessage(actionLabels[ActionType.DECLARE]),
        onClick: () => handleDeclaration(ActionType.DECLARE),
        hidden: !isActionAllowed(ActionType.DECLARE),
        disabled: reviewActionConfiguration.incomplete
      },
      {
        icon: 'PencilLine' as const,
        label: intl.formatMessage(actionLabels[ActionType.NOTIFY]),
        onClick: () => handleDeclaration(ActionType.NOTIFY),
        hidden: !isActionAllowed(ActionType.NOTIFY),
        disabled: false
      },
      {
        icon: 'FileX' as const,
        label: intl.formatMessage(actionLabels[ActionType.REJECT]),
        onClick: () => {
          // @TODO CIHAN:
        },
        hidden: event.status !== EventStatus.enum.NOTIFIED
      },
      {
        icon: 'FloppyDisk' as const,
        label: intl.formatMessage(formHeaderMessages.saveExitButton),
        onClick: () =>
          handleSaveAndExit(() => {
            drafts.submitLocalDraft()
            closeActionView(slug)
          }),
        hidden: false
      },
      {
        icon: 'Trash' as const,
        label: intl.formatMessage(formHeaderMessages.deleteDeclaration),
        onClick: () => onDelete,
        hidden: false
      }
    ].filter((a) => !a.hidden)
  }
}

export function DeclareActionMenu({ event }: { event: EventIndex }) {
  const intl = useIntl()

  const { closeActionView, modal } = useEventFormNavigation()
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
              onClick={onClick}
              disabled={disabled}
            >
              <Icon color="currentColor" name={icon} size="small" />
              {label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu>
      {modals}
    </>
  )
}
