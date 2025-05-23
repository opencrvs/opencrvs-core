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
import { Meta, StoryObj } from '@storybook/react'
import { userEvent, within, expect, waitFor } from '@storybook/test'

import React from 'react'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { tennisClubMembershipEvent } from '@opencrvs/commons/client'
import { TRPCProvider, AppRouter } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { createDeclarationTrpcMsw } from '@client/tests/v2-events/declaration.utils'
import { AdvancedSearch } from './index'

const meta: Meta<typeof AdvancedSearch> = {
  title: 'AdvancedSearch/Interaction',
  component: AdvancedSearch,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

export default meta
type Story = StoryObj<typeof AdvancedSearch>
const declarationTrpcMsw = createDeclarationTrpcMsw(tRPCMsw)

export const AdvancedSearchStory: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.ADVANCED_SEARCH.buildPath({})
    },
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        events: declarationTrpcMsw.events.handlers,
        search: declarationTrpcMsw.search.handlers
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Opens up advanced tennis club membership tab', async () => {
      await waitFor(async () => {
        // await canvas.findByText('Advanced Search')
        await canvas.findByText('Tennis club membership application')
      })
    })

    await step(
      'Finds search sections and opens up registration details',
      async () => {
        await canvas.findByText('Registration details')
        await canvas.findByText("Applicant's details")
        await canvas.findByText("Recommender's details")

        const registrationAccordion = await canvas.findByTestId(
          'accordion-v2.advancedSearch.form.registrationDetails'
        )
        await userEvent.click(
          await within(registrationAccordion).findByRole('button', {
            name: 'Show'
          })
        )
      }
    )

    await step(
      'Search button should be disabled when less than 2 field is not filled or there are search field errors',
      async () => {
        const searchButton = (
          await canvas.findAllByRole('button', {
            name: 'Search'
          })
        ).find((x) => x.id === 'search')

        await expect(searchButton).toBeVisible()
        await expect(searchButton).toBeDisabled()
      }
    )

    await step(
      'Should be able to fill up Place of registration and Status of record and go to search page',
      async () => {
        const searchButton = (
          await canvas.findAllByRole('button', {
            name: 'Search'
          })
        ).find((x) => x.id === 'search')
        await expect(searchButton).toBeVisible()

        const placeOfRegistration = await canvas.findByTestId(
          'event____legalStatus____REGISTERED____createdAtLocation'
        )
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve({})
          }, 1 * 1000)
        })
        await userEvent.type(placeOfRegistration, 'Ibombo', {
          delay: 100
        })
        const placeOption = await canvas.findAllByText('Ibombo District Office')
        await userEvent.click(placeOption[0])
        await expect(searchButton).toBeDisabled()

        const eventStatusContainer = await canvas.findByTestId(
          'select__event____status'
        )
        const eventStatusInput =
          await within(eventStatusContainer).findByRole('textbox')

        await userEvent.click(eventStatusInput)
        const anyStatusOption = await canvas.findAllByText('Any status')
        await userEvent.click(anyStatusOption[0])
        await expect(searchButton).toBeEnabled()

        if (searchButton) {
          await userEvent.click(searchButton)
        }
      }
    )
  }
}
