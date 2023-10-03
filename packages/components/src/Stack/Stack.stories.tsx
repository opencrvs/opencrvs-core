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
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { Stack } from './Stack'
import { Pill } from '../Pill'

export default {
  title: 'Layout/Stack',
  component: Stack
} as ComponentMeta<typeof Stack>

const Template: ComponentStory<typeof Stack> = (args) => (
  <Stack {...args}>
    <Pill label="Default" type="default" />
    <Pill label="Active" type="active" />
    <Pill label="Pending" type="pending" />
  </Stack>
)

export const Default = Template.bind({})
Default.args = {
  direction: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: 8,
  wrap: false
}

export const Vertical = Template.bind({})
Vertical.args = {
  direction: 'column',
  alignItems: 'flex-start'
}

const HugeTemplate: ComponentStory<typeof Stack> = (args) => (
  <Stack {...args}>
    {Array.from({ length: 30 }, (_, i) => (
      <Pill label={`Label ${i + 1}`} />
    ))}
  </Stack>
)

export const HorizontalWrapping = HugeTemplate.bind({})
HorizontalWrapping.args = {
  wrap: true
}
