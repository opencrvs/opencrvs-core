/* eslint-disable max-lines */
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
import * as selectEvent from 'react-select-event'
import {
  ActionType,
  footballClubMembershipEvent,
  generateEventDocument,
  getCurrentEventState,
  TENNIS_CLUB_MEMBERSHIP,
  tennisClubMembershipEvent,
  TestUserRole,
  UUID
} from '@opencrvs/commons/client'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { storeUserDetails } from '@client/utils/userUtils'
import { TRPCProvider, AppRouter } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { createDeclarationTrpcMsw } from '@client/tests/v2-events/declaration.utils'
import { serializeSearchParams } from './utils'
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

const createdEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [{ type: ActionType.CREATE }]
})
const trpcHandlers = createDeclarationTrpcMsw(tRPCMsw, createdEventDocument)

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
  msw: { handlers: defaultHandlers },
  offline: {
    configs: [tennisClubMembershipEvent, footballClubMembershipEvent]
  }
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
      const searchButton = await canvas.findByTestId('search')

      await expect(searchButton).toBeVisible()
      await expect(searchButton).toBeDisabled()
    })

    await step('Fill in required fields and enable search', async () => {
      const accordion = await canvas.findByTestId(
        'accordion-advancedSearch.form.registrationDetails'
      )
      await userEvent.click(
        within(accordion).getByRole('button', { name: 'Show' })
      )

      const locationInput = canvasElement.querySelector(
        '#searchable-select-event____legalStatuses____REGISTERED____createdAtLocation input'
      )

      if (!locationInput) {
        throw new Error('Location input not found')
      }

      await userEvent.type(locationInput, 'Ibombo', { delay: 100 })
      const locationOption = await canvas.findAllByText(
        'Ibombo District Office'
      )
      await userEvent.click(locationOption[0])
      const searchButton = await canvas.findByTestId('search')

      await expect(searchButton).toBeDisabled()

      const statusWrapper = await canvas.findByTestId('select__event____status')

      await userEvent.click(statusWrapper)
      await selectEvent.select(statusWrapper, 'Any status')

      await waitFor(async () => {
        await expect(canvas.getByTestId('search')).toBeEnabled()
      })

      await userEvent.click(searchButton)
    })
  }
}

async function adjustYearLabel(
  canvas: ReturnType<typeof within>,
  baseId: string,
  targetYear: number
) {
  const labelId = `${baseId}-year-label`
  const prevMonthButtonId = `${baseId}-prev`
  const nextMonthButtonId = `${baseId}-next`

  let yearLabel = await canvas.findByTestId(labelId)
  let currentYear = Number(yearLabel.textContent)
  let guard = 0

  while (currentYear !== targetYear && guard < 10) {
    if (currentYear < targetYear) {
      const nextBtn = await canvas.findByTestId(nextMonthButtonId)
      await userEvent.click(nextBtn)
    } else {
      const prevBtn = await canvas.findByTestId(prevMonthButtonId)
      await userEvent.click(prevBtn)
    }

    yearLabel = await canvas.findByTestId(labelId)
    currentYear = Number(yearLabel.textContent)
    guard++
  }

  await expect(currentYear).toBe(targetYear)
}

export const AdvancedSearchDateRangePicker: Story = {
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.ADVANCED_SEARCH.buildPath({})
    },
    chromatic: { disableSnapshot: true },
    offline: {
      configs: [tennisClubMembershipEvent, footballClubMembershipEvent]
    },
    viewport: { defaultViewport: 'mobile' }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Open tennis club membership tab', async () => {
      await canvas.findByText(
        'Tennis club membership application',
        {},
        { timeout: 3000 }
      )
    })

    await step('Fill in required fields and enable search', async () => {
      const accordion = await canvas.findByTestId(
        'accordion-advancedSearch.form.registrationDetails'
      )
      await userEvent.click(
        within(accordion).getByRole('button', { name: 'Show' })
      )

      const locationOption = await canvas.findAllByText('Exact date unknown')
      await userEvent.click(locationOption[0])
    })

    const TARGET_YEAR = 2024
    await step(`Adjust FROM year label to ${TARGET_YEAR}`, async () => {
      await adjustYearLabel(canvas, 'start-date-small', TARGET_YEAR)
    })

    await step(
      `Select Aug month from ${TARGET_YEAR} for FROM date`,
      async () => {
        const monthBtn = await canvas.findByTestId('start-date-small-aug')
        await userEvent.click(monthBtn)
      }
    )

    await step(`Adjust TO year label to ${TARGET_YEAR}`, async () => {
      await adjustYearLabel(canvas, 'end-date-small', TARGET_YEAR)
    })

    await step(`Select Aug month from ${TARGET_YEAR} for TO date`, async () => {
      const monthBtn = await canvas.findByTestId('end-date-small-aug')
      await userEvent.click(monthBtn)
    })

    await step('Search button disabled with incomplete fields', async () => {
      const searchButton = (
        await canvas.findAllByRole('button', { name: 'Search' })
      ).find((btn) => btn.id === 'search')

      await expect(searchButton).toBeDisabled()
    })
  }
}

