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
import { Banner, IBannerProps } from './Banner'
import { Box } from './Box'
import React from 'react'

const Template: Story<IBannerProps> = (args) => (
  <Banner {...args}>
    <Box>
      <h3>Children elements will go here</h3>
    </Box>
  </Banner>
)
export const BannerView = Template.bind({})
BannerView.args = {
  count: 15,
  text: 'Applications to register in your area'
}

export default {
  title: 'Components/Interface/Banner',
  component: Banner
} as Meta
