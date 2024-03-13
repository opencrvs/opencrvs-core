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
import React from 'react'
import { action } from '@storybook/addon-actions'
import { Select } from './Select'

export default {
  title: 'Input/Select',
  component: Select,
  parameters: {
    docs: {
      description: {
        component:
          'Select is used for collecting user selection from a list of options.'
      }
    },
    storyCss: {
      height: '240px'
    }
  }
}

const options = [
  { value: 'birth', label: 'Birth' },
  { value: 'death', label: 'Death' },
  { value: 'marriage', label: 'Marriage' },
  { value: 'adoption', label: 'Adoption' },
  { value: 'divorce', label: 'Divorce', disabled: true }
]

export const Default = () => {
  const [value, setValue] = React.useState('')

  const handleChange = (value: string) => {
    action('Selected value')(value)
    setValue(value)
  }

  return (
    <Select
      id="basic-select"
      options={options}
      onChange={handleChange}
      value={value}
      placeholder="Select"
    />
  )
}
