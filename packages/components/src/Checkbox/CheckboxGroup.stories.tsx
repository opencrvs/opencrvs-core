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
import React, { useState } from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { CheckboxGroup } from './CheckboxGroup'

export default {
  title: 'Input/Checkbox',
  component: CheckboxGroup
} as ComponentMeta<typeof CheckboxGroup>

export const Group: ComponentStory<typeof CheckboxGroup> = (args) => {
  const [selectedItems, setSelectedItems] = useState(['bananas'])

  return (
    <CheckboxGroup
      {...args}
      id="test-checkbox-group1"
      options={[
        {
          label: 'Bananas',
          value: 'bananas'
        },
        {
          label: 'Oranges',
          value: 'oranges'
        }
      ]}
      name="test-checkbox-group1"
      value={selectedItems}
      onChange={(newValue) => setSelectedItems(newValue)}
    />
  )
}

Group.args = {
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
