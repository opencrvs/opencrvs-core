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
import { expect, waitFor, within } from '@storybook/test'
import { Outlet } from 'react-router-dom'
import { LoadingBar } from '@opencrvs/components/src/LoadingBar/LoadingBar'
import { TRPCProvider } from '@client/v2-events/trpc'
import { TRPCErrorBoundary } from '@client/v2-events/routes/TRPCErrorBoundary'
import { NavigationHistoryProvider } from '../components/NavigationStack'
import { tennisClubMembershipEventDocument } from '../features/events/fixtures'
import { EventOverviewIndex } from '../features/workqueues/EventOverview/EventOverview'
import { useWorkboxCacheReady } from '../hooks/useWorkboxCacheReady'
import { ROUTES } from './routes'
import { routesConfig } from './config'
import { CacheNotFoundError } from './CacheNotFoundError'

const meta: Meta<typeof CacheNotFoundError> = {
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

type Story = StoryObj<typeof EventOverviewIndex>
export const WorkboxCacheKeyCheck: Story = {
  parameters: {
    reactRouter: {
      router: {
        ...routesConfig,
        Component: () => {
          const cacheReady = useWorkboxCacheReady('fake-key')
          if (cacheReady === null) {
            return <LoadingBar message="Loading Cache..." />
          }

          if (!cacheReady) {
            return <CacheNotFoundError />
          }
          return (
            <NavigationHistoryProvider>
              <Outlet />
            </NavigationHistoryProvider>
          )
        }
      },
      initialPath: ROUTES.V2.EVENTS.VIEW.buildPath({
        eventId: tennisClubMembershipEventDocument.id
      })
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Workbox-Runtime cache key not found error', async () => {
      await expect(
        await canvas.findByText('Loading Cache...')
      ).toBeInTheDocument()
      await waitFor(
        async () => {
          await expect(
            await canvas.findByText(/Application Cache Error/i)
          ).toBeInTheDocument()

          await expect(
            await canvas.findByText(
              /Something went wrong with loading the app\. Reload this page, or log out and log back in to continue\./i
            )
          ).toBeInTheDocument()

          await expect(
            canvas.getByRole('button', { name: 'Reload' })
          ).toBeInTheDocument()

          await expect(
            canvas.getByRole('button', { name: 'Log out' })
          ).toBeInTheDocument()
        },
        { timeout: 6000 }
      )
    })
  }
}
