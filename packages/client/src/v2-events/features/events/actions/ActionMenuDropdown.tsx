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
import { MessageDescriptor, useIntl } from 'react-intl'
import { Button, Icon, IconProps } from '@opencrvs/components'
import { DropdownMenu } from '@opencrvs/components/lib/Dropdown'
import { CaretDown } from '@opencrvs/components/lib/Icon/all-icons'
import { messages } from '@client/i18n/messages/views/action'

export interface ActionMenuItem {
  icon: IconProps['name']
  label: MessageDescriptor
  onClick: () => unknown
  disabled?: boolean
}

/** "Action" dropdown shown on action review pages, e.g. declare, notify and edit. */
export function ActionMenuDropdown({
  actions,
  modals
}: {
  actions: ActionMenuItem[]
  modals: React.ReactNode
}) {
  const intl = useIntl()

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
