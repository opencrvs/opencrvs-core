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
import superjson from 'superjson'
import {
  ActionType,
  generateEventDocument,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import { addLocalEventConfig, setEventData } from '../../useEvents/api'
import * as Request from './index'

const validatedDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [
    { type: ActionType.CREATE },
    { type: ActionType.DECLARE },
    { type: ActionType.VALIDATE }
  ]
})

const meta: Meta<typeof Request.Pages> = {
  title: 'Register',
  beforeEach: () => {
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(validatedDocument.id, validatedDocument)
  }
}

export default meta

type Story = StoryObj<typeof Request.Pages>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

export const Page: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.REGISTER.PAGES.buildPath({
        eventId: validatedDocument.id,
        pageId: 'applicant'
      })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return validatedDocument
          }),
          tRPCMsw.event.search.query(() => {
            return {
              results: [],
              total: 0
            }
          })
        ]
      }
    }
  }
}
export const Review: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.REGISTER.REVIEW.buildPath({
        eventId: validatedDocument.id
      })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return validatedDocument
          }),
          tRPCMsw.event.search.query(() => {
            return {
              results: [],
              total: 0
            }
          })
        ]
      }
    }
  }
}
