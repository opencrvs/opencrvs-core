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
import { DropdownMenu } from '../Dropdown'
import styled from 'styled-components'

const TriggerWrapper = styled.div`
  height: 40px;
  display: flex;
  align-items: center;
`

export interface IToggleMenuItem {
  label: string
  icon?: JSX.Element
  handler: () => void
}
interface IProps {
  id: string
  menuHeader?: JSX.Element
  toggleButton: JSX.Element
  menuItems: IToggleMenuItem[]
  hide?: boolean
}

export const ToggleMenu = ({
  id,
  menuHeader,
  toggleButton,
  menuItems,
  hide
}: IProps) => {
  return hide ? null : (
    <DropdownMenu id={id}>
      <DropdownMenu.Trigger>
        <TriggerWrapper>{toggleButton}</TriggerWrapper>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {menuHeader && <DropdownMenu.Label>{menuHeader}</DropdownMenu.Label>}
        {menuItems.map((item) => (
          <DropdownMenu.Item onClick={item.handler} key={item.label}>
            {item.icon} {item.label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}
