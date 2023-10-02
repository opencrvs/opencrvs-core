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
import { RadioButton } from './RadioButton'
import React from 'react'

export default {
  title: 'Input/Radio/Radio',
  component: RadioButton
} as Meta

type Value = string | number | boolean

interface IRadioButton {
  id: string
  name: string
  label: string
  value: Value
  selected?: string
  disabled?: boolean
  size?: string
  onChange?: (value: Value) => void
}

const Template: Story<IRadioButton> = (args) => <RadioButton {...args} />

export const RadioSmall = Template.bind({})
RadioSmall.args = {
  name: 'radio-button',
  label: 'Birth',
  value: 'Father',
  id: 'Father',
  selected: 'Father',
  onChange: () => alert('checked')
}

export const RadioLarge = Template.bind({})
RadioLarge.args = {
  name: 'radio-button',
  label: 'Birth',
  value: 'Father',
  size: 'large',
  id: 'Father',
  selected: 'Father',
  onChange: () => alert('checked')
}
