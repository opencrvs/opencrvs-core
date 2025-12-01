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
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { Option } from '../../../utils'
import { SearchableSelect, SearchableSelectProps } from './SearchableSelect'

const meta: Meta<typeof SearchableSelect> = {
  title: 'SearchableSelect',
  component: SearchableSelect
}

export default meta
const options = [
  {
    label: 'Option 1',
    value: 'option1'
  },
  {
    label: 'Option 2',
    value: 'option2'
  },
  {
    label: 'Option 3',
    value: 'option3'
  }
]

export const WithoutDefaultValue: StoryObj<typeof SearchableSelect> = {
  args: {
    options
  }
}
export const WithDefaultValue: StoryObj<typeof SearchableSelect> = {
  args: {
    options,
    value: options[1]
  }
}

export const WithInternalState: StoryObj<SearchableSelectProps> = {
  args: {
    options: [
      {
        label: 'Option 1',
        value: 'option1'
      },
      {
        label: 'Option 2',
        value: 'option2'
      },
      {
        label: 'Option 3',
        value: 'option3'
      }
    ],
    value: options[0]
  },
  render(args) {
    const [value, setValue] = React.useState<Option | null>(args.value)
    return (
      <SearchableSelect
        id={'123'}
        options={args.options}
        value={value}
        onChange={(option: Option | null) => {
          setValue(option)
        }}
      />
    )
  }
}
