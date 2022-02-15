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
import React from 'react'

export default {
  title: 'Components/Interface/Header/AppHeader',
  component: AppHeader
} as Meta

interface IMenuAction {
  icon: () => React.ReactNode
  handler: () => void
}
interface IProps {
  desktopRightMenu?: IRightMenu[]
  id?: string
  mobileLeft?: IMenuAction
  title: string
  mobileBody?: JSX.Element
  mobileRight?: IMenuAction
}

const Template: Story<IProps> = (args) => <AppHeader {...args} />
export const AppHeaderView = Template.bind({})
AppHeaderView.args = {
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
