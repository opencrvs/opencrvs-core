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
import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import { expect, waitFor, within } from 'storybook/test'
import { noop } from 'lodash'
import { LocationPicker } from './LocationPicker'
import { TRPCProvider } from '../v2-events/trpc'

const LONG_LOCATION_ID = 'long-location-id'
const LONG_LOCATION_LABEL =
  'HQ Office of PSA, PSA HQ, Quezon City, Metro Manila (Second District), National Capital Region (NCR)'

const meta: Meta<typeof LocationPicker> = {
  title: 'LocationPicker/Interaction',
  component: LocationPicker,
  args: {
    onChangeLocation: noop,
    selectedLocationId: LONG_LOCATION_ID,
    additionalLocations: [
      {
        id: LONG_LOCATION_ID,
        searchableText: LONG_LOCATION_LABEL,
        displayLabel: LONG_LOCATION_LABEL
      }
    ]
  },
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ],
  parameters: {
    chromatic: { disableSnapshot: true }
  }
}

export default meta

type Story = StoryObj<typeof LocationPicker>

// Regression test for a long location name overlapping neighbouring UI.
export const LongLocationNameTruncatesWithEllipsis: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Wait for the picker to resolve its suspended location queries.
    const label = await canvas.findByText(LONG_LOCATION_LABEL)

    // title attr is what drives the native hover tooltip; can't assert the tooltip itself.
    await expect(label).toHaveAttribute('title', LONG_LOCATION_LABEL)

    // Must actually be clipped, not just styled to allow it.
    await waitFor(() => {
      expect(label.scrollWidth).toBeGreaterThan(label.clientWidth)
    })

    const style = getComputedStyle(label)
    await expect(style.textOverflow).toBe('ellipsis')
    await expect(style.whiteSpace).toBe('nowrap')
  }
}
