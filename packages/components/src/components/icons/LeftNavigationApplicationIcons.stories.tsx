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
import React from 'react'
import { Meta, Story } from '@storybook/react'
import { LeftNavigationApplicationIcons } from './LeftNavigationApplicationIcons'

const Template: Story<React.HTMLAttributes<SVGElement>> = (args) => (
  <LeftNavigationApplicationIcons {...args} />
)

export const LeftNavigationIconView = Template.bind({})

LeftNavigationIconView.args = {
  color: 'red'
}

export default {
  title: 'Components/icons/LeftNavigationApplicationIcon',
  component: LeftNavigationApplicationIcons
} as Meta
