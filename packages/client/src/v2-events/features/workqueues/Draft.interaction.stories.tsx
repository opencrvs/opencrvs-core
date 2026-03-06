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
import React from 'react'
import superjson from 'superjson'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { userEvent, within, expect } from '@storybook/test'
import {
  ActionType,
  createPrng,
  generateEventDocument,
  generateEventDraftDocument,
  generateWorkqueues,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { WorkqueueIndex } from './index'

const meta: Meta<typeof WorkqueueIndex> = {
  title: 'Workqueue/Draft',
  component: WorkqueueIndex,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta
type Story = StoryObj<typeof WorkqueueIndex>

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

// Names in reverse-alphabetical order so the display is clearly unsorted.
// After sorting by Title, page 1 must show A–J globally and page 2 K–O.
const draftSortFirstnames = [
  'Oscar',
  'Nancy',
  'Mike',
  'Laura',
  'Kevin',
  'June',
  'Ivan',
  'Hannah',
  'Grace',
  'Frank',
  'Eve',
  'Diana',
  'Carol',
  'Bob',
  'Alice'
]

const draftSortEventPairs = draftSortFirstnames.map((firstname, i) => {
  const rng = createPrng(i * 100 + 500)
  const createdEvent = generateEventDocument({
    rng,
    configuration: tennisClubMembershipEvent,
    actions: [{ type: ActionType.CREATE }]
  })
  return {
    event: createdEvent,
    draft: generateEventDraftDocument({
      eventId: createdEvent.id,
      actionType: ActionType.DECLARE,
      rng,
      declaration: { 'applicant.name': { firstname, surname: 'Smith' } }
    })
  }
})

const draftSortDrafts = draftSortEventPairs.map((p) => p.draft)

/**
 * Verifies that sorting in the draft workqueue applies globally across all
 * pages, not just within the current page.
 *
 * Before the fix, clicking "Title" would sort only the 10 items on the
 * current page. After the fix, the sort is applied to all 15 items first,
 * then paginated — so page 1 shows items 1–10 of the global sort and page 2
 * shows items 11–15.
 */
export const DraftSortAcrossPages: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.WORKQUEUES.WORKQUEUE.buildPath({ slug: 'draft' })
    },
    msw: {
      handlers: {
        workqueues: [
          tRPCMsw.workqueue.config.list.query(() => {
            return generateWorkqueues('draft')
          }),
          tRPCMsw.workqueue.count.query((input) => {
            return input.reduce((acc, { slug }) => {
              return { ...acc, [slug]: 1 }
            }, {})
          })
        ],
        events: [tRPCMsw.event.search.query(() => ({ results: [], total: 0 }))],
        event: [
          tRPCMsw.event.draft.list.query(() => draftSortDrafts),
          tRPCMsw.event.get.query((input) => {
            const found = draftSortEventPairs.find(
              (p) => p.event.id === input
            )?.event
            if (!found) {
              throw new Error(`Event not found with id: ${input}`)
            }
            return found
          }),
          tRPCMsw.event.search.query(() => ({ results: [], total: 0 }))
        ],
        drafts: [tRPCMsw.event.draft.list.query(() => draftSortDrafts)],
        offline: { drafts: draftSortDrafts }
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    // Title format for tennis club membership: "{firstname} {surname}"
    const sortedTitles = draftSortFirstnames
      .map((firstname) => `${firstname} Smith`)
      .sort((a, b) => a.localeCompare(b))

    const TitleHeader = await canvas.findByText('Title', {}, { timeout: 5000 })
    await userEvent.click(TitleHeader)

    await step(
      'Page 1 shows the first 10 globally-sorted items (not page-local sort)',
      async () => {
        const rows = canvasElement.querySelectorAll('div[id^="row_"]')
        const nameCells = Array.from(rows).map(
          (row: Element) => row.firstElementChild?.textContent
        )
        await expect(nameCells).toStrictEqual(sortedTitles.slice(0, 10))
      }
    )

    await step(
      'Page 2 shows the remaining 5 globally-sorted items',
      async () => {
        const nextPageButton = await canvas.findByRole('button', {
          name: 'Next page'
        })
        await userEvent.click(nextPageButton)

        const rows = canvasElement.querySelectorAll('div[id^="row_"]')
        const nameCells = Array.from(rows).map(
          (row: Element) => row.firstElementChild?.textContent
        )
        await expect(nameCells).toStrictEqual(sortedTitles.slice(10))
      }
    )
  }
}
