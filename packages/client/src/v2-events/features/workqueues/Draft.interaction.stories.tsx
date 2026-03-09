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
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

// applyDraftToEventIndex sets updatedAt = draft.createdAt, so controlling
// draft.createdAt is how we control the sort order.
const OLD_DATE = '2020-01-01T00:00:00.000Z'
const RECENT_DATE = '2025-01-01T00:00:00.000Z'

// 5 OLD drafts placed FIRST in the array.
// Without the orderBy fix these would occupy the first 5 slots on page 1.
// With the fix they must be pushed to page 2 because they are least-recently updated.
const oldPairs = Array.from({ length: 5 }, (_, i) => {
  const rng = createPrng(i * 100 + 1)
  const event = generateEventDocument({
    rng,
    configuration: tennisClubMembershipEvent,
    actions: [{ type: ActionType.CREATE }]
  })
  return {
    event,
    draft: {
      ...generateEventDraftDocument({
        eventId: event.id,
        actionType: ActionType.DECLARE,
        rng,
        declaration: {
          'applicant.name': { firstname: 'Old', surname: 'Smith' }
        }
      }),
      createdAt: OLD_DATE,
      updatedAt: OLD_DATE
    }
  }
})

// 10 RECENT drafts placed SECOND in the array.
const recentPairs = Array.from({ length: 10 }, (_, i) => {
  const rng = createPrng(i * 100 + 501)
  const event = generateEventDocument({
    rng,
    configuration: tennisClubMembershipEvent,
    actions: [{ type: ActionType.CREATE }]
  })
  return {
    event,
    draft: {
      ...generateEventDraftDocument({
        eventId: event.id,
        actionType: ActionType.DECLARE,
        rng,
        declaration: {
          'applicant.name': { firstname: 'Recent', surname: 'Smith' }
        }
      }),
      createdAt: RECENT_DATE,
      updatedAt: RECENT_DATE
    }
  }
})

// Old drafts come first in the raw array — without the fix they'd appear on page 1.
const allPairs = [...oldPairs, ...recentPairs]
const allDrafts = allPairs.map((p) => p.draft)

/**
 * Verifies that the draft workqueue is sorted by updatedAt descending before
 * pagination, consistent with how other workqueues behave (server-side sort).
 *
 * Setup: 5 "Old Smith" drafts (createdAt = 2020) placed FIRST in the array,
 * followed by 10 "Recent Smith" drafts (createdAt = 2025).
 *
 * Without the fix, page 1 would show 5 old + 5 recent (raw array order).
 * With the fix, page 1 shows all 10 recent, and page 2 shows all 5 old.
 */
export const DraftDefaultSortByUpdatedAt: Story = {
  tags: ['draft-sort'],
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
          tRPCMsw.event.draft.list.query(() => allDrafts),
          tRPCMsw.event.get.query((input) => {
            const found = allPairs.find((p) => p.event.id === input)?.event
            if (!found) {
              throw new Error(`Event not found with id: ${input}`)
            }
            return found
          }),
          tRPCMsw.event.search.query(() => ({ results: [], total: 0 }))
        ],
        drafts: [tRPCMsw.event.draft.list.query(() => allDrafts)],
        offline: { drafts: allDrafts }
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Page 1 shows the 10 most-recently-updated drafts (no old drafts)',
      async () => {
        const recentRows = await canvas.findAllByText(
          'Recent Smith',
          {},
          { timeout: 5000 }
        )
        await expect(recentRows).toHaveLength(10)
        await expect(canvas.queryAllByText('Old Smith')).toHaveLength(0)
      }
    )

    await step(
      'Page 2 shows the 5 least-recently-updated drafts (no recent drafts)',
      async () => {
        await canvas.findByRole(
          'button',
          { name: 'Next page' },
          { timeout: 5000 }
        )
        await userEvent.click(canvas.getByRole('button', { name: 'Next page' }))

        const oldRows = await canvas.findAllByText(
          'Old Smith',
          {},
          { timeout: 5000 }
        )
        await expect(oldRows).toHaveLength(5)
        await expect(canvas.queryAllByText('Recent Smith')).toHaveLength(0)
      }
    )
  }
}
