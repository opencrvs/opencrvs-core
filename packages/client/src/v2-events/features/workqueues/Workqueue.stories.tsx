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
import { tennisClubMembershipEvent } from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import {
  tennisClubMembershipEventIndex,
  tennisClubMembershipEventDocument,
  tennisClubMembershipEvents
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
        slug: 'all'
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.list.query(() => {
            return tennisClubMembershipEvents
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
        slug: 'registered'
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.list.query(() => {
            return tennisClubMembershipEvents.filter(
              (record) => record.status === 'REGISTERED'
            )
          })
        ]
      }
    }
  }
}

export const ReadyForReviewWorkqueue: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({
        slug: 'inReview'
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.list.query(() => {
            return tennisClubMembershipEvents.filter(
              (record) => record.status === 'DECLARED'
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
        slug: 'inReview'
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
          })
        ]
      }
    }
  }
}