const serializedParams = serializeSearchParams({
  'applicant.name': {
    firstname: 'Nina',
    surname: 'Roy'
  },
  'event.legalStatuses.REGISTERED.acceptedAt': {
    start: '2024-06-01',
    end: '2025-06-30'
  },
  'event.legalStatuses.REGISTERED.createdAtLocation':
    '028d2c85-ca31-426d-b5d1-2cef545a4902',
  'event.status': 'ALL',
  'event.updatedAt': {
    start: '2025-05-03',
    end: '2025-06-03'
  },
  'recommender.name': {
    firstname: 'Annina',
    surname: ''
  },
  eventType: TENNIS_CLUB_MEMBERSHIP
})

export const AdvancedSearchTabsBehaviour: Story = {
  parameters: {
    ...storyParams,
    reactRouter: {
      ...storyParams.reactRouter,
      initialPath: `${ROUTES.V2.ADVANCED_SEARCH.buildPath({})}?${serializedParams}`
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    const assertRegistration = async () => {
      const accordion = await canvas.findByTestId(
        'accordion-advancedSearch.form.registrationDetails'
      )

      await within(accordion).findByRole('button', { name: 'Hide' })
      await expect(
        canvasElement.querySelector(
          '#searchable-select-event____legalStatuses____REGISTERED____createdAtLocation'
        )
      ).toHaveTextContent('Ibombo District Office')
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
          'accordion-advancedSearch.form.registrationDetails'
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

    await step("Prepopulate Applicant's details", async () => {
      const accordion = await canvas.findByTestId(
        'accordion-event.tennis-club-membership.search.applicants'
      )

      await within(accordion).findByRole('button', { name: 'Hide' })
      await expect(
        await within(accordion).findByTestId('text__firstname')
      ).toHaveValue('Nina')
      await expect(
        await within(accordion).findByTestId('text__surname')
      ).toHaveValue('Roy')
    })

    await step("Prepopulate Recommender's details", async () => {
      const accordion = await canvas.findByTestId(
        'accordion-event.tennis-club-membership.search.recommender'
      )
      await within(accordion).findByRole('button', { name: 'Hide' })
      await expect(
        await within(accordion).findByTestId('text__firstname')
      ).toHaveValue('Annina')
      await expect(
        await within(accordion).findByTestId('text__surname')
      ).toHaveValue('')
    })

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
        'accordion-advancedSearch.form.registrationDetails'
      )
      await userEvent.click(
        within(footballAccordion).getByRole('button', { name: 'Show' })
      )

      const locationInput = canvasElement.querySelector(
        '#searchable-select-event____legalStatuses____REGISTERED____createdAtLocation input'
      )

      if (!locationInput) {
        throw new Error('Location input not found')
      }

      await userEvent.type(locationInput, 'Ibombo', { delay: 100 })
      const locationOption = await canvas.findAllByText(
        'Ibombo District Office'
      )
      await userEvent.click(locationOption[0])

      await userEvent.click(tennisTab)
      await assertRegistration()
      await userEvent.click(footballTab)
      await expect(
        canvasElement.querySelector(
          '#searchable-select-event____legalStatuses____REGISTERED____createdAtLocation .react-select__single-value'
        )
      ).toHaveTextContent('Ibombo District Office')
    })
  }
}

