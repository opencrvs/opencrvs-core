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
import { EventDocument } from '@opencrvs/commons/client'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { DropdownMenu } from '@opencrvs/components/lib/Dropdown'
import { CaretDown } from '@opencrvs/components/lib/Icon/all-icons'
import { Icon } from '@opencrvs/components'
import { messages } from '@client/i18n/messages/views/action'

// @TODO CIHAN: register/validate should be unavailable if declaration blocks it
const actions = [
  {
    icon: 'PaperPlaneTilt' as const,
    label: {
      defaultMessage: 'Register with edits',
      description: 'Label for "Register with edits" in edit action menu',
      id: 'event.edit.registerWithEdits'
    },
    onClick: () => console.log('todo')
  },
  {
    icon: 'PaperPlaneTilt' as const,
    label: {
      defaultMessage: 'Declare with edits',
      description: 'Label for "Declare with edits" in edit action menu',
      id: 'event.edit.declareWithEdits'
    },
    onClick: () => console.log('todo')
  },
  {
    icon: 'ArchiveBox' as const,
    label: {
      defaultMessage: 'Cancel edits',
      description: 'Label for "Cancel edits" in edit action menu',
      id: 'event.edit.cancelEdits'
    },
    onClick: () => console.log('todo')
  }
]

/**
 * Menu component available on the edit review page.
 * */
export function EditActionMenu({ event }: { event: EventDocument }) {
  const intl = useIntl()

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
          {actions.map(({ onClick, icon, label }, index) => (
            <DropdownMenu.Item key={index} onClick={onClick}>
              <Icon color="currentColor" name={icon} size="small" />
              {intl.formatMessage(label)}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu>
      {/* {modals} */}
    </>
  )
}
