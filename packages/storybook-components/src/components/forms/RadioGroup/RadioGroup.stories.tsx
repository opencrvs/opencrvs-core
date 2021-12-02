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
import { RadioGroup, IRadioGroupProps } from './RadioGroup'

export default {
  title: 'Components/forms/RadioGroup',
  component: RadioGroup
} as Meta

const Template: Story<IRadioGroupProps> = args => <RadioGroup {...args} />

export const RadioGroupView = Template.bind({})
RadioGroupView.args = {
  options: [
    {
      label: 'Yes',
      value: '1'
    },
    {
      label: 'No',
      value: '0'
    }
  ],
  name: 'test-radio-group1',
  onChange: value => {
    alert(value)
  },
  value: '1'
}
