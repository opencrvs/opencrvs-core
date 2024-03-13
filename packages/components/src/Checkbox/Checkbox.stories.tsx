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
import React, { useState } from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { Checkbox } from './Checkbox'

export default {
  title: 'Input/Checkbox',
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component:
          'Checkboxes allow the user to select one or more items from a set.'
      }
    }
  }
} as ComponentMeta<typeof Checkbox>

export const Default: ComponentStory<typeof Checkbox> = (args) => {
  const [isChecked, setChecked] = useState(false)

  return (
    <Checkbox
      {...args}
      id="default-checkbox"
      selected={isChecked}
      onChange={() => setChecked(!isChecked)}
    />
  )
}
Default.args = {
  name: 'CRVS options',
  label: 'The gold standard for digital civil registration',
  value: 'The gold standard for digital civil registration',
  selected: true,
  size: 'small'
}
