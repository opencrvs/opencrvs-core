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
import { Meta, StoryObj } from '@storybook/react'
import { expect, fn, userEvent, waitFor, within } from '@storybook/test'
import { TRPCProvider } from '../trpc'
import { TRPCErrorBoundary, throwStructuredError } from './TRPCErrorBoundary'
import { ROUTES } from './routes'
import { routesConfig } from './config'

const meta: Meta<typeof TRPCErrorBoundary> = {
  title: 'Components/interaction/TRPCErrorBoundary',
  decorators: [
    (Story) => (
      <TRPCErrorBoundary>
        <TRPCProvider>
          <Story />
        </TRPCProvider>
      </TRPCErrorBoundary>
    )
  ]
}
export default meta

type Story = StoryObj<typeof TRPCErrorBoundary>

export const WithStructuredError: Story = {
  parameters: {
    test: {
      dangerouslyIgnoreUnhandledErrors: true
    },
    chromatic: { disableSnapshot: true }
  },
  render: () => (
    <TRPCErrorBoundary>
      {(() => {
        return throwStructuredError({
          message:
            'This is a structured error message. The redirect button label and redirect path are provided.',
          redirection: {
            label: 'Refresh',
            path: ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({
              slug: 'assigned-to-you'
            })
          }
        })
      })()}
    </TRPCErrorBoundary>
  ),

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      await canvas.findByText(/structured error message/i)
    ).toBeInTheDocument()

    await expect(
      await canvas.findByRole('button', { name: /Refresh/i })
    ).toBeVisible()
  }
}
