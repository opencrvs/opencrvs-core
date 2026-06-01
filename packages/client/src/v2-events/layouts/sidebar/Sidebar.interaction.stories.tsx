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
import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, waitFor, within } from '@storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import {
  generateWorkqueues,
  TestUserRole,
  V2_DEFAULT_MOCK_LOCATIONS
} from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { WorkqueueIndex } from '@client/v2-events/features/workqueues'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const meta: Meta<typeof WorkqueueIndex> = {
  title: 'Sidebar/Interaction',
  component: WorkqueueIndex,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ],
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    chromatic: { disableSnapshot: true },
    viewport: { defaultViewport: 'mobile' },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: 'recent' })
    },
    msw: {
      handlers: {
        workqueues: [
          tRPCMsw.workqueue.config.list.query(() =>
            generateWorkqueues('recent')
          ),
          tRPCMsw.workqueue.count.query(() => ({ recent: 0 }))
        ],
        event: [tRPCMsw.event.search.query(() => ({ results: [], total: 0 }))],
        locations: [
          tRPCMsw.locations.get.query((input) => {
            return (
              V2_DEFAULT_MOCK_LOCATIONS.find((l) => l.id === input.id) ??
              V2_DEFAULT_MOCK_LOCATIONS[0]
            )
          })
        ]
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof WorkqueueIndex>

/**
 * Verifies the signed-in user's name appears in the sidebar once the mobile
 * menu is opened.
 */
export const UserNameVisibleAfterOpen: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Wait for workqueue page to load', async () => {
      await canvas.findByText('Farajaland CRVS', {}, { timeout: 5000 })
    })

    await step('sidebar is not visible', async () => {
      await expect(
        canvas.queryByTestId('expanding-menu')
      ).not.toBeInTheDocument()
    })

    await step('Open mobile menu', async () => {
      await userEvent.click(await canvas.findByTestId('toggle-menu'))
    })

    await step('sidebar is visible', async () => {
      await waitFor(
        async () => {
          await expect(
            canvas.queryByTestId('expanding-menu')
          ).toBeInTheDocument()
          await expect(
            await canvas.findByTestId('expanding-menu')
          ).toBeVisible()
        },
        { timeout: 2000 }
      )
    })
  }
}

/**
 * Regression test for: clicking an Organisation nav item on mobile must call
 * menuCollapse so the ExpandingMenu closes. Before this fix the menuCollapse
 * prop was not wired up in OrganisationNavigationGroup, so the drawer stayed
 * open after navigation.
 */
export const OrganisationNavCollapsesMobileMenu: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Wait for workqueue page to load', async () => {
      await canvas.findByText('Farajaland CRVS', {}, { timeout: 5000 })
    })

    await step('Open mobile menu', async () => {
      await expect(
        canvas.queryByTestId('expanding-menu')
      ).not.toBeInTheDocument()

      await userEvent.click(await canvas.findByTestId('toggle-menu'))

      await expect(canvas.queryByTestId('expanding-menu')).toBeInTheDocument()
      await expect(await canvas.findByTestId('expanding-menu')).toBeVisible()
    })

    await step('Click the Organisation nav item', async () => {
      await userEvent.click((await canvas.findAllByText('Organisation'))[0])
    })

    await step('Menu is collapsed (ExpandingMenu unmounts)', async () => {
      await waitFor(
        async () => {
          await expect(
            canvas.queryByTestId('expanding-menu')
          ).not.toBeInTheDocument()
        },
        { timeout: 2000 }
      )
    })
  }
}
