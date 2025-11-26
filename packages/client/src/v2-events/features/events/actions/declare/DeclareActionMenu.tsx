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
import { EventIndex, ActionType } from '@opencrvs/commons/client'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { DropdownMenu } from '@opencrvs/components/lib/Dropdown'
import { CaretDown } from '@opencrvs/components/lib/Icon/all-icons'
import { Icon } from '@opencrvs/components'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import { messages } from '@client/i18n/messages/views/action'
import { ROUTES } from '@client/v2-events/routes'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { messages as formHeaderMessages } from '@client/v2-events/layouts/form/FormHeader'
import { useUserAllowedActions } from '@client/v2-events/features/workqueues/EventOverview/components/useAllowedActionConfigurations'
import { actionLabels } from '@client/v2-events/features/workqueues/EventOverview/components/useAllowedActionConfigurations'

function useDeclarationActions(event: EventIndex) {
  const drafts = useDrafts()
  const intl = useIntl()
  const { closeActionView, deleteDeclaration } = useEventFormNavigation()
  const [{ workqueue: slug }] = useTypedSearchParams(
    ROUTES.V2.EVENTS.DECLARE.REVIEW
  )
  const { isActionAllowed } = useUserAllowedActions(event.type)
  const eventId = event.id

  const onDelete = useCallback(async () => {
    await deleteDeclaration(eventId)
  }, [eventId, deleteDeclaration])

  return [
    {
      icon: 'PencilLine' as const,
      label: intl.formatMessage(actionLabels[ActionType.REGISTER]),
      onClick: () => {
        console.log('TODO CIHAN')
      },
      hidden: !isActionAllowed(ActionType.REGISTER),
      // @TODO: disabled if flags block?
      disabled: false
    },
    {
      icon: 'PencilLine' as const,
      label: intl.formatMessage(actionLabels[ActionType.DECLARE]),
      onClick: () => {
        console.log('TODO CIHAN')
      },
      hidden: !isActionAllowed(ActionType.DECLARE),
      // @TODO: disabled if incomplete?
      disabled: true
    },
    {
      icon: 'PencilLine' as const,
      label: intl.formatMessage({
        id: 'actions.notify',
        defaultMessage: 'Notify',
        description: 'Notify action label'
      }),
      onClick: () => {
        console.log('TODO CIHAN')
      },
      hidden: !isActionAllowed(ActionType.NOTIFY),
      // disabled if not incomplete?
      disabled: true
    },
    {
      icon: 'FloppyDisk' as const,
      label: intl.formatMessage(formHeaderMessages.saveExitButton),
      onClick: () => {
        drafts.submitLocalDraft()
        closeActionView(slug)
      },
      hidden: false
    },
    {
      icon: 'Trash' as const,
      label: intl.formatMessage(formHeaderMessages.deleteDeclaration),
      onClick: onDelete,
      hidden: false
    }
  ].filter((a) => !a.hidden)
}

export function DeclareActionMenu({ event }: { event: EventIndex }) {
  const intl = useIntl()
  const declarationActions = useDeclarationActions(event)

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
          {declarationActions.map(({ onClick, icon, label }, index) => (
            <DropdownMenu.Item key={index} onClick={onClick}>
              <Icon color="currentColor" name={icon} size="small" />
              {label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu>
      {/* {modals} */}
    </>
  )
}
