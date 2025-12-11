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
import { useIntl } from 'react-intl'
import { useTypedSearchParams } from 'react-router-typesafe-routes/dom'
import {
  ActionType,
  EventDocument,
  getUUID,
  getDeclaration,
  getActionReview,
  getCurrentEventState
} from '@opencrvs/commons/client'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { DropdownMenu } from '@opencrvs/components/lib/Dropdown'
import { CaretDown } from '@opencrvs/components/lib/Icon/all-icons'
import { Icon } from '@opencrvs/components'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { messages as actionMessages } from '@client/i18n/messages/views/action'
import { ROUTES } from '@client/v2-events/routes'
import { useModal } from '@client/v2-events/hooks/useModal'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { Review } from '@client/v2-events/features/events/components/Review'
import { useUserAllowedActions } from '@client/v2-events/features/workqueues/EventOverview/components/useAllowedActionConfigurations'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { validationErrorsInActionFormExist } from '@client/v2-events/components/forms/validation'
import { useEventConfiguration } from '../../useEventConfiguration'
import { useActionAnnotation } from '../../useActionAnnotation'
import { useEventFormData } from '../../useEventFormData'
import { hasDeclarationFieldChanged } from '../correct/utils'

const messages = {
  cancel: {
    id: 'actionModal.cancel',
    defaultMessage: 'Cancel',
    description: 'The label for cancel button of action modal'
  },
  confirm: {
    id: 'actionModal.confirm',
    defaultMessage: 'Confirm',
    description: 'The label for confirm button of action modal'
  },
  editAndRegisterLabel: {
    defaultMessage: 'Register with edits',
    description: 'Label for "Register with edits" in edit action menu',
    id: 'event.edit.registerWithEdits.label'
  },
  editAndDeclareLabel: {
    defaultMessage: 'Declare with edits',
    description: 'Label for "Declare with edits" in edit action menu',
    id: 'event.edit.declareWithEdits.label'
  },
  editAndRegisterDescription: {
    id: 'event.edit.registerWithEdits.description',
    description: 'Description for "Register with edits" in edit action menu',
    defaultMessage:
      'Are you sure you want to register this event with these edits?'
  },
  editAndDeclareDescription: {
    id: 'event.edit.declareWithEdits.description',
    description: 'Description for "Declare with edits" in edit action menu',
    defaultMessage:
      'Are you sure you want to edit this declaration? By confirming you are redeclaring this event and overide past changes...'
  }
}

function useEditActions(event: EventDocument) {
  const eventType = event.type
  const { eventConfiguration } = useEventConfiguration(eventType)
  const { isActionAllowed } = useUserAllowedActions(eventType)
  const [{ workqueue: slug }] = useTypedSearchParams(
    ROUTES.V2.EVENTS.EDIT.REVIEW
  )
  const { closeActionView } = useEventFormNavigation()
  const [modal, openModal] = useModal()
  const events = useEvents()
  const formConfig = getDeclaration(eventConfiguration)
  const declaration = useEventFormData((state) => state.getFormValues())
  const { getAnnotation } = useActionAnnotation()
  const annotation = getAnnotation()
  const validatorContext = useValidatorContext()
  const reviewConfig = getActionReview(eventConfiguration, ActionType.EDIT)
  const eventIndex = getCurrentEventState(event, eventConfiguration)

  const formFields = formConfig.pages.flatMap((page) => page.fields)
  const changedFields = formFields.filter((f) =>
    hasDeclarationFieldChanged(
      f,
      declaration,
      eventIndex.declaration,
      eventConfiguration,
      validatorContext
    )
  )

  const anyValuesHaveChanged = changedFields.length > 0

  if (!reviewConfig) {
    throw new Error('Review config not found')
  }

  const hasValidationErrors = validationErrorsInActionFormExist({
    formConfig,
    form: declaration,
    annotation,
    context: validatorContext,
    reviewFields: reviewConfig.fields
  })

  return {
    modals: [modal],
    actions: [
      {
        icon: 'PaperPlaneTilt' as const,
        label: messages.editAndRegisterLabel,
        onClick: async () => {
          const confirm = await openModal<boolean | null>((close) => {
            return (
              <Review.ActionModal.Accept
                action="EditAndRegister"
                close={close}
                copy={{
                  onCancel: messages.cancel,
                  onConfirm: messages.confirm,
                  eventLabel: eventConfiguration.label,
                  title: messages.editAndRegisterLabel,
                  description: messages.editAndRegisterDescription
                }}
              />
            )
          })

          if (confirm) {
            events.customActions.editAndRegister.mutate({
              eventId: event.id,
              transactionId: getUUID(),
              declaration,
              annotation
            })

            closeActionView(slug)
          }
        },
        disabled: hasValidationErrors || !anyValuesHaveChanged,
        hidden: !isActionAllowed(ActionType.REGISTER)
      },
      {
        icon: 'PaperPlaneTilt' as const,
        label: messages.editAndDeclareLabel,
        onClick: async () => {
          const confirm = await openModal<boolean | null>((close) => {
            return (
              <Review.ActionModal.Accept
                action="EditAndDeclare"
                close={close}
                copy={{
                  onCancel: messages.cancel,
                  onConfirm: messages.confirm,
                  eventLabel: eventConfiguration.label,
                  title: messages.editAndDeclareLabel,
                  description: messages.editAndDeclareDescription
                }}
              />
            )
          })

          if (confirm) {
            events.customActions.editAndDeclare.mutate({
              eventId: event.id,
              transactionId: getUUID(),
              declaration,
              annotation
            })

            closeActionView(slug)
          }
        },
        disabled: hasValidationErrors || !anyValuesHaveChanged,
        hidden: !isActionAllowed(ActionType.DECLARE)
      },
      {
        icon: 'ArchiveBox' as const,
        label: {
          defaultMessage: 'Cancel edits',
          description: 'Label for "Cancel edits" in edit action menu',
          id: 'event.edit.cancelEdits'
        },
        onClick: () => closeActionView(slug)
      }
    ].filter((a) => !a.hidden)
  }
}

/**
 * Menu component available on the edit review page.
 * */
export function EditActionMenu({ event }: { event: EventDocument }) {
  const intl = useIntl()
  const { actions, modals } = useEditActions(event)

  return (
    <>
      <DropdownMenu id="action">
        <DropdownMenu.Trigger asChild>
          <PrimaryButton
            data-testid="action-dropdownMenu"
            icon={() => <CaretDown />}
            size="medium"
          >
            {intl.formatMessage(actionMessages.action)}
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
