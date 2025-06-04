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
import { userEvent, within, expect } from '@storybook/test'
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
      'Search button should be disabled when less than 2 fields are not filled or there are search field errors',
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

        const registrationAccordion = await canvas.findByTestId(
          'accordion-v2.advancedSearch.form.registrationDetails'
        )
        await userEvent.click(
          await within(registrationAccordion).findByRole('button', {
            name: 'Show'
          })
        )

        const placeOfRegistration = await canvas.findByTestId(
          'event____legalStatus____REGISTERED____createdAtLocation'
        )

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
    const checkRegistrationDetails = async () => {
      await canvas.findByText('Tennis club membership application')

      const registrationAccordion = await canvas.findByTestId(
        'accordion-v2.advancedSearch.form.registrationDetails'
      )

      await within(registrationAccordion).findByRole('button', {
        name: 'Hide'
      })

      const placeOfRegistration = await canvas.findByTestId(
        'event____legalStatus____REGISTERED____createdAtLocation'
      )

      await expect(placeOfRegistration).toHaveValue('Ibombo District Office')

      await within(registrationAccordion).findByText('June 2024 to June 2025')

      await within(registrationAccordion).findByText('Any status')
    }
    await step(
      'Tennis club membership tab > Registration details form is pre populated from the url even if accordion is hide and show again',
      async () => {
        await checkRegistrationDetails()

        const registrationAccordion = await canvas.findByTestId(
          'accordion-v2.advancedSearch.form.registrationDetails'
        )
        await userEvent.click(
          await within(registrationAccordion).findByRole('button', {
            name: 'Hide'
          })
        )
        await userEvent.click(
          await within(registrationAccordion).findByRole('button', {
            name: 'Show'
          })
        )
        await checkRegistrationDetails()
      }
    )

    const checkApplicantDetails = async () => {
      const applicantAccordion = await canvas.findByTestId(
        'accordion-v2.event.tennis-club-membership.search.applicants'
      )

      await within(applicantAccordion).findByRole('button', {
        name: 'Hide'
      })

      const firstName = await canvas.findByTestId(
        'text__applicant____firstname'
      )

      await expect(firstName).toHaveValue('Nina')
      const surname = await canvas.findByTestId('text__applicant____surname')

      await expect(surname).toHaveValue('Roy')
    }
    await step(
      "Tennis club membership tab > Applicant's details form is pre populated from the url",
      async () => {
        await checkApplicantDetails()
      }
    )

    const checkRecommenderDetails = async () => {
      const applicantAccordion = await canvas.findByTestId(
        'accordion-v2.event.tennis-club-membership.search.recommender'
      )

      await within(applicantAccordion).findByRole('button', {
        name: 'Hide'
      })

      const firstName = await canvas.findByTestId(
        'text__recommender____firstname'
      )

      await expect(firstName).toHaveValue('Annina')
      const surname = await canvas.findByTestId('text__recommender____surname')

      await expect(surname).toHaveValue('')
    }
    await step(
      "Tennis club membership tab > Reccomender's details form is pre populated from the url",
      async () => {
        await checkRecommenderDetails()
      }
    )

    const fillupRegisterLocation = async () => {
      const registrationAccordion = await canvas.findByTestId(
        'accordion-v2.advancedSearch.form.registrationDetails'
      )

      const accordionButton = await within(registrationAccordion).findByRole(
        'button',
        {
          name: 'Show'
        }
      )

      await userEvent.click(accordionButton)

      const placeOfRegistration = await canvas.findByTestId(
        'event____legalStatus____REGISTERED____createdAtLocation'
      )

      await userEvent.type(placeOfRegistration, 'Ibombo', {
        delay: 100
      })
      const placeOption = await canvas.findAllByText('Ibombo District Office')
      await userEvent.click(placeOption[0])
    }

    const checkRegisterLocation = async () => {
      const registrationAccordion = await canvas.findByTestId(
        'accordion-v2.advancedSearch.form.registrationDetails'
      )

      await within(registrationAccordion).findByRole('button', {
        name: 'Hide'
      })

      const placeOfRegistration = await canvas.findByTestId(
        'event____legalStatus____REGISTERED____createdAtLocation'
      )

      await expect(placeOfRegistration).toHaveValue('Ibombo District Office')
    }

    await step(
      'Select football tab, populate some fields and then reselect tennis club tab to check if the forms are still populated',
      async () => {
        const footballTab = await canvas.findByRole('button', {
          name: 'Football club membership application'
        })
        await userEvent.click(footballTab)

        await fillupRegisterLocation()

        const tennisClubTab = await canvas.findByRole('button', {
          name: 'Tennis club membership application'
        })
        await userEvent.click(tennisClubTab)

        await checkRegistrationDetails()
        await checkApplicantDetails()
        await checkRecommenderDetails()

        await userEvent.click(footballTab)
        await checkRegisterLocation()
      }
    )
  }
}
