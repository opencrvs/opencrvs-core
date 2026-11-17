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
  field,
  FieldType,
  tennisClubMembershipEvent,
  toVersionedEventConfig,
  VersionedEventConfig,
  withDeclarationField
} from '@opencrvs/commons/client'
import { serializeSearchParams } from '@client/v2-events/features/events/Search/utils'
import { TRPCProvider, AppRouter } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { UNFIT_SEARCH_CRITERIA_TOAST_ID } from './useUnfitSearchCriteriaNotice'
import { AdvancedSearch } from './index'

const NICKNAME_FIELD_ID = 'applicant.nickname'
const SECTION_ID = 'event.tennis-club-membership.search.nickname'

const { versions, ...eventLevel } = toVersionedEventConfig(
  tennisClubMembershipEvent
)
const [base] = versions

/**
 * v1 has the nickname field, and v2, in effect today, does not. Search can still
 * use the field, to find the records created under v1.
 */
const versionedEvent: VersionedEventConfig = {
  ...eventLevel,
  advancedSearch: [
    {
      title: {
        id: SECTION_ID,
        defaultMessage: 'Nickname details',
        description: 'Title of the search section with the nickname field'
      },
      fields: [field(NICKNAME_FIELD_ID).exact()]
    }
  ],
  versions: [
    withDeclarationField(
      { ...base, id: 'v1' },
      {
        id: NICKNAME_FIELD_ID,
        type: FieldType.TEXT,
        label: {
          id: 'event.tennis-club-membership.action.declare.form.section.who.field.nickname.label',
          defaultMessage: 'Nickname',
          description: 'Field that only the older version has'
        }
      }
    ),
    { ...base, id: 'v2', effectiveFrom: '2020-01-01' }
  ]
}

const meta: Meta<typeof AdvancedSearch> = {
  title: 'AdvancedSearch/VersionedFields',
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

const msw = {
  handlers: {
    events: [
      tRPCMsw.event.config.get.query(() => [versionedEvent]),
      tRPCMsw.event.search.query(() => ({ results: [], total: 0 }))
    ]
  }
}

export const FormShowsFieldOfOlderVersion: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.ADVANCED_SEARCH.buildPath({})
    },
    chromatic: { disableSnapshot: true },
    // The offline cache holds single-version configs only, so the configs come from msw. Without them, no record can be cached either.
    offline: { configs: [], events: [] },
    msw
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Open the nickname section', async () => {
      const accordion = await canvas.findByTestId(`accordion-${SECTION_ID}`)
      await userEvent.click(
        within(accordion).getByRole('button', { name: 'Show' })
      )
    })

    await step('The field of v1 shows, with its label', async () => {
      await canvas.findByText('Nickname')
    })
  }
}

export const CriteriaPanelShowsFieldOfOlderVersion: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: `${ROUTES.V2.SEARCH_RESULT.buildPath({
        eventType: tennisClubMembershipEvent.id
      })}?${serializeSearchParams({
        [NICKNAME_FIELD_ID]: 'Ace',
        eventType: tennisClubMembershipEvent.id
      })}`
    },
    chromatic: { disableSnapshot: true },
    offline: { configs: [], events: [] },
    msw
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('The criteria pill names the field of v1', async () => {
      await canvas.findByText('Nickname: Ace', {}, { timeout: 5000 })
    })
  }
}

export const LinkValueThatNoLongerFitsIsDropped: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      // A name, e.g. from a link saved while the field was a NAME. It is a TEXT field now.
      initialPath: `${ROUTES.V2.SEARCH_RESULT.buildPath({
        eventType: tennisClubMembershipEvent.id
      })}?${serializeSearchParams({
        [NICKNAME_FIELD_ID]: { firstname: 'Ace', surname: 'Smith' },
        eventType: tennisClubMembershipEvent.id
      })}`
    },
    chromatic: { disableSnapshot: true },
    offline: { configs: [], events: [] },
    msw
  },
  play: async ({ canvasElement, step }) => {
    // The toast renders outside the story's root element.
    const page = within(canvasElement.ownerDocument.body)

    await step(
      'A warning says that some criteria no longer apply',
      async () => {
        await page.findByTestId(
          UNFIT_SEARCH_CRITERIA_TOAST_ID,
          {},
          { timeout: 5000 }
        )
      }
    )

    await step('The value is left out of the criteria', async () => {
      await expect(page.queryByText(/Nickname/)).not.toBeInTheDocument()
    })
  }
}
