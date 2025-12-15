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
import { graphql, HttpResponse } from 'msw'
import superjson from 'superjson'
import {
  ActionType,
  generateEventDocument,
  generateEventDraftDocument,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { Review } from './index'

const generator = testDataGenerator()

const eventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [{ type: ActionType.CREATE }, { type: ActionType.DECLARE }]
})

const eventId = eventDocument.id

const meta: Meta<typeof Review> = {
  title: 'Edit',
  parameters: { offline: { events: [eventDocument] } }
}

export default meta

type Story = StoryObj<typeof Review>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const draft = generateEventDraftDocument({
  eventId,
  actionType: ActionType.REGISTER
})

const mockUser = generator.user.fieldAgent().v2

export const ReviewForLocalRegistrarComplete: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EDIT.REVIEW.buildPath({
        eventId
      })
    },
    offline: {
      drafts: [draft]
    },
    msw: {
      handlers: {
        drafts: [
          tRPCMsw.event.draft.list.query(() => {
            return [draft]
          })
        ],
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          })
        ],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.localRegistrar().v1
              }
            })
          }),
          tRPCMsw.user.list.query(() => {
            return [mockUser]
          }),
          tRPCMsw.user.get.query(() => {
            return mockUser
          })
        ]
      }
    }
  }
}
