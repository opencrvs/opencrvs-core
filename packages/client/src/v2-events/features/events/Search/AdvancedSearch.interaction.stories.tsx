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
import { waitFor } from '@testing-library/dom'

import { stringify } from 'query-string'
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

const trpcHandlers = createDeclarationTrpcMsw(tRPCMsw)

const defaultHandlers = {
  events: trpcHandlers.events.handlers,
  search: trpcHandlers.search.handlers
}

const storyParams = {
  reactRouter: {
    router: routesConfig,
    initialPath: ROUTES.V2.ADVANCED_SEARCH.buildPath({})
  },
  chromatic: { disableSnapshot: true },
  msw: { handlers: defaultHandlers }
}

export const AdvancedSearchStory: Story = {
  parameters: storyParams,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Open tennis club membership tab', async () => {
      await canvas.findByText(
        'Tennis club membership application',
        {},
        { timeout: 3000 }
      )
    })

    await step('Verify section headers', async () => {
      await canvas.findByText('Registration details')
      await canvas.findByText("Applicant's details")
      await canvas.findByText("Recommender's details")
    })

    await step('Search button disabled with incomplete fields', async () => {
      const searchButton = (
        await canvas.findAllByRole('button', { name: 'Search' })
      ).find((btn) => btn.id === 'search')
      await expect(searchButton).toBeVisible()
      await expect(searchButton).toBeDisabled()
    })

    await step('Fill in required fields and enable search', async () => {
      const searchButton = (
        await canvas.findAllByRole('button', { name: 'Search' })
      ).find((btn) => btn.id === 'search')

      const accordion = await canvas.findByTestId(
        'accordion-v2.advancedSearch.form.registrationDetails'
      )
      await userEvent.click(
        within(accordion).getByRole('button', { name: 'Show' })
      )

      const locationInput = await canvas.findByTestId(
        'event____legalStatus____REGISTERED____createdAtLocation'
      )
      await userEvent.type(locationInput, 'Ibombo', { delay: 100 })
      const locationOption = await canvas.findAllByText(
        'Ibombo District Office'
      )
      await userEvent.click(locationOption[0])
      await expect(searchButton).toBeDisabled()

      const statusWrapper = await canvas.findByTestId('select__event____status')
      const statusInput = within(statusWrapper).getByRole('textbox')
      await userEvent.click(statusInput)
      const statusOption = await canvas.findAllByText('Any status')
      await userEvent.click(statusOption[0])

      await expect(searchButton).toBeEnabled()
      if (searchButton) {
        await userEvent.click(searchButton)
      }
    })
  }
}

const query = stringify(
  {
    'applicant.name': JSON.stringify({
      firstname: 'Nina',
      surname: 'Roy'
    }),
    ['event.legalStatus.REGISTERED.createdAt']: ['2024-06-01', '2025-06-30'],
    ['event.legalStatus.REGISTERED.createdAtLocation']:
      '028d2c85-ca31-426d-b5d1-2cef545a4902',
    'event.status': 'ALL',
    'event.updatedAt': ['2025-05-03', '2025-06-03'],
    eventType: TENNIS_CLUB_MEMBERSHIP,
    'recommender.name': JSON.stringify({
      firstname: 'Annina'
    })
  },
  {
    encode: true
  }
)