const serializedParams2 = serializeSearchParams({
  'event.legalStatuses.REGISTERED.acceptedAt': {
    start: '2024-06-01',
    end: '2025-06-30'
  },
  'event.legalStatuses.REGISTERED.createdAtLocation':
    '028d2c85-ca31-426d-b5d1-2cef545a4902',
  'recommender.name': {
    firstname: 'Annina',
    surname: ''
  },
  'event.status': 'ALL',
  eventType: TENNIS_CLUB_MEMBERSHIP
})

export const AdvancedSearchTabsLocationAndDateFieldReset: Story = {
  parameters: {
    ...storyParams,
    reactRouter: {
      ...storyParams.reactRouter,
      initialPath: `${ROUTES.V2.ADVANCED_SEARCH.buildPath({})}?${serializedParams2}`
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Clear Place and Date of Registration, perform search',
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 5000))

        const locationInput = canvasElement.querySelector(
          '#searchable-select-event____legalStatuses____REGISTERED____createdAtLocation input'
        )

        if (!locationInput) {
          throw new Error('Location input not found')
        }

        await expect(
          canvasElement.querySelector(
            '#searchable-select-event____legalStatuses____REGISTERED____createdAtLocation .react-select__single-value'
          )
        ).toHaveTextContent('Ibombo District Office')

        await userEvent.clear(locationInput)

        const dateToggle = (await canvas.findAllByRole('checkbox')).find(
          (el) =>
            el.id ===
            'event____legalStatuses____REGISTERED____acceptedAt-date_range_checkbox'
        )

        if (dateToggle) {
          await expect(dateToggle).toBeChecked()
          await userEvent.click(dateToggle)
          await expect(dateToggle).not.toBeChecked()
        }

        const searchBtn = (
          await canvas.findAllByRole('button', { name: 'Search' })
        ).find((btn) => btn.id === 'search')

        if (searchBtn) {
          await expect(searchBtn).toBeEnabled()
        }
      }
    )

    await step(
      'Ensure cleared fields do not appear in search criteria',
      async () => {
        await waitFor(async () => {
          await expect(
            canvas.queryByText('Place of registration:')
          ).not.toBeInTheDocument()
          await expect(
            canvas.queryByText('Date of registration:')
          ).not.toBeInTheDocument()
        })
      }
    )
  }
}

export const AdvancedSearchPartialNameSearchSupport: Story = {
  parameters: {
    ...storyParams,
    reactRouter: {
      ...storyParams.reactRouter,
      initialPath: `${ROUTES.V2.ADVANCED_SEARCH.buildPath({})}`
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Search button should be enabled event with partial name field along with another field',
      async () => {
        const searchButton = (
          await canvas.findAllByRole('button', { name: 'Search' })
        ).find((btn) => btn.id === 'search')

        await expect(searchButton).toBeDisabled()

        const accordion = await canvas.findByTestId(
          'accordion-event.tennis-club-membership.search.applicants'
        )
        await userEvent.click(
          within(accordion).getByRole('button', { name: 'Show' })
        )
        const firstName =
          await within(accordion).findByTestId('text__firstname')
        await userEvent.type(firstName, 'Tareq')

        const email = await within(accordion).findByTestId(
          'text__applicant____email'
        )
        await userEvent.type(email, 'tareq@gmail.com')

        await userEvent.click(accordion)

        await expect(searchButton).toBeEnabled()
      }
    )
  }
}

const generator = testDataGenerator()

async function openRegistrationLocationDropdown(
  canvasElement: HTMLElement,
  canvas: ReturnType<typeof within>
) {
  const accordion = await canvas.findByTestId(
    'accordion-advancedSearch.form.registrationDetails'
  )
  await userEvent.click(within(accordion).getByRole('button', { name: 'Show' }))

  const locationInput = canvasElement.querySelector(
    '#searchable-select-event____legalStatuses____REGISTERED____createdAtLocation input'
  )

  if (!locationInput) {
    throw new Error('Location input not found')
  }

  await userEvent.click(locationInput)
  return canvas.findByRole('listbox')
}

