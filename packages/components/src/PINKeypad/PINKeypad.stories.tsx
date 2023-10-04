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
import { Meta, ComponentStory } from '@storybook/react'
import { PINKeypad } from './PINKeypad'
import React from 'react'

const Template: ComponentStory<typeof PINKeypad> = (args) => (
  <PINKeypad {...args} />
)
export const PINKeypadView = Template.bind({})
PINKeypadView.args = {
  onComplete: (pin: string) => alert(`The entered PIN is: ${pin}`)
}

export default {
  title: 'Input/PIN entry',
  component: PINKeypad
} as Meta
