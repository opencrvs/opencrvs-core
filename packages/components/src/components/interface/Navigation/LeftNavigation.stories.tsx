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
import { LeftNavigation, ILeftNavigationProps } from './LeftNavigation'
import { NavigationGroup } from './NavigationGroup'
import { groupApplication, groupSetting } from './NavigationGroup.stories'

const Template: Story<ILeftNavigationProps> = (args) => (
  <LeftNavigation {...args}>
    <NavigationGroup {...groupApplication.args} />
    <NavigationGroup {...groupSetting.args} />
  </LeftNavigation>
)

export const leftNavigationView = Template.bind({})

leftNavigationView.args = {
  applicationName: 'Bangladesh CRVS'
}

export default {
  title: 'Components/Interface/Navigation',
  component: LeftNavigation
} as Meta
