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
import { CheckboxGroup, ICheckboxGroup } from './CheckboxGroup'

export default {
  title: 'Components/forms/CheckboxGrup',
  component: CheckboxGroup
} as Meta

const Template: Story<ICheckboxGroup> = args => <CheckboxGroup {...args} />

export const CheckboxGroupView = Template.bind({})
CheckboxGroupView.args = {
  options: [
    {
      label: 'Bananas',
      value: 'bananas'
    },
    {
      label: 'Oranges',
      value: 'oranges'
    }
  ],
  name: 'test-checkbox-group1',
  value: ['bananas']
}
