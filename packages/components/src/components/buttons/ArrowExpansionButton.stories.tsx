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
import { Story, Meta } from '@storybook/react'
import { ArrowExpansionButton } from './ArrowExpansionButton'
import { IExpansionButtonProps } from './ExpansionButton'

const Template: Story<IExpansionButtonProps> = (args) => (
  <ArrowExpansionButton {...args} />
)

export default {
  title: 'Components/Buttons/ArrowExpansionButton',
  component: ArrowExpansionButton
} as Meta

export const ArrowUp = Template.bind({})
ArrowUp.args = {
  expanded: true
}
export const ArrowDown = Template.bind({})
ArrowDown.args = {
  expanded: false
}
