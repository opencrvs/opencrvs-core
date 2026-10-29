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
import { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import {
  ActionType,
  AdvancedSearchField,
  EventConfig,
  field,
  FieldConfig,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { TRPCProvider, AppRouter } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AdvancedSearch } from './index'

function eventWithNameDefault(searchField: AdvancedSearchField): EventConfig {
  return {
    ...tennisClubMembershipEvent,
    actions: tennisClubMembershipEvent.actions.map((action) =>
      action.type === ActionType.DECLARE
        ? {
            ...action,
            declaration: {
              ...action.declaration,
              pages: action.declaration.pages.map((page) => ({
                ...page,
                fields: page.fields.map((pageField) =>
                  pageField.id === 'applicant.name'
                    ? ({
                        ...pageField,
                        defaultValue: {
                          firstname: 'Default',
                          surname: 'Applicant'
                        }
                      } as FieldConfig)
                    : pageField
                )
              }))
            }
          }
        : action
    ),
    advancedSearch: [
      {
        title: {
          defaultMessage: "Applicant's details",
          description: 'Applicant details search field section title',
          id: 'event.tennis-club-membership.search.applicants'
        },
        fields: [searchField]
      }
    ]
  }
}

const eventWithDefaultSkipped = eventWithNameDefault(
  field('applicant.name', { defaultValue: false }).fuzzy()
)

const eventWithDefaultKept = eventWithNameDefault(
  field('applicant.name').fuzzy()
)

const eventWithDefaultEnabled = eventWithNameDefault(
  field('applicant.name', { defaultValue: true }).fuzzy()
)

const eventWithSearchDefault = eventWithNameDefault(
  field('applicant.email', { defaultValue: 'applicant@example.com' }).exact()
)

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

export const DoesNotPrefillDefaultValues: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.ADVANCED_SEARCH.buildPath({})
    },
    chromatic: { disableSnapshot: true },
    offline: { configs: [eventWithDefaultSkipped] },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => [eventWithDefaultSkipped])
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Open applicant section', async () => {
      const accordion = await canvas.findByTestId(
        'accordion-event.tennis-club-membership.search.applicants'
      )
      await userEvent.click(
        within(accordion).getByRole('button', { name: 'Show' })
      )
    })

    await step('Name inputs are empty', async () => {
      await expect(await canvas.findByTestId('text__firstname')).toHaveValue('')
      await expect(canvas.getByTestId('text__surname')).toHaveValue('')
    })

    await step('Defaults do not count towards the search minimum', async () => {
      await expect(canvas.getByTestId('search')).toBeDisabled()
    })
  }
}

export const PrefillsDefaultValuesWhenNotOptedOut: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.ADVANCED_SEARCH.buildPath({})
    },
    chromatic: { disableSnapshot: true },
    offline: { configs: [eventWithDefaultKept] },
    msw: {
      handlers: {
        events: [tRPCMsw.event.config.get.query(() => [eventWithDefaultKept])]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Open applicant section', async () => {
      const accordion = await canvas.findByTestId(
        'accordion-event.tennis-club-membership.search.applicants'
      )
      await userEvent.click(
        within(accordion).getByRole('button', { name: 'Show' })
      )
    })

    await step('Name inputs show the form defaults', async () => {
      await expect(await canvas.findByTestId('text__firstname')).toHaveValue(
        'Default'
      )
      await expect(canvas.getByTestId('text__surname')).toHaveValue('Applicant')
    })
  }
}

export const PrefillsDefaultValuesWhenEnabled: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.ADVANCED_SEARCH.buildPath({})
    },
    chromatic: { disableSnapshot: true },
    offline: { configs: [eventWithDefaultEnabled] },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => [eventWithDefaultEnabled])
        ]
      }
    }
  },
  play: PrefillsDefaultValuesWhenNotOptedOut.play
}

export const PrefillsSearchDefaultValue: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.ADVANCED_SEARCH.buildPath({})
    },
    chromatic: { disableSnapshot: true },
    offline: { configs: [eventWithSearchDefault] },
    msw: {
      handlers: {
        events: [tRPCMsw.event.config.get.query(() => [eventWithSearchDefault])]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Open applicant section', async () => {
      const accordion = await canvas.findByTestId(
        'accordion-event.tennis-club-membership.search.applicants'
      )
      await userEvent.click(
        within(accordion).getByRole('button', { name: 'Show' })
      )
    })

    await step('Email input shows the search default', async () => {
      await expect(
        await canvas.findByTestId('text__applicant____email')
      ).toHaveValue('applicant@example.com')
    })
  }
}
