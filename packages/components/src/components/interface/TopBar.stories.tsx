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
import { TopBar } from './TopBar'
import React from 'react'

const Template: Story<{ id?: string }> = () => (
  <TopBar>
    <p>Declarations in Progress</p>
    <p>Declarations in review</p>
    <p>Declarations Ready to Print</p>
  </TopBar>
)

export const TopBarView = Template.bind({})

TopBarView.args = {
  id: 'birth'
}

export default {
  title: 'Components/Interface/TopBar',
  component: TopBar
}