const communityLeaderStoryBase = {
  ...storyParams,
  userRole: TestUserRole.enum.COMMUNITY_LEADER,
  reactRouter: {
    ...storyParams.reactRouter,
    initialPath: ROUTES.V2.ADVANCED_SEARCH.buildPath({})
  }
}

const mockUser = {
  ...generator.user.communityLeader().summary,
  primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID
}

const mockUserFull = {
  ...generator.user.communityLeader().v2,
  primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID
}

const mswConfig = {
  handlers: {
    events: [
      tRPCMsw.event.config.get.query(() => {
        return [tennisClubMembershipEvent]
      })
    ],
    user: [
      tRPCMsw.user.list.query(() => {
        return [mockUser]
      }),
      tRPCMsw.user.get.query(() => {
        return mockUserFull
      })
    ]
  }
}

/**
 * record.search[registeredIn=location] — dropdown restricted to the user's
 * own office only (Ibombo District Office).
 */
export const JurisdictionScope_Location: Story = {
  parameters: {
    ...communityLeaderStoryBase,
    token: generator.user.token.communityLeaderRegisteredInLocation,
    msw: mswConfig
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Location dropdown shows only Ibombo District Office',
      async () => {
        const listbox = await openRegistrationLocationDropdown(
          canvasElement,
          canvas
        )
        const options = within(listbox).queryAllByRole('listitem')

        await expect(options).toHaveLength(1)
        await expect(options[0]).toHaveTextContent('Ibombo District Office')
      }
    )
  }
}

/**
 * record.search[registeredIn=administrativeArea] — dropdown restricted to
 * offices within the user's administrative area (multiple offices visible).
 */
export const JurisdictionScope_AdministrativeArea: Story = {
  parameters: {
    ...communityLeaderStoryBase,
    token: generator.user.token.communityLeaderRegisteredInAdministrativeArea,
    msw: mswConfig
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Location dropdown shows offices in the Ibombo administrative area',
      async () => {
        const listbox = await openRegistrationLocationDropdown(
          canvasElement,
          canvas
        )
        const options = within(listbox).queryAllByRole('listitem')

        await expect(options).toHaveLength(2)
        await expect(options[0]).toHaveTextContent('Ibombo District Office')
        await expect(options[1]).toHaveTextContent('Klow Village Office')
      }
    )
  }
}

const allOffices = [
  'Central Provincial Office',
  'Ibombo District Office',
  'Isamba District Office',
  'Isango District Office',
  'Sulaka Provincial Office',
  'Ilanga District Office',
  'Klow Village Office'
]

/**
 * record.search (no registeredIn set) — defaults to 'all', dropdown shows
 * every office with no jurisdiction restriction.
 */
export const JurisdictionScope_All: Story = {
  parameters: {
    ...communityLeaderStoryBase,
    token: generator.user.token.communityLeader,
    msw: mswConfig
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Location dropdown shows all offices when registeredIn is not set',
      async () => {
        const listbox = await openRegistrationLocationDropdown(
          canvasElement,
          canvas
        )
        const options = within(listbox).queryAllByRole('listitem')

        await expect(options.length).toEqual(allOffices.length)
        allOffices.forEach(async (office) => {
          await expect(
            options.some((o) => o.textContent?.includes(office))
          ).toBe(true)
        })
      }
    )
  }
}

/**
 * Two record.search scopes: no registeredIn (defaults to 'all') + registeredIn=location.
 * Most relaxed value ('all') wins — dropdown shows every office.
 */
export const JurisdictionScope_AllBeatsLocation: Story = {
  parameters: {
    ...communityLeaderStoryBase,
    token: generator.user.token.communityLeaderSearchAllAndLocation,
    msw: mswConfig
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      "Location dropdown shows all offices when 'all' scope beats location restriction",
      async () => {
        const listbox = await openRegistrationLocationDropdown(
          canvasElement,
          canvas
        )
        const options = within(listbox).queryAllByRole('listitem')

        await expect(options.length).toEqual(allOffices.length)
        allOffices.forEach(async (office) => {
          await expect(
            options.some((o) => o.textContent?.includes(office))
          ).toBe(true)
        })
      }
    )
  }
}

