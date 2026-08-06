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
  EventDocument,
  getActionConfig,
  getActionFormFields,
  isValidIcon
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
import {
  actionIcons,
  actionLabels
} from '@client/v2-events/features/workqueues/Actions/utils'
import {
  AcceptActionModalResult,
  Review
} from '@client/v2-events/features/events/components/Review'
import { useSaveAndExitModal } from '@client/v2-events/components/SaveAndExitModal'
import { useActionAnnotation } from '../../useActionAnnotation'
import { useEventFormData } from '../../useEventFormData'
import { useEventConfiguration } from '../../useEventConfiguration'

/**
 * Menu of actions available on the review page of the independent notify flow.
 * Unlike DeclareActionMenu, this never offers Declare/Register as alternate
 * submit choices: NOTIFY has its own dedicated form here, so submitting its
 * data as anything else would not make sense.
 */
function useNotifyActions(event: EventDocument) {
  const intl = useIntl()
  const eventType = event.type
  const drafts = useDrafts()
  const {
    closeActionView,
    deleteDeclaration,
    modal: deleteDeclarationModal
  } = useEventFormNavigation()
  const { eventConfiguration } = useEventConfiguration(eventType)
  const declaration = useEventFormData((state) => state.getFormValues())
  const { getAnnotation } = useActionAnnotation()
  const annotation = getAnnotation()
  const [modal, openModal] = useModal()
  const [{ backTo }] = useTypedSearchParams(ROUTES.V2.EVENTS.NOTIFY.REVIEW)
  const { saveAndExitModal, handleSaveAndExit } = useSaveAndExitModal()
  const events = useEvents()

  const notifyActionConfig = getActionConfig({
    eventConfiguration,
    actionType: ActionType.NOTIFY
  })

  const eventId = event.id
  const fields = getActionFormFields(eventConfiguration, ActionType.NOTIFY)

  const onDelete = useCallback(async () => {
    await deleteDeclaration(eventId, backTo)
  }, [eventId, deleteDeclaration, backTo])

  const onNotify = useCallback(async () => {
    const modalResult = await openModal<AcceptActionModalResult | null>(
      (close) => {
        return (
          <Review.ActionModal.Accept
            action="Declare"
            close={close}
            copy={{
              supportingCopy: notifyActionConfig?.supportingCopy,
              title: {
                id: 'review.declare.incomplete.confirmModal.title',
                defaultMessage: 'Notify the {event}?',
                description: 'The title for review action modal when notifying'
              },
              onConfirm: actionLabels[ActionType.NOTIFY]
            }}
            declaration={declaration}
            eventConfiguration={eventConfiguration}
            eventType={intl.formatMessage(eventConfiguration.label)}
            fields={fields}
          />
        )
      }
    )

    if (modalResult) {
      events.actions.notify.mutate({
        eventId,
        declaration,
        annotation: { ...annotation, ...modalResult.values },
        transactionId: uuid()
      })
      return closeActionView(backTo)
    }
  }, [
    openModal,
    notifyActionConfig,
    declaration,
    eventConfiguration,
    intl,
    fields,
    events,
    eventId,
    annotation,
    closeActionView,
    backTo
  ])

  return {
    modals: [modal, saveAndExitModal, deleteDeclarationModal],
    actions: [
      {
        icon: isValidIcon(notifyActionConfig?.icon)
          ? notifyActionConfig.icon
          : actionIcons[ActionType.DECLARE],
        label: actionLabels[ActionType.NOTIFY],
        onClick: onNotify,
        hidden: false
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
        hidden: false
      }
    ].filter((a) => !a.hidden)
  }
}

/**
 * Menu component available on the notify-action review page.
 */
export function NotifyActionMenu({ event }: { event: EventDocument }) {
  const intl = useIntl()
  const { modals, actions } = useNotifyActions(event)

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
          {actions.map(({ onClick, icon, label }, index) => (
            <DropdownMenu.Item key={index} onClick={onClick}>
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
