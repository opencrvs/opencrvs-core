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
import { testDataGenerator } from '@client/tests/test-data-generators'
import { LocationPicker } from './LocationPicker'
import { TRPCProvider } from '../v2-events/trpc'
import { noop } from 'lodash'
import {
  V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS,
  V2_DEFAULT_MOCK_LOCATIONS
} from '../tests/v2-events/administrative-hierarchy-mock'

const generator = testDataGenerator()

const meta: Meta<typeof LocationPicker> = {
  title: 'LocationPicker',
  component: LocationPicker,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta

type Story = StoryObj<typeof LocationPicker>

export const WithSelectedLocation: Story = {
  args: {
    onChangeLocation: noop,
    selectedLocationId: V2_DEFAULT_MOCK_LOCATIONS[0].id
  }
}

export const WithSelectedAdministrativeArea: Story = {
  args: {
    onChangeLocation: noop,
    selectedLocationId: V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS[0].id
  }
}
