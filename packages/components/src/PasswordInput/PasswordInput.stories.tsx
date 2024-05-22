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

import React from 'react'
import { Meta, Story } from '@storybook/react'
import { PasswordInput, PasswordInputProps } from './PasswordInput'

export default {
  title: 'Input/PasswordInput',
  component: PasswordInput,
  argTypes: {}
} as Meta

const Template: Story<PasswordInputProps> = (args) => (
  <PasswordInput {...args} />
)

export const Default = Template.bind({})
Default.args = {}
