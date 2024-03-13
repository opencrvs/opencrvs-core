/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { Meta, Story } from '@storybook/react'
import { Box, IBox } from './Box'
import React from 'react'

const Template: Story<IBox> = (args) => <Box {...args}>A 6 columns box</Box>
export const BoxView = Template.bind({})
BoxView.args = {
  id: 'Box',
  children: 6
}

export default {
  title: 'Layout/Box',
  component: Box
} as Meta
