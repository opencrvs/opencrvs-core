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
import React, { useState } from 'react'
import { useIntl, MessageDescriptor } from 'react-intl'
import { useTypedSearchParams } from 'react-router-typesafe-routes/dom'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import {
  ActionType,
  EventDocument,
  getUUID,
  getDeclaration,
  getActionReview,
  getCurrentEventState,
  EventStatus,
  getActionConfig,
  getAcceptedActions
} from '@opencrvs/commons/client'
import { DropdownMenu } from '@opencrvs/components/lib/Dropdown'
import { CaretDown } from '@opencrvs/components/lib/Icon/all-icons'
import {
  Icon,
  Button,
  Stack,
  Text,
  TextArea,
  Dialog
} from '@opencrvs/components'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { messages as actionMessages } from '@client/i18n/messages/views/action'
import { ROUTES } from '@client/v2-events/routes'
import { useModal } from '@client/v2-events/hooks/useModal'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useUserAllowedActions } from '@client/v2-events/features/workqueues/EventOverview/components/useAllowedActionConfigurations'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { validationErrorsInActionFormExist } from '@client/v2-events/components/forms/validation'
import { useEventConfiguration } from '../../useEventConfiguration'
import { useActionAnnotation } from '../../useActionAnnotation'
import { useEventFormData } from '../../useEventFormData'
import { useCanDirectlyRegister } from '../useCanDirectlyRegister'
import {
  aggregateAnnotations,
  getReviewFormFields,
  hasDeclarationFieldChanged,
  hasFieldChanged
} from '../correct/utils'

export const commentLabel = {
  id: 'event.edit.comment.label',
  defaultMessage: 'Comments',
  description: 'The label for the comment'
}

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
    description: 'Label for Register with edits in edit action menu',
    id: 'event.edit.registerWithEdits.label'
  },
  editAndDeclareLabel: {
    defaultMessage: 'Declare with edits',
    description: 'Label for Declare with edits in edit action menu',
    id: 'event.edit.declareWithEdits.label'
  },
  editAndNotifyLabel: {
    defaultMessage: 'Notify with edits',
    description: 'Label for "Notify with edits" in edit action menu',
    id: 'event.edit.notifyWithEdits.label'
  }
}

interface EditActionModalResult {
  confirmed: boolean
  comment?: string
}

const CommentLabel = styled(Text)`
  padding: 16px 0 4px 0;
`

function EditActionModal({
  title,
  supportingCopy,
  close
}: {
  title: MessageDescriptor
  supportingCopy?: MessageDescriptor
  close: (result: EditActionModalResult) => void
}) {
  const intl = useIntl()
  const [comment, setComment] = useState('')

  return (
    <Dialog
      actions={[
        <Button
          key={'cancel_edit'}
          id={'cancel_edit'}
          type="tertiary"
          onClick={() => close({ confirmed: false })}
        >
          {intl.formatMessage(messages.cancel)}
        </Button>,
        <Button
          key={'confirm_edit'}
          id={'confirm_edit'}
          type="primary"
          onClick={() => close({ confirmed: true, comment })}
        >
          {intl.formatMessage(messages.confirm)}
        </Button>
      ]}
      isOpen={true}
      title={intl.formatMessage(title)}
      variant="large"
      onClose={() => close({ confirmed: false })}
    >
      <Stack>
        <Text color="grey500" element="p" variant="reg16">
          {supportingCopy ? intl.formatMessage(supportingCopy) : null}
        </Text>
      </Stack>
      <CommentLabel element="h3" variant="bold16">
        {intl.formatMessage(commentLabel)}
      </CommentLabel>
      <TextArea
        data-testid="edit-comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
    </Dialog>
  )
}

