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
import { ExpandingMenu, IProps } from './ExpandingMenu'
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
const userDetails = { name: 'Yeasin', role: 'Field agent' }

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
      />
    </>
  )
}
export const ExpandingMenuView = Template.bind({})
