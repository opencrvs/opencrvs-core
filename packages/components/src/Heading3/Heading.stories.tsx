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
import { Heading3 } from './Heading3'

export default {
  title: 'Components/Heading3',
  component: Heading3
}

const Template: Story = (args) => <Heading3 {...args} />

export const Default = Template.bind({})
Default.args = {
  children: 'This is a Heading3'
}
