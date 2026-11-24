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
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import React from 'react'
import superjson from 'superjson'
import {
  getCurrentEventState,
  tennisClubMembershipEvent,
  TestUserRole
} from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { EventOverviewLayout } from './index'

const meta: Meta<typeof EventOverviewLayout> = {
  title: 'EventOverviewLayout',
  component: EventOverviewLayout,
  parameters: {
    chromatic: { disableSnapshot: true }
  },
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta
type Story = StoryObj<typeof EventOverviewLayout>

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const defaultMswHandlers = {
  events: [
    tRPCMsw.event.search.query(() => ({
      results: [
        getCurrentEventState(
          tennisClubMembershipEventDocument,
          tennisClubMembershipEvent
        )
      ],
      total: 1
    }))
  ],
  drafts: [tRPCMsw.event.draft.list.query(() => [])]
}

/**
 * LOCAL_REGISTRAR has `record.read` scope - Record tab is visible.
 */
export const RecordTabShown: Story = {
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.buildPath({
        eventId: tennisClubMembershipEventDocument.id
      })
    },
    msw: {
      handlers: defaultMswHandlers
    }
  }
}

/**
 * LOCAL_SYSTEM_ADMIN does not have `record.read` scope - Record tab is hidden.
 */
export const RecordTabHidden: Story = {
  parameters: {
    userRole: TestUserRole.enum.LOCAL_SYSTEM_ADMIN,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.buildPath({
        eventId: tennisClubMembershipEventDocument.id
      })
    },
    msw: {
      handlers: defaultMswHandlers
    }
  }
}