/**
 * Verifies the `backTo` round-trip: a user lands on the advanced search result
 * page with a serialized set of filters, opens an event, navigates into a deep
 * action (edit/review) and then closes — they must return to the exact same
 * search-result URL with the same filters intact.
 *
 * This exercises the unified `backTo` query param introduced in [routes.ts] and
 * the `useCurrentBackTo` hook + `closeActionView(backTo)` exit path.
 */
const backToFilterParams = serializeSearchParams({
  'applicant.name': {
    firstname: 'John',
    surname: 'Doe'
  },
  'event.legalStatuses.REGISTERED.createdAtLocation':
    '028d2c85-ca31-426d-b5d1-2cef545a4902',
  'event.status': 'ALL',
  eventType: TENNIS_CLUB_MEMBERSHIP
})

const searchResultInitialPath = `${ROUTES.V2.SEARCH_RESULT.buildPath({
  eventType: TENNIS_CLUB_MEMBERSHIP
})}?${backToFilterParams}`

const registeredEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [
    { type: ActionType.CREATE },
    { type: ActionType.DECLARE },
    { type: ActionType.REGISTER }
  ]
})
const registeredEventIndex = getCurrentEventState(
  registeredEventDocument,
  tennisClubMembershipEvent
)

const backToPersistenceMsw = {
  handlers: {
    events: [
      tRPCMsw.event.config.get.query(() => [
        tennisClubMembershipEvent,
        footballClubMembershipEvent
      ]),
      tRPCMsw.event.search.query(() => ({
        results: [registeredEventIndex],
        total: 1
      })),
      tRPCMsw.event.get.query(() => registeredEventDocument)
    ],
    drafts: trpcHandlers.drafts.handlers
  }
}

export const SearchResultBackToPersistsThroughEditClose: Story = {
  parameters: {
    ...storyParams,
    reactRouter: {
      router: routesConfig,
      initialPath: searchResultInitialPath
    },
    msw: backToPersistenceMsw
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Advanced search result table renders', async () => {
      await canvas.findByTestId('search-result', {}, { timeout: 5000 })
    })

    await step(
      'Click the applicant name button navigates to event overview',
      async () => {
        const searchResult = await canvas.findByTestId('search-result')
        const nameButton = await within(searchResult).findByRole(
          'button',
          { name: /John/ },
          { timeout: 5000 }
        )
        await userEvent.click(nameButton)
      }
    )

    await step('Event overview page renders with exit button', async () => {
      await canvas.findByTestId('exit-event', {}, { timeout: 5000 })
    })

    await step('Click X close on the event overview page', async () => {
      const closeBtn = await canvas.findByTestId('exit-event')
      await userEvent.click(closeBtn)
    })

    await step(
      'User lands back on the advanced search result page with filters intact',
      async () => {
        await canvas.findByTestId('search-result')
        // Applicant name filter chip from the original search criteria must
        // still be visible — proves the backTo URL preserved query params.
        await canvas.findByText('Event: Tennis-club-membership')
        await canvas.findByText(`Applicant's name: John Doe`)
        await canvas.findByText(
          `Place of registration: Ibombo District Office, Ibombo, Central, Farajaland`
        )
        await canvas.findByText(`Status of record: Any status`)
      }
    )
  }
}

/**
 * Two record.search scopes: registeredIn=location + registeredIn=administrativeArea.
 * Most relaxed value (administrativeArea) wins — same result as JurisdictionScope_AdministrativeArea.
 */
export const JurisdictionScope_MultipleScopes_MostRelaxedWins: Story = {
  parameters: {
    ...communityLeaderStoryBase,
    token: generator.user.token.communityLeaderMultipleSearchScopes,
    msw: mswConfig
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Location dropdown applies the most relaxed scope (administrativeArea beats location)',
      async () => {
        const listbox = await openRegistrationLocationDropdown(
          canvasElement,
          canvas
        )
        const options = within(listbox).queryAllByRole('listitem')

        await expect(options).toHaveLength(2)
        await expect(options[0]).toHaveTextContent('Ibombo District Office')
        await expect(options[1]).toHaveTextContent('Klow Village Office')
      }
    )
  }
}
