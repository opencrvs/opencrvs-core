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
import { PINKeypad } from './PINKeypad'
import React from 'react'

interface IProps {
  id?: string
  onComplete: (pin: string) => void
  forgotPinComponent?: React.ReactNode
  pin?: string
  ref?: any
}

const Template: Story<IProps> = (args) => <PINKeypad {...args} />
export const PINKeypadView = Template.bind({})
PINKeypadView.args = {
  onComplete: (pin: string) => alert(`The entered PIN is: ${pin}`)
}

export default {
  title: 'Components/Interface/PINKeypad',
  component: PINKeypad
} as Meta
