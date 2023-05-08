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
import { Story } from '@storybook/react'
import {
  NavigationGroupHeader,
  INavigationGroupHeaderProps
} from './NavigationGroupHeader'
import { Expandable } from 'src/icons/Expandable'

const Template: Story<INavigationGroupHeaderProps> = (args) => (
  <NavigationGroupHeader {...args} />
)

export const recordGroup = Template.bind({})

recordGroup.args = {
  label: 'RECORD',
  icon: <Expandable selected={true} />
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Layout/Side navigation/Side navigation item',
  component: NavigationGroupHeader
}