export const AdvancedSearchTabsBehaviour: Story = {
  parameters: {
    ...storyParams,
    reactRouter: {
      ...storyParams.reactRouter,
      initialPath: `${ROUTES.V2.ADVANCED_SEARCH.buildPath({})}?${query}`
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    const assertRegistration = async () => {
      const accordion = await canvas.findByTestId(
        'accordion-v2.advancedSearch.form.registrationDetails'
      )

      await within(accordion).findByRole('button', { name: 'Hide' })
      await expect(
        await canvas.findByTestId(
          'event____legalStatus____REGISTERED____createdAtLocation'
        )
      ).toHaveValue('Ibombo District Office')
      await within(accordion).findByText('June 2024 to June 2025')
      await within(accordion).findByText('Any status')
    }

    await step(
      'Prepopulate and toggle Registration details accordion',
      async () => {
        await canvas.findByText(
          'Tennis club membership application',
          {},
          // @TODO: Find a general solution which does not rely on setting timeout for every flaky test.
          { timeout: 3000 }
        )
        await assertRegistration()
        const accordion = await canvas.findByTestId(
          'accordion-v2.advancedSearch.form.registrationDetails'
        )
        await userEvent.click(
          await within(accordion).findByRole('button', { name: 'Hide' })
        )

        await userEvent.click(
          await within(accordion).findByRole('button', { name: 'Show' })
        )

        await assertRegistration()
      }
    )

    // @TODO: Re-enable once the application supports NAME parameter as a query parameter.
    // updating NAME is done only on core. Updating countryconfig happens separately.
    // This should be solved by: https://github.com/opencrvs/opencrvs-core/issues/9690

    // await step("Prepopulate Applicant's details", async () => {
    //   const accordion = await canvas.findByTestId(
    //     'accordion-v2.event.tennis-club-membership.search.applicants'
    //   )

    //   await within(accordion).findByRole('button', { name: 'Hide' })
    //   await expect(
    //     await canvas.findByTestId('text__applicant____firstname')
    //   ).toHaveValue('Nina')
    //   await expect(
    //     await canvas.findByTestId('text__applicant____surname')
    //   ).toHaveValue('Roy')
    // })

    // await step("Prepopulate Recommender's details", async () => {
    //   const accordion = await canvas.findByTestId(
    //     'accordion-v2.event.tennis-club-membership.search.recommender'
    //   )
    //   await within(accordion).findByRole('button', { name: 'Hide' })
    //   await expect(
    //     await canvas.findByTestId('text__recommender____firstname')
    //   ).toHaveValue('Annina')
    //   await expect(
    //     await canvas.findByTestId('text__recommender____surname')
    //   ).toHaveValue('')
    // })

    await step('Form value persistence across tabs', async () => {
      const footballTab = await canvas.findByRole('button', {
        name: 'Football club membership application'
      })
      const tennisTab = await canvas.findByRole(
        'button',
        {
          name: 'Tennis club membership application'
        },
        { timeout: 3000 }
      )

      await userEvent.click(footballTab)
      const footballAccordion = await canvas.findByTestId(
        'accordion-v2.advancedSearch.form.registrationDetails'
      )
      await userEvent.click(
        within(footballAccordion).getByRole('button', { name: 'Show' })
      )
      const input = await canvas.findByTestId(
        'event____legalStatus____REGISTERED____createdAtLocation'
      )
      await userEvent.type(input, 'Ibombo', { delay: 100 })
      const option = await canvas.findAllByText('Ibombo District Office')
      await userEvent.click(option[0])

      await userEvent.click(tennisTab)
      await assertRegistration()
      await userEvent.click(footballTab)
      await expect(
        await canvas.findByTestId(
          'event____legalStatus____REGISTERED____createdAtLocation'
        )
      ).toHaveValue('Ibombo District Office')
    })
  }
}

export const AdvancedSearchTabsLocationAndDateFieldReset: Story = {
  parameters: AdvancedSearchTabsBehaviour.parameters,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Clear Place and Date of Registration, perform search',
      async () => {
        let locationInput: HTMLElement | undefined

        await waitFor(async () => {
          const input = await canvas.findByTestId(
            'event____legalStatus____REGISTERED____createdAtLocation'
          )

          await expect(input).toBeInTheDocument()
          locationInput = input
        })

        if (!locationInput) {
          throw new Error('locationInput not found after waitFor')
        }

        await expect(locationInput).toHaveValue('Ibombo District Office')
        await userEvent.clear(locationInput)
        locationInput.blur()

        const dateToggle = (await canvas.findAllByRole('checkbox')).find(
          (el) =>
            el.id ===
            'event____legalStatus____REGISTERED____createdAt-date_range_toggle'
        )

        if (dateToggle) {
          await expect(dateToggle).toBeChecked()
          await userEvent.click(dateToggle)
        }

        const searchBtn = (
          await canvas.findAllByRole('button', { name: 'Search' })
        ).find((btn) => btn.id === 'search')

        // @TODO: Check for Enabled when https://github.com/opencrvs/opencrvs-core/issues/9765 has been resolved.
        // Currently, name fields are interpreted as required fields, so clearing them disables the search button.
        await expect(searchBtn).toBeDisabled()
      }
    )

    // @TODO: Bring back once issues in https://github.com/opencrvs/opencrvs-core/issues/9765 has been resolved.
    // await step(
    //   'Ensure cleared fields do not appear in search criteria',
    //   async () => {
    //     await waitFor(async () => {
    //       await expect(
    //         canvas.queryByText('Place of registration')
    //       ).not.toBeInTheDocument()
    //       await expect(
    //         canvas.queryByText('Date of registration:')
    //       ).not.toBeInTheDocument()
    //     })
    //   }
    // )
  }
}
