/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { Story, Meta } from '@storybook/react'
import styled from 'styled-components'
import { IToggleMenuItem, ToggleMenu } from './ToggleMenu'
import { SettingsBlack, LogoutBlack, Avatar } from '../icons'
import React from 'react'

interface IProps {
  id: string
  menuHeader?: JSX.Element
  toggleButton: JSX.Element
  menuItems: IToggleMenuItem[]
  hasFocusRing?: boolean
  hide?: boolean
  showSubmenu: boolean
}
const UserNameStyle = styled.div`
  ${({ theme }) => theme.fonts.reg18};
`
const UserRoleStyle = styled.div`
  ${({ theme }) => theme.fonts.reg12};
`
const header = (
  <>
    <UserNameStyle>Atiq Zaman</UserNameStyle>
    <UserRoleStyle>Field Agent</UserRoleStyle>
  </>
)

const Template: Story<IProps> = (args) => <ToggleMenu {...args} />

export const ToggleMenuView = Template.bind({})

ToggleMenuView.args = {
  id: 'birth',
  menuHeader: header,
  toggleButton: <Avatar />,
  menuItems: [
    {
      icon: <SettingsBlack />,
      label: 'Settings',
      handler: () => alert('Settings')
    },
    {
      icon: <LogoutBlack />,
      label: 'Logout',
      handler: () => alert('Logout')
    }
  ],
  showSubmenu: true
}

export default {
  title: 'Components/Interface/ToggleMenu',
  component: ToggleMenu
} as Meta
