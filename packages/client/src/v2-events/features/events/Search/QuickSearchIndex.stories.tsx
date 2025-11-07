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
import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import {
  eventQueryDataGenerator,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { TRPCProvider, AppRouter } from '@client/v2-events/trpc'
import { ROUTES } from '@client/v2-events/routes'
import { QuickSearchIndex } from './QuickSearchIndex'

const meta: Meta<typeof QuickSearchIndex> = {
  title: 'QuickSearchIndex',
  component: QuickSearchIndex,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

export default meta
type Story = StoryObj<typeof QuickSearchIndex>

export const Default: Story = {
  parameters: {
    reactRouter: {
      router: {
        path: ROUTES.V2.SEARCH.buildPath({}),
        element: <QuickSearchIndex />
      },
      initialPath: `${ROUTES.V2.SEARCH.buildPath({})}?keys=Search term`
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.search.query(() => {
            return { total: 1, results: [eventQueryDataGenerator({}, 123123)] }
          }),
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          })
        ]
      }
    }
  }
}
