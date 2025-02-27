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
import { Meta, StoryFn } from '@storybook/react'
import { TRPCClientError } from '@trpc/client'
import { TRPCProvider } from '@client/v2-events/trpc'
import { TRPCErrorBoundary } from '@client/v2-events/routes/TRPCErrorBoundary'

const meta: Meta<typeof TRPCErrorBoundary> = {
  title: 'Components/TRPCErrorBoundary',
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

// Default story: No error, renders children normally
export const Default: StoryFn<typeof TRPCErrorBoundary> = () => (
  <TRPCErrorBoundary>
    <div>
      <h2>Normal Render</h2>
      <p>This content is inside the error boundary and renders correctly.</p>
    </div>
  </TRPCErrorBoundary>
)

// Story that simulates an error
export const WithError: StoryFn<typeof TRPCErrorBoundary> = () => (
  <TRPCErrorBoundary>
    {(() => {
      throw new Error('This is a test error for TRPCErrorBoundary.')
    })()}
  </TRPCErrorBoundary>
)

// Story for 401 Unauthorized Error
export const UnauthorizedError: StoryFn<typeof TRPCErrorBoundary> = () => (
  <TRPCErrorBoundary>
    {(() => {
      ;(() => {
        const error = new TRPCClientError<any>('Unauthorized', {
          meta: {
            response: {
              status: 401,
              statusText: 'Unauthorized'
            }
          }
        })
        throw error
      })()
    })()}
  </TRPCErrorBoundary>
)
