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
import { AppRouter } from '@events/router'
import { userEvent, within } from '@storybook/test'
import {
  ActionType,
  createPrng,
  generateActionDocument,
  generateUuid,
  tennisClubMembershipEvent,
  generateTrackingId,
  ActionDocument
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { ReviewDuplicateIndex } from './ReviewDuplicate'

const meta: Meta<typeof ReviewDuplicateIndex> = {
  title: 'Duplicate/Review'
}

export default meta

type Story = StoryObj<typeof ReviewDuplicateIndex>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const prng = createPrng(123123)
const duplicates = [
  {
    id: generateUuid(prng),
    trackingId: generateTrackingId(prng)
  }
]
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
        },
        'applicant.address': {
          country: 'FAR',
          addressType: 'DOMESTIC',
          streetLevelDetails: {
            town: 'Example Town',
            residentialArea: 'Example Residential Area',
            street: 'Example Street',
            number: '55',
            zipCode: '123456',
            state: 'Example State',
            district2: 'Example District 2'
          }
        },
        'recommender.none': true
      },
      annotation: {
        'review.comment': 'asdasdasdasdasdasd'
      }
    }
  }),
  generateActionDocument({
    configuration: tennisClubMembershipEvent,
    action: ActionType.DUPLICATE_DETECTED,
    defaults: {
      content: {
        duplicates
      }
    }
  })
]
const markNotDuplicateAction = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.MARK_AS_NOT_DUPLICATE
}) satisfies ActionDocument

const mockOriginalEvent = {
  trackingId: generateTrackingId(prng),
  type: tennisClubMembershipEvent.id,
  actions,
  createdAt: new Date(Date.now()).toISOString(),
  id: generateUuid(prng),

  updatedAt: new Date(Date.now()).toISOString()
}

const mockDuplicateEvent = {
  trackingId: duplicates[0].trackingId,
  type: tennisClubMembershipEvent.id,
  actions: actions.slice(0, 2),
  createdAt: new Date(Date.now()).toISOString(),
  id: duplicates[0].id,
  updatedAt: new Date(Date.now()).toISOString()
}

export const MarkAsNotDuplucateAndRegister: Story = {
  parameters: {
    mockingDate: new Date(),
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.REVIEW_POTENTIAL_DUPLICATE.buildPath({
        eventId: mockOriginalEvent.id
      })
    },
    chromatic: { disableSnapshot: true },
    offline: {
      events: [mockOriginalEvent, mockDuplicateEvent]
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.actions.duplicate.markNotDuplicate.mutation(() => ({
            ...mockOriginalEvent,
            actions: [...actions, markNotDuplicateAction]
          }))
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Mark as not duplicate', async () => {
      await userEvent.click(
        await canvas.findByRole('button', {
          name: /Not a duplicate/i
        })
      )
      await userEvent.click(
        await canvas.findByRole('button', {
          name: /Confirm/i
        })
      )
    })

    await step(' Register', async () => {
      await userEvent.click(
        await canvas.findByRole('button', {
          name: /Register/i
        })
      )
      const confirmModal = within(await canvas.findByRole('dialog'))

      await userEvent.click(
        await confirmModal.findByRole('button', {
          name: /Register/i
        })
      )
    })
  }
}
