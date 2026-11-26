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

import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import superjson from 'superjson'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { userEvent, within, expect, waitFor } from 'storybook/test'
import { TRPCError } from '@trpc/server'
import type { RequestHandler } from 'msw'
import {
  ActionType,
  createPrng,
  generateEventDocument,
  generateEventDraftDocument,
  generateWorkqueues,
  getCurrentEventState,
  tennisClubMembershipEvent,
  TestUserRole
} from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { testDataGenerator } from '@client/tests/test-data-generators'
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
            const found = allPairs.find(
              (p) => p.event.id === input.eventId
            )?.event
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

const resolvableRng = createPrng(9001)
const resolvableEvent = generateEventDocument({
  rng: resolvableRng,
  configuration: tennisClubMembershipEvent,
  actions: [{ type: ActionType.CREATE }]
})

const resolvableDraft = generateEventDraftDocument({
  eventId: resolvableEvent.id,
  actionType: ActionType.DECLARE,
  rng: resolvableRng,
  declaration: {
    'applicant.name': { firstname: 'Present', surname: 'Applicant' }
  }
})

const unresolvableRng = createPrng(9002)
const unresolvableEvent = generateEventDocument({
  rng: unresolvableRng,
  configuration: tennisClubMembershipEvent,
  actions: [{ type: ActionType.CREATE }]
})

const unresolvableDraft = generateEventDraftDocument({
  eventId: unresolvableEvent.id,
  actionType: ActionType.DECLARE,
  rng: unresolvableRng,
  declaration: {
    'applicant.name': { firstname: 'Missing', surname: 'Applicant' }
  }
})

const draftsWithOneUnresolvableEvent = [resolvableDraft, unresolvableDraft]

export const DraftCountMatchesListWhenEventUnavailable: Story = {
  parameters: {
    userRole: TestUserRole.enum.FIELD_AGENT,
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
          tRPCMsw.event.draft.list.query(() => draftsWithOneUnresolvableEvent),
          tRPCMsw.event.get.query((input) => {
            if (input.eventId === resolvableEvent.id) {
              return resolvableEvent
            }
            // Simulates an event that is no longer accessible to the user.
            throw new Error(`Event not found with id: ${input.eventId}`)
          }),
          tRPCMsw.event.search.query(() => ({ results: [], total: 0 }))
        ],
        drafts: [
          tRPCMsw.event.draft.list.query(() => draftsWithOneUnresolvableEvent)
        ],
        offline: { drafts: draftsWithOneUnresolvableEvent }
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('List shows only the draft whose event resolves', async () => {
      await canvas.findByText('Present Applicant', {}, { timeout: 5000 })
      await expect(
        canvas.queryByText('Missing Applicant')
      ).not.toBeInTheDocument()
    })

    await step(
      'Sidebar draft badge count matches the list (1, not 2)',
      async () => {
        const draftNav = await canvas.findByTestId(
          'navigation_workqueue_draft',
          {},
          { timeout: 5000 }
        )
        await expect(draftNav).toHaveTextContent(/^Drafts1$/)
      }
    )
  }
}

/*
 * Deleting a draft only clears it from the client's caches. `event.draft.list` keeps
 * serving it until the delete request lands, and the drafts workqueue refetches on every
 * mount, so an unfinished delete only stays off screen if the client suppresses it.
 */

const deleteRng = createPrng(9101)
const registrationAgent = testDataGenerator().user.registrationAgent().v2

const deletableEvent = generateEventDocument({
  rng: deleteRng,
  configuration: tennisClubMembershipEvent,
  actions: [
    {
      type: ActionType.CREATE,
      user: { id: registrationAgent.id, assignedTo: registrationAgent.id }
    },
    {
      type: ActionType.ASSIGN,
      user: { id: registrationAgent.id, assignedTo: registrationAgent.id }
    }
  ]
})

const deletableDraft = generateEventDraftDocument({
  eventId: deletableEvent.id,
  actionType: ActionType.DECLARE,
  rng: deleteRng,
  declaration: {
    'applicant.name': { firstname: 'Deleted', surname: 'Applicant' }
  }
})

/*
 * Lets a story wait for the workqueue's mount-time refetch to land before asserting.
 */
let draftListFetches = 0

const draftListHandler = tRPCMsw.event.draft.list.query(() => {
  draftListFetches += 1
  return [deletableDraft]
})