function useEditActions(event: EventDocument) {
  const { eventConfiguration } = useEventConfiguration(event.type)
  const navigate = useNavigate()
  const { isActionAllowed } = useUserAllowedActions(event.type)
  const [{ workqueue: slug }] = useTypedSearchParams(
    ROUTES.V2.EVENTS.EDIT.REVIEW
  )
  const { getAnnotation } = useActionAnnotation()
  const canDirectlyRegister = useCanDirectlyRegister(event)
  const { closeActionView } = useEventFormNavigation()
  const [modal, openModal] = useModal()
  const events = useEvents()
  const formConfig = getDeclaration(eventConfiguration)
  const declaration = useEventFormData((state) => state.getFormValues())
  const validatorContext = useValidatorContext()
  const reviewConfig = getActionReview(eventConfiguration, ActionType.DECLARE)
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

  const annotation = getAnnotation()
  const acceptedActions = getAcceptedActions(event)
  const originalAnnotation = aggregateAnnotations(acceptedActions)
  const reviewFormFields = getReviewFormFields(eventConfiguration)

  const changedAnnotationFields = reviewFormFields.filter((f) =>
    hasFieldChanged(f, originalAnnotation, annotation, validatorContext)
  )

  const anyValuesHaveChanged =
    changedFields.length > 0 || changedAnnotationFields.length > 0

  if (!reviewConfig) {
    throw new Error('Review config not found')
  }

  const actionConfig = getActionConfig({
    eventConfiguration,
    actionType: ActionType.EDIT
  })

  const hasValidationErrors = validationErrorsInActionFormExist({
    formConfig,
    form: declaration,
    annotation,
    context: validatorContext,
    reviewFields: reviewConfig.fields
  })

  const dialogCopy =
    actionConfig && 'dialogCopy' in actionConfig
      ? actionConfig.dialogCopy
      : null

  return {
    modals: [modal],
    actions: [
      {
        icon: 'PaperPlaneTilt' as const,
        label: messages.editAndRegisterLabel,
        onClick: async () => {
          const { confirmed, comment } = await openModal<EditActionModalResult>(
            (close) => {
              return (
                <EditActionModal
                  close={close}
                  supportingCopy={dialogCopy?.register}
                  title={messages.editAndRegisterLabel}
                />
              )
            }
          )

          if (confirmed) {
            events.customActions.editAndRegister.mutate({
              eventId: event.id,
              transactionId: getUUID(),
              declaration,
              annotation,
              content: { comment }
            })

            closeActionView(slug)
          }
        },
        disabled:
          hasValidationErrors || !anyValuesHaveChanged || !canDirectlyRegister,
        hidden: !isActionAllowed(ActionType.REGISTER)
      },
      {
        icon: 'PaperPlaneTilt' as const,
        label: messages.editAndDeclareLabel,
        onClick: async () => {
          const { confirmed, comment } = await openModal<EditActionModalResult>(
            (close) => {
              return (
                <EditActionModal
                  close={close}
                  supportingCopy={dialogCopy?.declare}
                  title={messages.editAndDeclareLabel}
                />
              )
            }
          )

          if (confirmed) {
            events.customActions.editAndDeclare.mutate({
              eventId: event.id,
              transactionId: getUUID(),
              declaration,
              annotation,
              content: { comment }
            })

            closeActionView(slug)
          }
        },
        disabled: hasValidationErrors || !anyValuesHaveChanged,
        hidden: !isActionAllowed(ActionType.DECLARE)
      },
      {
        icon: 'PaperPlaneTilt' as const,
        label: messages.editAndNotifyLabel,
        onClick: async () => {
          const { confirmed, comment } = await openModal<EditActionModalResult>(
            (close) => {
              return (
                <EditActionModal
                  close={close}
                  supportingCopy={dialogCopy?.notify}
                  title={messages.editAndNotifyLabel}
                />
              )
            }
          )

          if (confirmed) {
            events.customActions.editAndNotify.mutate({
              eventId: event.id,
              transactionId: getUUID(),
              declaration,
              annotation,
              content: { comment }
            })

            closeActionView(slug)
          }
        },
        disabled: !anyValuesHaveChanged,
        hidden:
          !isActionAllowed(ActionType.NOTIFY) ||
          eventIndex.status !== EventStatus.enum.NOTIFIED
      },
      {
        icon: 'ArchiveBox' as const,
        label: {
          defaultMessage: 'Cancel edits',
          description: 'Label for "Cancel edits" in edit action menu',
          id: 'event.edit.cancelEdits'
        },
        onClick: () =>
          navigate(ROUTES.V2.EVENTS.EVENT.buildPath({ eventId: event.id }))
      }
    ].filter((a) => !a.hidden)
  }
}

/** Menu component available on the Edit-action review page. */
export function EditActionMenu({ event }: { event: EventDocument }) {
  const intl = useIntl()
  const { actions, modals } = useEditActions(event)

  return (
    <>
      <DropdownMenu id="action">
        <DropdownMenu.Trigger>
          <Button data-testid="action-dropdownMenu" size="small" type="action">
            {intl.formatMessage(actionMessages.action)}
            <Icon name="CaretDown" size="small" />
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
