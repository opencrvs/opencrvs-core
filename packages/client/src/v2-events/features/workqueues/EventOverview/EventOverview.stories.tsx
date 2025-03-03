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

import { tennisClueMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { ActionType } from '@opencrvs/commons/client'
import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import React from 'react'
import superjson from 'superjson'
import { EventOverviewIndex } from './EventOverview'

const meta: Meta<typeof EventOverviewIndex> = {
  title: 'Views/Event/Overview',
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const surname = await canvas.findByTestId('applicant.surname')
    await step('active draft values are shown to the user', async () => {
      await expect(surname.textContent).toBe(
        "Applicant's last nameThis value is from a draft"
      )
    })
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.OVERVIEW.buildPath({
        eventId: tennisClueMembershipEventDocument.id
      })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return {
              ...tennisClueMembershipEventDocument,
              actions: tennisClueMembershipEventDocument.actions.filter(
                (action) => action.type !== ActionType.REGISTER
              )
            }
          })
        ],
        drafts: [
          tRPCMsw.event.actions.draft.list.query(() => {
            return [
              {
                eventId: 'c5d9d901-00bf-4631-89dc-89ca5060cb52',
                transactionId: 'da0d54ee-dd89-4643-8953-649de9a0f7b7',
                createdAt: '2025-01-23T05:35:27.689Z',
                action: {
                  id: 'dd2fcd37-6850-47bd-b5fe-2af7c82ae902',
                  createdAt: '2025-01-23T05:35:27.689Z',
                  createdBy: '6798e55cc1fea36ff4f3c74c',
                  data: {
                    'applicant.firstname': 'Riku',
                    'applicant.surname': 'This value is from a draft'
                  },
                  createdAtLocation: 'e8d46ca3-8af3-4326-9140-cf297dc651cc',
                  type: 'REGISTER'
                }
              }
            ]
          })
        ]
      }
    }
  }
}
