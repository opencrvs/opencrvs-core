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
import { Meta, Story } from '@storybook/react'
import { useState } from 'react'
import { ExpandingMenu } from './ExpandingMenu'
import styled from 'styled-components'
import {
  ApplicationBlack,
  ApplicationBlue,
  StatsBlack,
  StatsBlue,
  SettingsBlack,
  SettingsBlue,
  HelpBlack,
  HelpBlue,
  LogoutBlack,
  LogoutBlue,
  Hamburger
} from '../../icons'
import React from 'react'

interface IUserDetails {
  name: string
  role: string
}
interface IMenuItem {
  icon: React.ReactNode
  iconHover?: React.ReactNode
  label: string
  secondary?: boolean
  onClick: (e: React.MouseEvent) => void
}

interface IProps {
  showMenu: boolean
  userDetails: IUserDetails
  menuItems: IMenuItem[]
  menuCollapse: () => void
}

export default {
  title: 'Components/Interface/ExpandingMenu',
  component: ExpandingMenu,
  argTypes: {
    showMenu: {
      control: {
        type: 'select',
        options: [true, false]
      }
    }
  }
} as Meta

const menuItems = [
  {
    icon: <ApplicationBlack />,
    iconHover: <ApplicationBlue />,
    label: 'Applications',
    onClick: () => alert('on Click Event')
  },
  {
    icon: <StatsBlack />,
    iconHover: <StatsBlue />,
    label: 'Performance',
    onClick: () => alert('on Click Event')
  },
  {
    icon: <SettingsBlack />,
    iconHover: <SettingsBlue />,
    label: 'Settings',
    onClick: () => alert('on Click Event')
  },
  {
    icon: <HelpBlack />,
    iconHover: <HelpBlue />,
    label: 'Help',
    onClick: () => alert('on Click Event')
  },
  {
    icon: <LogoutBlack />,
    iconHover: <LogoutBlue />,
    label: 'Logout',
    secondary: true,
    onClick: () => alert('Logout')
  }
]
const AvatarImage = styled.img`
  border-radius: 50%;
  &.clickable {
    cursor: pointer;
  }
`
const userDetails = { name: 'Yeasin', role: 'Field agent' }
const avatar = (
  <AvatarImage
    width={64}
    height={64}
    src={`https:/eu.ui-avatars.com/api/?name=Yeasin`}
  />
)
const Template: Story<IProps> = () => {
  const [showMenu, setMenu] = useState(false)
  return (
    <>
      <Hamburger onClick={() => setMenu(true)} />
      <ExpandingMenu
        showMenu={showMenu}
        userDetails={userDetails}
        menuItems={menuItems}
        menuCollapse={() => setMenu(false)}
        avatar={avatar}
      />
    </>
  )
}
export const ExpandingMenuView = Template.bind({})
