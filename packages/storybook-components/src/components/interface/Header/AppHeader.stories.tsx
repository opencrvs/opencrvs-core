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
import { Hamburger, SearchDark } from '../../icons'
import { AppHeader } from './AppHeader'
import { IRightMenu } from './Desktop/DesktopHeader'
import { IMenuItem } from './Desktop/Menu'

export default {
  title: 'Components/Interface/Header/AppHeader',
  component: AppHeader
} as Meta

interface IMenuAction {
  icon: () => React.ReactNode
  handler: () => void
}
interface IProps {
  menuItems: IMenuItem[]
  desktopRightMenu?: IRightMenu[]
  id?: string
  mobileLeft?: IMenuAction
  title: string
  mobileBody?: JSX.Element
  mobileRight?: IMenuAction
}

const menuItems = [
  {
    key: 'application',
    title: 'Application',
    selected: true,
    onClick: () => alert('application')
  },
  {
    key: 'performance',
    title: 'Performance',
    selected: false,
    onClick: () => alert('performance')
  }
]

const Template: Story<IProps> = args => <AppHeader {...args} />
export const AppHeaderView = Template.bind({})
AppHeaderView.args = {
  menuItems: menuItems,
  id: 'register_app_header',
  mobileLeft: {
    icon: () => <Hamburger />,
    handler: () => alert('left menu clicked')
  },
  title: 'Mobile header',
  mobileRight: {
    icon: () => <SearchDark />,
    handler: () => alert('right menu clicked')
  }
}
