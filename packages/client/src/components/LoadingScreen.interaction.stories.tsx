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
import { delay, http } from 'msw'
import { expect, waitFor, within } from 'storybook/test'

const COUNTRY_LOGO_URL = '/api/countryconfig/content/country-logo'

const meta: Meta = {
  title: 'LoadingScreen/Interaction',
  parameters: {
    chromatic: { disableSnapshot: true }
  }
}

export default meta

type Story = StoryObj

export const ShowsCountryLogo: Story = {
  render: () => <div>Application</div>,
  parameters: {
    msw: {
      handlers: {
        // The decorator wraps each story in Page. Page shows the loading screen until the offline data loads.
        config: [
          http.get('/api/config', async () => {
            await delay('infinite')
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('The client shows the loading screen', async () => {
      await canvas.findByText('Loading records...')
      await expect(canvas.queryByText('Application')).not.toBeInTheDocument()
    })

    await step('The loading screen shows the country logo', async () => {
      const logo = await canvas.findByRole<HTMLImageElement>('img')

      await expect(logo).toHaveAttribute('src', COUNTRY_LOGO_URL)
      await waitFor(async () => expect(logo.naturalWidth).toBeGreaterThan(0))
    })
  }
}
