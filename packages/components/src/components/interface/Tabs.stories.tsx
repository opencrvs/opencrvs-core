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
import { Tabs, Tab, IProps } from './Tabs'
import React from 'react'

export default {
  title: 'Components/Interface/Tabs',
  component: Tabs
} as Meta

const Template: Story<IProps> = () => (
  <Tabs id="Tabs">
    <Tab id="Child" active={true}>
      {' '}
      Child
    </Tab>
    <Tab id="Mother">Mother</Tab>
    <Tab id="Father">Father</Tab>
    <Tab id="Informant" disabled={true}>
      Informant
    </Tab>
    <Tab id="Registration">Registration</Tab>
  </Tabs>
)

export const TabsView = Template.bind({})
