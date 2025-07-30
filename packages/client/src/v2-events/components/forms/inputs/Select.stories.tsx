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
import { TRPCProvider } from '@client/v2-events/trpc'
import { Select } from './Select'

const meta: Meta<typeof Select> = {
  title: 'Inputs/Select',
  component: Select,
  args: {},
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta

export const EmptySelect: StoryObj<typeof Select> = {
  args: {
    value: undefined,
    options: [{ value: '', label: 'Select an option' }]
  }
}

export const ValueWithoutOption: StoryObj<typeof Select> = {
  args: {
    value: 'cat',
    options: [{ value: '', label: 'Select an option' }]
  }
}

export const WithPrimitiveValue: StoryObj<typeof Select> = {
  args: {
    value: 'cat',
    options: [{ value: 'cat', label: 'Primitive Cat is selected' }]
  }
}

export const WithComplexValue: StoryObj<typeof Select> = {
  args: {
    value: {
      filename: 'cat.svg',
      url: 'https://example.com/cat.svg',
      id: '1'
    },
    options: [
      {
        value: {
          filename: 'cat-2.svg',
          url: 'https://example.com/cat-2.svg',
          id: '1'
        },
        label: 'Cat that should not be selected'
      },
      {
        value: {
          filename: 'cat.svg',
          url: 'https://example.com/cat.svg',
          id: '1'
        },
        label: 'Complex Cat is selected'
      }
    ]
  }
}
