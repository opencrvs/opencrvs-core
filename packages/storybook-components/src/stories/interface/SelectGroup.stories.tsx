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
import { Story, Meta } from '@storybook/react'
import { SelectGroup, ISelectGroupProps } from './SelectGroup'

const Template: Story<ISelectGroupProps> = args => <SelectGroup {...args} />
export const SelectGroupView = Template.bind({})
SelectGroupView.args = {
  values: { Filter1: '', Filter2: '', Filter3: '' },
  options: [
    {
      name: 'Filter1',
      value: 'Filter1',
      options: [
        { value: 'chocolate', label: 'Chocolate' },
        { value: 'strawberry', label: 'Strawberry' },
        { value: 'vanilla', label: 'Vanilla' }
      ]
    },
    {
      name: 'Filter2',
      value: 'Filter2',
      options: [
        { value: 'chocolate', label: 'Chocolate' },
        { value: 'strawberry', label: 'Strawberry' },
        { value: 'vanilla', label: 'Vanilla' }
      ]
    },
    {
      name: 'Filter3',
      value: 'Filter3',
      options: [
        { value: 'chocolate', label: 'Chocolate' },
        { value: 'strawberry', label: 'Strawberry' },
        { value: 'vanilla', label: 'Vanilla' }
      ]
    }
  ]
}
export default {
  title: 'Components/Interface/SelectGroup',
  component: SelectGroup
} as Meta
