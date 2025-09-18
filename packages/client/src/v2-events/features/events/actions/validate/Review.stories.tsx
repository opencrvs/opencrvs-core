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
import {
  ActionType,
  createPrng,
  generateActionDocument,
  generateEventDocument,
  generateUuid,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { testDataGenerator } from '@client/tests/test-data-generators'
import * as Validate from './index'

const generator = testDataGenerator()

const meta: Meta<typeof Validate.Review> = {
  title: 'Validate/Review'
}

export default meta

type Story = StoryObj<typeof Validate.Pages>

const actions = [
  generateActionDocument({
    configuration: tennisClubMembershipEvent,
    action: ActionType.CREATE
  }),
  generateActionDocument({
    configuration: tennisClubMembershipEvent,
    action: ActionType.DECLARE,
    defaults: {
      declaration: {
        'applicant.name': {
          firstname: 'Riku',
          surname: 'Rouvila'
        },
        'applicant.dob': '2025-01-23',
        'recommender.name': {
          firstname: 'Euan',
          surname: 'Millar'
        }
      }
    },

    annotation: {
      'review.comment': 'asdasdasdasdasdasd'
    }
  })
]

const prng = createPrng(123123)
const incompleteEventForLocalRegistrar = {
  trackingId: generateUuid(prng),
  type: tennisClubMembershipEvent.id,
  actions,
  createdAt: new Date(Date.now()).toISOString(),
  id: generateUuid(prng),

  updatedAt: new Date(Date.now()).toISOString()
}

export const ReviewForLocalRegistrarIncomplete: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId: incompleteEventForLocalRegistrar.id
      })
    },
    offline: {
      events: [incompleteEventForLocalRegistrar]
    }
  }
}
const eventForlocalRegistrarComplete = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE, ActionType.DECLARE]
})

export const ReviewForLocalRegistrarComplete: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId: eventForlocalRegistrarComplete.id
      })
    },
    offline: {
      events: [eventForlocalRegistrarComplete]
    }
  }
}

const eventForRegistrationAgentComplete = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE, ActionType.DECLARE]
})

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
        eventId: eventForRegistrationAgentComplete.id
      })
    },
    offline: {
      events: [eventForRegistrationAgentComplete]
    }
  }
}

const incompleteEventForRegistrationAgent = {
  trackingId: generateUuid(prng),
  type: tennisClubMembershipEvent.id,
  actions,
  createdAt: new Date(Date.now()).toISOString(),
  id: generateUuid(prng),

  updatedAt: new Date(Date.now()).toISOString()
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
    offline: {
      events: [incompleteEventForRegistrationAgent]
    },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId: incompleteEventForRegistrationAgent.id
      })
    }
  }
}
