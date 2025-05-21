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
  ActionType,
  generateEventDraftDocument,
  ActionStatus,
  getUUID
} from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { EventOverviewIndex } from './EventOverview'

const meta: Meta<typeof EventOverviewIndex> = {
  title: 'EventOverview',
  component: EventOverviewIndex,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta
type Story = StoryObj<typeof EventOverviewIndex>

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

export const Overview: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.OVERVIEW.buildPath({
        eventId: tennisClubMembershipEventDocument.id
      })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return {
              ...tennisClubMembershipEventDocument,
              actions: tennisClubMembershipEventDocument.actions.filter(
                (action) => action.type !== ActionType.REGISTER
              )
            }
          })
        ],
        drafts: [
          tRPCMsw.event.draft.list.query(() => {
            return [
              generateEventDraftDocument(
                tennisClubMembershipEventDocument.id,
                ActionType.REGISTER,
                {
                  'applicant.firstname': 'Riku',
                  'applicant.surname': 'This value is from a draft'
                }
              )
            ]
          })
        ]
      }
    }
  }
}

export const WithAcceptedRegisterEvent: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.OVERVIEW.buildPath({
        eventId: tennisClubMembershipEventDocument.id
      })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          })
        ],
        drafts: [
          tRPCMsw.event.draft.list.query(() => {
            return [
              generateEventDraftDocument(
                tennisClubMembershipEventDocument.id,
                ActionType.REGISTER,
                {
                  'applicant.firstname': 'Riku',
                  'applicant.surname': 'This value is from a draft'
                }
              )
            ]
          })
        ]
      }
    }
  }
}

export const WithRejectedAction: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.OVERVIEW.buildPath({
        eventId: tennisClubMembershipEventDocument.id
      })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return {
              ...tennisClubMembershipEventDocument,
              actions: tennisClubMembershipEventDocument.actions.concat([
                {
                  type: ActionType.ARCHIVE,
                  status: ActionStatus.Rejected,
                  id: getUUID(),
                  transactionId: getUUID(),
                  createdAt: new Date().toISOString(),
                  createdBy: '123',
                  createdAtLocation: '123',
                  createdByRole: 'LOCAL_REGISTRAR'
                }
              ])
            }
          })
        ],
        drafts: [
          tRPCMsw.event.draft.list.query(() => {
            return [
              generateEventDraftDocument(
                tennisClubMembershipEventDocument.id,
                ActionType.REGISTER,
                {
                  'applicant.firstname': 'Riku',
                  'applicant.surname': 'This value is from a draft'
                }
              )
            ]
          })
        ]
      }
    }
  }
}
