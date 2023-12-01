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
import { Pill, IPillProps } from './Pill'
import React from 'react'
import { Stack } from '../Stack'

const Template: Story<IPillProps> = (args) => {
  return (
    <Stack>
      <Pill {...args} />
      <Pill {...args} size="medium" />
    </Stack>
  )
}

export default {
  title: 'Data/Pill',
  component: Pill,
  parameters: {
    docs: {
      description: {
        component: 'Pill helps label, organize and categorize items.'
      }
    }
  }
} as Meta

export const Default = Template.bind({})
Default.args = {
  label: 'Default'
}

export const Active = Template.bind({})
Active.args = {
  label: 'Active',
  type: 'active'
}

export const Pending = Template.bind({})
Pending.args = {
  label: 'Pending',
  type: 'pending'
}

export const Inactive = Template.bind({})
Inactive.args = {
  label: 'Inactive',
  type: 'inactive'
}
