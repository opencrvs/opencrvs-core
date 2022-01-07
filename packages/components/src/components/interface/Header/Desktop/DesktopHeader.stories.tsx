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
import { DesktopHeader, IDesktopHeaderProps } from './DesktopHeader'
import React from 'react'

export default {
  title: 'Components/Interface/Header/Desktop/DesktopHeader',
  component: DesktopHeader
} as Meta

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

const Template: Story<IDesktopHeaderProps> = (args) => (
  <DesktopHeader {...args} />
)
export const DesktopHeaderView = Template.bind({})
DesktopHeaderView.args = {
  menuItems
}
