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
import superjson from 'superjson'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import {
  eventQueryDataGenerator,
  EventStatus,
  generateWorkqueues,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import {
  tennisClubMembershipEventIndex,
  tennisClubMembershipEventDocument
} from '@client/v2-events/features/events/fixtures'
import { WorkqueueIndex } from './index'

const meta: Meta<typeof WorkqueueIndex> = {
  title: 'Workqueue',
  component: WorkqueueIndex,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta
type Story = StoryObj<typeof WorkqueueIndex>

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const queryData = Array.from({ length: 12 }, () => eventQueryDataGenerator())

export const Workqueue: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: 'all' })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          }),
          tRPCMsw.event.list.query(() => {
            return [tennisClubMembershipEventIndex]
          })
        ]
      }
    }
  }
}

export const AllEventsWorkqueueWithPagination: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({
        slug: 'recent'
      })
    },
    parameters: {
      chromatic: { disableSnapshot: true }
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.list.query(() => {
            return queryData
          }),
          tRPCMsw.workqueue.config.list.query(() => {
            return generateWorkqueues('recent')
          }),
          tRPCMsw.workqueue.count.query((input) => {
            return input.reduce((acc, { slug }) => {
              return { ...acc, [slug]: queryData.length }
            }, {})
          }),
          tRPCMsw.event.search.query((input) => {
            return queryData
          })
        ]
      }
    }
  }
}

export const ReadyToPrintWorkqueue: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({
        slug: 'ready-to-print'
      })
    },
    parameters: {
      chromatic: { disableSnapshot: true }
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.list.query(() => {
            return queryData.filter(
              (record) => record.status === EventStatus.REGISTERED
            )
          }),
          tRPCMsw.workqueue.config.list.query(() => {
            return generateWorkqueues('ready-to-print')
          }),
          tRPCMsw.workqueue.count.query((input) => {
            return input.reduce((acc, { slug }) => {
              return {
                ...acc,
                [slug]: queryData.filter(
                  (record) => record.status === EventStatus.REGISTERED
                ).length
              }
            }, {})
          }),
          tRPCMsw.event.search.query((input) => {
            return queryData.filter(
              (record) => record.status === EventStatus.REGISTERED
            )
          })
        ]
      }
    }
  }
}

export const NoResults: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({
        slug: 'recent'
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.list.query(() => {
            return []
          }),
          tRPCMsw.workqueue.config.list.query(() => {
            return generateWorkqueues('recent')
          }),
          tRPCMsw.workqueue.count.query((input) => {
            return input.reduce((acc, { slug }) => {
              return { ...acc, [slug]: 0 }
            }, {})
          }),
          tRPCMsw.event.search.query((input) => {
            return []
          })
        ]
      }
    }
  }
}
