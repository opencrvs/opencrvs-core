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
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { AppRouter } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import * as Validate from './index'

const generator = testDataGenerator()

const meta: Meta<typeof Validate.Review> = {
  title: 'Validate/Review'
}

export default meta

type Story = StoryObj<typeof Validate.Pages>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

export const ReviewForLocalRegistrarIncomplete: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId: tennisClubMembershipEventDocument.id
      })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          }),
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          })
        ]
      }
    }
  }
}

export const ReviewForLocalRegistrarComplete: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId: tennisClubMembershipEventDocument.id
      })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return generateEventDocument({
              configuration: tennisClubMembershipEvent,
              actions: [
                ActionType.CREATE,
                ActionType.DECLARE,
                ActionType.VALIDATE
              ]
            })
          }),
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          })
        ]
      }
    }
  }
}

export const ReviewForRegistrationAgentComplete: Story = {
  loaders: [
    async () => {
      window.localStorage.setItem(
        'opencrvs',
        generator.user.token.registrationAgent
      )

      //  Intermittent failures starts to happen when global state gets out of whack.
      // // This is a workaround to ensure that the state is reset when similar tests are run in parallel.
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  ],
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId: tennisClubMembershipEventDocument.id
      })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return generateEventDocument({
              configuration: tennisClubMembershipEvent,
              actions: [
                ActionType.CREATE,
                ActionType.DECLARE,
                ActionType.VALIDATE
              ]
            })
          }),
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          })
        ]
      }
    }
  }
}

export const ReviewForRegistrationAgentIncomplete: Story = {
  loaders: [
    async () => {
      window.localStorage.setItem(
        'opencrvs',
        generator.user.token.registrationAgent
      )
      //  Intermittent failures starts to happen when global state gets out of whack.
      // // This is a workaround to ensure that the state is reset when similar tests are run in parallel.
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  ],
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId: tennisClubMembershipEventDocument.id
      })
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          }),
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          })
        ]
      }
    }
  }
}
