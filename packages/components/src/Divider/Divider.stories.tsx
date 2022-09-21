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
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { Divider } from './Divider'

export default {
  title: 'Layout/Divider',
  component: Divider
} as ComponentMeta<typeof Divider>

const Template: ComponentStory<typeof Divider> = (args) => <Divider {...args} />

export const Default = Template.bind({})
Default.args = {}
