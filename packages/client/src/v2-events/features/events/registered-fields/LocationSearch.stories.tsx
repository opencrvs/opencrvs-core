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
import { within, expect, fn } from '@storybook/test'
import { userEvent } from '@storybook/testing-library'
import { TRPCProvider } from '@client/v2-events/trpc'
import { LocationSearch } from './LocationSearch'

const meta: Meta<typeof LocationSearch.Output> = {
  title: 'Inputs/LocationSearch',
  decorators: [
    (Story) => (
      <TRPCProvider>
        <React.Suspense>
          <Story />
        </React.Suspense>
      </TRPCProvider>
    )
  ]
}

export default meta

export const LocationSearchInput: StoryObj<typeof LocationSearch.Input> = {
  render: (props) => {
    return <LocationSearch.Input {...props} />
  },
  args: {
    id: 'location-search',
    searchableResource: ['locations', 'facilities', 'offices'],
    value: ''
  }
}

export const LocationSearchInputInvalid: StoryObj<typeof LocationSearch.Input> =
  {
    name: 'LocationSearch with invalid value',
    render: (props) => {
      return <LocationSearch.Input {...props} />
    },
    args: {
      id: 'location-search',
      searchableResource: ['locations', 'facilities', 'offices'],
      value: 'abc',
      onChange: fn()
    },
    play: async ({ canvasElement, step, args }) => {
      await step('Modal has scope based on content', async () => {
        const canvas = within(canvasElement)
        const input =
          await canvas.findByTestId<HTMLInputElement>('location-search')

        await userEvent.type(input, 'abc')
        input.blur()

        await expect(args.onChange).toHaveBeenCalled()
        await expect(args.onChange).toHaveBeenCalledWith(undefined)
      })
    }
  }

const healthFacilityLocationId = '4d3279be-d026-420c-88f7-f0a4ae986973' // Ibombo Rural Health Centre ()
export const LocationSearchOutput: StoryObj<typeof LocationSearch.Output> = {
  render: (props) => <LocationSearch.Output {...props} />,
  args: {
    value: ''
  }
}

export const LocationSearchOutputResolved: StoryObj<
  typeof LocationSearch.Output
> = {
  render: (props) => <LocationSearch.Output {...props} />,
  args: {
    value: healthFacilityLocationId
  }
}
