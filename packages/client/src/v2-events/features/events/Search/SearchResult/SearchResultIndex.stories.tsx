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
import { within } from 'storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import {
  ActionType,
  footballClubMembershipEvent,
  generateEventDocument,
  getCurrentEventState,
  TENNIS_CLUB_MEMBERSHIP,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { TRPCProvider, AppRouter } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { serializeSearchParams } from '../utils'
import { SearchResultIndex } from './SearchResultIndex'

const meta: Meta<typeof SearchResultIndex> = {
  title: 'SearchResult/Page',
  component: SearchResultIndex,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}
export default meta

type Story = StoryObj<typeof SearchResultIndex>

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const LONG_FIRSTNAME = 'Maximilian Alexander Bartholomew Christopher'
const LONG_SURNAME = 'Featherstonehaugh-Montgomery-Wolfeschlegelsteinhausen'

// A name long enough that its filter pill wraps even at desktop width.
const longPillParams = serializeSearchParams({
  'applicant.name': {
    firstname: LONG_FIRSTNAME,
    surname: LONG_SURNAME
  },
  'event.legalStatuses.REGISTERED.createdAtLocation':
    '028d2c85-ca31-426d-b5d1-2cef545a4902',
  'event.status': 'ALL',
  eventType: TENNIS_CLUB_MEMBERSHIP
})

const registeredEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [
    { type: ActionType.CREATE },
    { type: ActionType.DECLARE },
    { type: ActionType.REGISTER }
  ]
})

const longPillStoryParams = {
  reactRouter: {
    router: routesConfig,
    initialPath: `${ROUTES.V2.SEARCH_RESULT.buildPath({
      eventType: TENNIS_CLUB_MEMBERSHIP
    })}?${longPillParams}`
  },
  offline: {
    configs: [tennisClubMembershipEvent, footballClubMembershipEvent]
  },
  msw: {
    handlers: {
      events: [
        tRPCMsw.event.config.get.query(() => [
          tennisClubMembershipEvent,
          footballClubMembershipEvent
        ]),
        tRPCMsw.event.search.query(() => ({
          results: [
            getCurrentEventState(
              registeredEventDocument,
              tennisClubMembershipEvent
            )
          ],
          total: 1
        }))
      ]
    }
  }
}

async function waitForLongPill(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  await canvas.findByTestId('search-result', {}, { timeout: 5000 })
  await canvas.findByText(
    `Applicant's name: ${LONG_FIRSTNAME} ${LONG_SURNAME}`,
    {},
    { timeout: 5000 }
  )
}

export const LongSearchCriteriaPillDesktop: Story = {
  parameters: longPillStoryParams
}

export const LongSearchCriteriaPillMobile: Story = {
  parameters: longPillStoryParams,
  globals: { viewport: { value: 'mobile' } }
}
