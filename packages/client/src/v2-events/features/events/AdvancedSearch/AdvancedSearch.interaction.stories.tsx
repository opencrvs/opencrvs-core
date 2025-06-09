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

import React from 'react'
import { Meta, StoryObj } from '@storybook/react'
import { userEvent, within, expect, waitFor } from '@storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'

import { TENNIS_CLUB_MEMBERSHIP } from '@opencrvs/commons/client'
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

export default meta

type Story = StoryObj<typeof AdvancedSearch>

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

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
      await canvas.findByText('Tennis club membership application')
    })

    await step(
      'Finds search sections and opens up registration details',
      async () => {
        await canvas.findByText('Registration details')
        await canvas.findByText("Applicant's details")
        await canvas.findByText("Recommender's details")
      }
    )

    await step(
      'Search button should be disabled with less than 2 fields or errors',
      async () => {
        const searchButton = (
          await canvas.findAllByRole('button', { name: 'Search' })
        ).find((btn) => btn.id === 'search')

        await expect(searchButton).toBeVisible()
        await expect(searchButton).toBeDisabled()
      }
    )

    await step(
      'Fill up Place of registration and Status to enable search',
      async () => {
        const searchButton = (
          await canvas.findAllByRole('button', { name: 'Search' })
        ).find((btn) => btn.id === 'search')

        const registrationAccordion = await canvas.findByTestId(
          'accordion-v2.advancedSearch.form.registrationDetails'
        )
        await userEvent.click(
          await within(registrationAccordion).findByRole('button', {
            name: 'Show'
          })
        )

        const placeInput = await canvas.findByTestId(
          'event____legalStatus____REGISTERED____createdAtLocation'
        )
        await userEvent.type(placeInput, 'Ibombo', { delay: 100 })
        const placeOption = await canvas.findAllByText('Ibombo District Office')
        await userEvent.click(placeOption[0])
        await expect(searchButton).toBeDisabled()

        const statusContainer = await canvas.findByTestId(
          'select__event____status'
        )
        const statusInput = await within(statusContainer).findByRole('textbox')
        await userEvent.click(statusInput)
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

export const AdvancedSearchTabsBehaviour: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: `${ROUTES.V2.ADVANCED_SEARCH.buildPath({})}?applicant.firstname=Nina&applicant.surname=Roy&event.legalStatus.REGISTERED.createdAt=2024-06-01&event.legalStatus.REGISTERED.createdAt=2025-06-30&event.legalStatus.REGISTERED.createdAtLocation=028d2c85-ca31-426d-b5d1-2cef545a4902&event.status=ALL&event.updatedAt=2025-05-03%2C2025-06-03&eventType=${TENNIS_CLUB_MEMBERSHIP}&recommender.firstname=Annina`
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

    const checkRegistrationDetails = async (
      canvasRef: ReturnType<typeof within>
    ) => {
      await waitFor(async () => {
        await canvasRef.findByText('Tennis club membership application')
      })

      const accordion = await canvasRef.findByTestId(
        'accordion-v2.advancedSearch.form.registrationDetails'
      )

      await within(accordion).findByRole('button', { name: 'Hide' })
      await expect(
        await canvasRef.findByTestId(
          'event____legalStatus____REGISTERED____createdAtLocation'
        )
      ).toHaveValue('Ibombo District Office')

      await within(accordion).findByText('June 2024 to June 2025')
      await within(accordion).findByText('Any status')
    }

    await step(
      'Prepopulate Registration details from URL and toggle accordion',
      async () => {
        await checkRegistrationDetails(canvas)

        const accordion = await canvas.findByTestId(
          'accordion-v2.advancedSearch.form.registrationDetails'
        )
        const toggle = await within(accordion).findByRole('button', {
          name: 'Hide'
        })
        await userEvent.click(toggle)
        await userEvent.click(
          await within(accordion).findByRole('button', { name: 'Show' })
        )
        await checkRegistrationDetails(canvas)
      }
    )

    const checkApplicantDetails = async () => {
      const accordion = await canvas.findByTestId(
        'accordion-v2.event.tennis-club-membership.search.applicants'
      )
      await within(accordion).findByRole('button', { name: 'Hide' })
      await expect(
        await canvas.findByTestId('text__applicant____firstname')
      ).toHaveValue('Nina')
      await expect(
        await canvas.findByTestId('text__applicant____surname')
      ).toHaveValue('Roy')
    }

    await step("Prepopulate Applicant's details from URL", async () => {
      await checkApplicantDetails()
    })

    const checkRecommenderDetails = async () => {
      const accordion = await canvas.findByTestId(
        'accordion-v2.event.tennis-club-membership.search.recommender'
      )
      await within(accordion).findByRole('button', { name: 'Hide' })
      await expect(
        await canvas.findByTestId('text__recommender____firstname')
      ).toHaveValue('Annina')
      await expect(
        await canvas.findByTestId('text__recommender____surname')
      ).toHaveValue('')
    }

    await step("Prepopulate Recommender's details from URL", async () => {
      await checkRecommenderDetails()
    })

    const fillRegisterLocation = async () => {
      const accordion = await canvas.findByTestId(
        'accordion-v2.advancedSearch.form.registrationDetails'
      )
      await userEvent.click(
        await within(accordion).findByRole('button', { name: 'Show' })
      )
      const placeInput = await canvas.findByTestId(
        'event____legalStatus____REGISTERED____createdAtLocation'
      )
      await userEvent.type(placeInput, 'Ibombo', { delay: 100 })
      const option = await canvas.findAllByText('Ibombo District Office')
      await userEvent.click(option[0])
    }

    const checkRegisterLocation = async () => {
      const accordion = await canvas.findByTestId(
        'accordion-v2.advancedSearch.form.registrationDetails'
      )
      await within(accordion).findByRole('button', { name: 'Hide' })
      await expect(
        await canvas.findByTestId(
          'event____legalStatus____REGISTERED____createdAtLocation'
        )
      ).toHaveValue('Ibombo District Office')
    }

    await step('Switch tabs and check if form values persist', async () => {
      const footballTab = await canvas.findByRole('button', {
        name: 'Football club membership application'
      })
      const tennisTab = await canvas.findByRole('button', {
        name: 'Tennis club membership application'
      })

      await userEvent.click(footballTab)
      await fillRegisterLocation()
      await userEvent.click(tennisTab)

      await checkRegistrationDetails(canvas)
      await checkApplicantDetails()
      await checkRecommenderDetails()

      await userEvent.click(footballTab)
      await checkRegisterLocation()
    })
  }
}
