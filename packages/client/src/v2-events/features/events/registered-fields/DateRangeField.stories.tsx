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
import { StoryFn, Meta } from '@storybook/react'
import { DateRangeFieldValue } from '@opencrvs/commons/client'
import { DateRangeField } from './DateRangeField'

// Storybook metadata
export default {
  title: 'Components/DateRangeField',
  component: DateRangeField.Input,
  subcomponents: { Output: DateRangeField.Output },
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    id: { control: 'text' },
    label: { control: 'text' }
  }
} as Meta

// Helper to parse or pass values
const initialExactValue = '2022-05-17'
const initialRangeValue: DateRangeFieldValue = {
  start: '2021-01-01',
  end: '2021-12-31'
}

// Input Story
export const DateRangeInput: StoryFn = (args) => {
  const [value, setValue] = useState<
    | string
    | {
        start: string
        end: string
      }
  >(initialExactValue)

  return (
    <DateRangeField.Input
      {...args}
      id="date-range-field"
      value={value as string}
      onChange={(val) => {
        setValue(val)
      }}
    />
  )
}

// Exact Date Output Story
export const DateRangeOutputExact: StoryFn = () => {
  return <DateRangeField.Output value={initialExactValue} />
}

// Range Date Output Story
export const DateRangeOutputRange: StoryFn = () => {
  return <DateRangeField.Output value={initialRangeValue} />
}
