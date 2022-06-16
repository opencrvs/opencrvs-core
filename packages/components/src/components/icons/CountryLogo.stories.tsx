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
import { CountryLogo } from '.'

export default {
  title: 'Components/icons/CountryLogo',
  component: CountryLogo
} as Meta

const Template: Story<{ size: 'small' | 'medium' }> = (args) => (
  <CountryLogo src="./logo.png" {...args} />
)

export const Default = Template.bind({})

export const Small = Template.bind({})
Small.args = {
  size: 'small'
}
