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
import { LocationSearch } from './LocationSearch'

const meta: Meta<typeof LocationSearch.Output> = {
  title: 'Inputs/LocationSearch',
  component: LocationSearch.Output,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta

const healthFacilityLocationId = '465c448a-2c85-45f5-80f0-967e91f51de9'
export const LocationSearchOutput: StoryObj<typeof LocationSearch.Output> = {
  args: {
    value: ''
  }
}

export const LocationSearchOutputResolved: StoryObj<
  typeof LocationSearch.Output
> = {
  args: {
    value: healthFacilityLocationId
  }
}
