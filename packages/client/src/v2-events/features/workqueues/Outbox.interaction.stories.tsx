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
import { graphql, HttpResponse } from 'msw'
import { userEvent, within, expect, waitFor } from '@storybook/test'
import {
  ActionType,
  tennisClubMembershipEvent,
  generateEventDocument,
  getCurrentEventState,
  footballClubMembershipEvent,
  FullDocumentPath,
  UUID
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { AppRouter } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { wrapHandlersWithSpies } from '@client/tests/v2-events/declaration.utils'
import { ReviewIndex } from '../events/actions/declare/Review'

const generator = testDataGenerator()

const declareEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE, ActionType.DECLARE]
})

const meta: Meta<typeof ReviewIndex> = {
  title: 'Outbox/Interaction',
  beforeEach: () => {
    useEventFormData.setState({
      formValues: getCurrentEventState(
        declareEventDocument,
        tennisClubMembershipEvent
      ).declaration
    })
  }
}

export default meta

const OUTBOX_FREEZE_TIME = 5 * 1000 // 5 seconds

const createdEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE]
})

type Story = StoryObj<typeof ReviewIndex>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const declarationTrpcMsw = {
  events: wrapHandlersWithSpies([
    {
      name: 'event.create',
      procedure: tRPCMsw.event.create.mutation,
      handler: () => createdEventDocument
    },
    {
      name: 'event.actions.declare.request',
      procedure: tRPCMsw.event.actions.declare.request.mutation,
      handler: async () => {
        await new Promise((resolve) => setTimeout(resolve, OUTBOX_FREEZE_TIME))
        return declareEventDocument
      }
    }
  ])
}

const mockUser = {
  id: '67bda93bfc07dee78ae558cf',
  name: [
    {
      use: 'en',
      given: ['Kalusha'],
      family: 'Bwalya'
    }
  ],
  role: 'SOCIAL_WORKER',
  signature: 'signature.png' as FullDocumentPath,
  avatar: undefined,
  primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID
}

export const Outbox: Story = {
  loaders: [
    async () => {
      window.localStorage.setItem('opencrvs', generator.user.token.fieldAgent)

      // Ensure state is stable before seeding the mutation cache
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  ],
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.REVIEW.buildPath({
        eventId: createdEventDocument.id
      })
    },
    chromatic: { disableSnapshot: true },
    offline: {
      events: [createdEventDocument],
      configs: [tennisClubMembershipEvent, footballClubMembershipEvent]
    },
    msw: {
      handlers: {
        events: [...declarationTrpcMsw.events.handlers],
        user: [
          graphql.query('fetchUser', () => {
            return HttpResponse.json({
              data: {
                getUser: generator.user.registrationAgent()
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
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Send for review', async () => {
      const submitButton = await canvas.findByText('Send for review')
      await userEvent.click(submitButton)
      const confirmButton = await canvas.findByText('Confirm')
      await userEvent.click(confirmButton)
      const outboxButton = await canvas.findByTestId(
        'navigation_workqueue_outbox'
      )
      await expect(outboxButton).toHaveTextContent(/^Outbox1$/)

      await userEvent.click(outboxButton)

      const searchResult = await canvas.findByTestId('search-result')
      const { firstname, surname } = getCurrentEventState(
        declareEventDocument,
        tennisClubMembershipEvent
      ).declaration['applicant.name'] as { firstname: string; surname: string }

      await expect(searchResult).toHaveTextContent(`${firstname} ${surname}`)

      await waitFor(
        async () => {
          await expect(searchResult).not.toHaveTextContent(
            `${firstname} ${surname}`
          )
        },
        { timeout: OUTBOX_FREEZE_TIME + 1000 } // Allow some buffer for the freeze time
      )

      const outboxButton2 = await canvas.findByTestId(
        'navigation_workqueue_outbox'
      )
      await expect(outboxButton2).toHaveTextContent(/^Outbox$/)
    })
  }
}