async function neverSettles(): Promise<never> {
  return new Promise(() => undefined)
}

/**
 * Starts on the record page, where the action menu offers Delete.
 */
function deleteFlowParameters(deleteHandler: RequestHandler) {
  return {
    userRole: TestUserRole.enum.REGISTRATION_AGENT,
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.AUDIT.buildPath({
        eventId: deletableEvent.id
      })
    },
    offline: {
      events: [deletableEvent],
      drafts: [deletableDraft]
    },
    msw: {
      handlers: {
        workqueues: [
          tRPCMsw.workqueue.config.list.query(() =>
            generateWorkqueues('draft')
          ),
          tRPCMsw.workqueue.count.query((input) =>
            input.reduce((acc, { slug }) => ({ ...acc, [slug]: 1 }), {})
          )
        ],
        event: [
          draftListHandler,
          tRPCMsw.event.get.query(() => deletableEvent),
          tRPCMsw.event.search.query(() => ({
            results: [
              getCurrentEventState(deletableEvent, tennisClubMembershipEvent)
            ],
            total: 1
          }))
        ],
        drafts: [draftListHandler],
        deleteEvent: [deleteHandler]
      }
    }
  }
}

/**
 * Deletes the record from its action menu and opens the drafts workqueue, the way exiting
 * a delete lands the user on a list.
 *
 * @returns drafts-list fetches served before the workqueue mounted.
 */
async function deleteRecordAndOpenDrafts(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)

  const actionMenu = await canvas.findByTestId(
    'action-dropdownMenu',
    {},
    { timeout: 5000 }
  )
  void actionMenu.click()

  const deleteItem = await waitFor(() => {
    const menu = document.querySelector('#action-Dropdown-Content')
    const item = Array.from(menu?.querySelectorAll('li') ?? []).find((li) =>
      li.textContent.includes('Delete')
    )

    if (!item) {
      throw new Error('Delete action not found in the record action menu')
    }

    return item
  })

  await userEvent.click(deleteItem)

  const confirmDelete = await waitFor(() => {
    const button = document.querySelector('#confirm_delete')

    if (!button) {
      throw new Error('Delete confirmation button not found')
    }

    return button
  })

  await userEvent.click(confirmDelete)

  const draftNav = await canvas.findByTestId(
    'navigation_workqueue_draft',
    {},
    { timeout: 5000 }
  )

  const fetchesBeforeMount = draftListFetches
  // Mounts the drafts workqueue, which refetches `event.draft.list` from the server.
  await userEvent.click(draftNav)

  return fetchesBeforeMount
}

export const PendingDeleteStaysOutOfDraftsListAndBadge: Story = {
  parameters: deleteFlowParameters(tRPCMsw.event.delete.mutation(neverSettles)),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    let fetchesBeforeMount = 0

    await step('Delete the draft from the record action menu', async () => {
      fetchesBeforeMount = await deleteRecordAndOpenDrafts(canvasElement)
    })

    await step(
      'Drafts workqueue and badge omit the draft while the delete is in flight',
      async () => {
        await canvas.findByText('No records in drafts', {}, { timeout: 10000 })

        // The server has served the draft again. Asserting before this lands would
        // pass on the optimistic removal alone and miss the reappearance entirely.
        await waitFor(
          async () =>
            expect(draftListFetches).toBeGreaterThan(fetchesBeforeMount),
          { timeout: 10000 }
        )

        await expect(
          canvas.findByText('Deleted Applicant', {}, { timeout: 3000 })
        ).rejects.toThrow()

        const draftNav = await canvas.findByTestId('navigation_workqueue_draft')
        await expect(draftNav).toHaveTextContent(/^Drafts$/)
      }
    )
  }
}

export const FailedDeletePutsTheDraftBack: Story = {
  parameters: deleteFlowParameters(
    tRPCMsw.event.delete.mutation(() => {
      throw new TRPCError({ code: 'BAD_REQUEST' })
    })
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Delete the draft from the record action menu', async () => {
      await deleteRecordAndOpenDrafts(canvasElement)
    })

    await step(
      'Drafts workqueue and badge show the draft again once the delete has failed',
      async () => {
        await canvas.findByText('Deleted Applicant', {}, { timeout: 10000 })

        const draftNav = await canvas.findByTestId('navigation_workqueue_draft')
        await expect(draftNav).toHaveTextContent(/^Drafts1$/)
      }
    )
  }
}
