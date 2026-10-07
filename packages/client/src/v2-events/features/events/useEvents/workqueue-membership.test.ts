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
import { MutationKey, QueryObserver } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { serialize } from 'superjson'
import {
  ActionType,
  EventDocument,
  EventDocumentOnlyLastAction,
  EventIndex,
  QueryType,
  tennisClubMembershipEvent,
  WorkqueueCountInput
} from '@opencrvs/commons/client'
import { queryClient, trpcOptionsProxy } from '@client/v2-events/trpc'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { addLocalEventConfig } from './api'
import {
  byIdSearchOptions,
  taggedSearchOptions,
  byIdSearchKey,
  taggedKey
} from './procedures/search'

// Importing these registers each procedure's query and mutation defaults.
/* eslint-disable import/no-unassigned-import */
import './procedures/count'
import './procedures/create'
import './procedures/delete'
import './procedures/actions/action'
import './procedures/actions/customAction'
import '@client/v2-events/features/drafts/useDrafts'
/* eslint-enable import/no-unassigned-import */

const SLUG = 'in-review'
const record = tennisClubMembershipEventDocument
const row = { id: record.id } as EventIndex
const otherRow = { id: 'another-record' } as EventIndex
const query: QueryType = {
  type: 'and',
  clauses: [{ status: { type: 'exact', term: 'DECLARED' } }]
}
const countInput: WorkqueueCountInput = [{ slug: SLUG, query }]

const server = setupServer()

function respond(data: unknown) {
  return HttpResponse.json({ result: { data: serialize(data), type: 'data' } })
}

/**
 * Serves `queue` for every search and its size as the workqueue count, and
 * counts the requests it gets.
 */
function startServer(queue: EventIndex[]) {
  const fake = { queue, searchFetches: 0, countFetches: 0 }
  server.use(
    http.get('/api/events/event.search', () => {
      fake.searchFetches++
      return respond({ results: fake.queue, total: fake.queue.length })
    }),
    http.get('/api/events/workqueue.count', () => {
      fake.countFetches++
      return respond({ [SLUG]: fake.queue.length })
    })
  )
  return fake
}

/** The queue on screen and the sidebar counts, neither of them polling. */
async function mountWorkqueue(rows: EventIndex[]) {
  const fake = startServer(rows)
  const queueOptions = taggedSearchOptions({ query }, ['workqueue', SLUG])
  const queue = new QueryObserver(queryClient, queueOptions)
  const { queryFn: _queryFn, ...countOptions } =
    trpcOptionsProxy.workqueue.count.queryOptions(countInput)
  const count = new QueryObserver(queryClient, countOptions)
  const unsubscribe = [queue, count].map((observer) =>
    observer.subscribe(() => undefined)
  )

  await vi.waitFor(() => {
    expect(queue.getCurrentResult().data?.results).toEqual(rows)
    expect(count.getCurrentResult().data).toEqual({ [SLUG]: rows.length })
  })
  fake.searchFetches = 0
  fake.countFetches = 0

  return {
    fake,
    rows: () => queue.getCurrentResult().data?.results,
    isOutOfDate: () =>
      queryClient.getQueryState(queueOptions.queryKey)?.isInvalidated,
    unmount: () => unsubscribe.forEach((fn) => fn())
  }
}

function onSuccessOf(mutationKey: MutationKey) {
  const onSuccess = queryClient.getMutationDefaults(mutationKey).onSuccess as
    | ((...args: unknown[]) => unknown)
    | undefined
  if (!onSuccess) {
    throw new Error(`No onSuccess for ${JSON.stringify(mutationKey)}`)
  }
  return onSuccess
}

const { actions } = trpcOptionsProxy.event

/** The assign mutation answers with only the event's last action. */
const assigned = EventDocumentOnlyLastAction.parse({
  ...record,
  actions: record.actions
    .filter((action) => action.type === ActionType.ASSIGN)
    .slice(-1)
})

/**
 * Every write that can move a record between workqueues. PRINT_CERTIFICATE has
 * no onSuccess of its own: the queue follows from the UNASSIGN that ends it.
 */
const workqueueAffecting: Array<
  [string, MutationKey, (EventDocument | EventDocumentOnlyLastAction)?]
> = [
  ['ASSIGN', actions.assignment.assign.mutationKey(), assigned],
  ['DECLARE', actions.declare.request.mutationKey()],
  ['NOTIFY', actions.notify.request.mutationKey()],
  ['REGISTER', actions.register.request.mutationKey()],
  ['EDIT', actions.edit.request.mutationKey()],
  ['REJECT', actions.reject.request.mutationKey()],
  ['ARCHIVE', actions.archive.request.mutationKey()],
  ['UNARCHIVE', actions.unarchive.request.mutationKey()],
  ['CUSTOM', actions.custom.request.mutationKey()],
  ['REQUEST_CORRECTION', actions.correction.request.request.mutationKey()],
  ['APPROVE_CORRECTION', actions.correction.approve.request.mutationKey()],
  ['REJECT_CORRECTION', actions.correction.reject.request.mutationKey()],
  ['MARK_AS_DUPLICATE', actions.duplicate.markAsDuplicate.mutationKey()],
  ['MARK_AS_NOT_DUPLICATE', actions.duplicate.markNotDuplicate.mutationKey()],
  [
    'UNASSIGN (ends PRINT_CERTIFICATE)',
    actions.assignment.unassign.mutationKey()
  ],
  ['registerOnDeclare', [['registerOnDeclare']]],
  ['editAndRegister', [['editAndRegister']]],
  ['editAndDeclare', [['editAndDeclare']]],
  ['editAndNotify', [['editAndNotify']]],
  ['archiveOnDuplicate', [['archiveOnDuplicate']]],
  ['makeCorrectionOnRequest', [['makeCorrectionOnRequest']]]
]

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())

beforeEach(() => {
  global.caches = {
    keys: vi.fn().mockResolvedValue([])
  } as unknown as CacheStorage
  queryClient.clear()
  addLocalEventConfig(tennisClubMembershipEvent)
})

afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

describe('a mounted workqueue follows the server without waiting for the poll', () => {
  it.each(workqueueAffecting)(
    '%s: the record leaves the queue in one refetch, and the counts refresh',
    async (_action, mutationKey, response = record) => {
      const workqueue = await mountWorkqueue([row])

      workqueue.fake.queue = []
      await onSuccessOf(mutationKey)(response)

      await vi.waitFor(() => expect(workqueue.rows()).toEqual([]))
      expect(workqueue.fake.searchFetches).toBe(1)
      expect(workqueue.fake.countFetches).toBe(1)
      workqueue.unmount()
    }
  )

  it('a change that keeps the count the same still reaches the queue', async () => {
    const workqueue = await mountWorkqueue([row])

    workqueue.fake.queue = [otherRow]
    await onSuccessOf(actions.register.request.mutationKey())(record)

    await vi.waitFor(() => expect(workqueue.rows()).toEqual([otherRow]))
    workqueue.unmount()
  })

  it('marks every other queue out of date, and leaves other searches as they are', async () => {
    const result = { results: [otherRow], total: 1 }
    const offScreenQueue = taggedKey({ query }, ['workqueue', 'ready-to-print'])
    const adhocSearch = taggedKey({ query }, ['adhoc'])
    const otherLookup = byIdSearchKey(otherRow.id)
    for (const key of [offScreenQueue, adhocSearch, otherLookup]) {
      queryClient.setQueryData(key, result)
    }
    const workqueue = await mountWorkqueue([row])

    await onSuccessOf(actions.archive.request.mutationKey())(record)

    expect(queryClient.getQueryState(offScreenQueue)?.isInvalidated).toBe(true)
    for (const key of [adhocSearch, otherLookup]) {
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(false)
      expect(queryClient.getQueryData(key)).toEqual(result)
    }
    workqueue.unmount()
  })

  it("UNASSIGN fetches the record's open lookup once", async () => {
    const fake = startServer([row])
    const lookup = new QueryObserver(queryClient, {
      ...byIdSearchOptions(record.id, () => ({ results: [], total: 0 })),
      refetchInterval: false
    })
    const unsubscribe = lookup.subscribe(() => undefined)
    await vi.waitFor(() => expect(lookup.getCurrentResult().data).toBeDefined())
    fake.searchFetches = 0

    await onSuccessOf(actions.assignment.unassign.mutationKey())(record)

    expect(fake.searchFetches).toBe(1)
    unsubscribe()
  })

  it.each<[string, () => unknown]>([
    [
      'CREATE',
      () =>
        onSuccessOf(trpcOptionsProxy.event.create.mutationKey())(
          record,
          {},
          { transactionId: record.id }
        )
    ],
    [
      'DELETE',
      () => onSuccessOf(trpcOptionsProxy.event.delete.mutationKey())(record)
    ],
    [
      'DRAFT_SAVE',
      () => onSuccessOf(trpcOptionsProxy.event.draft.create.mutationKey())()
    ]
  ])('%s: the queue is not refetched', async (_action, fire) => {
    const workqueue = await mountWorkqueue([row])

    await fire()

    expect(workqueue.isOutOfDate()).toBe(false)
    expect(workqueue.fake.searchFetches).toBe(0)
    workqueue.unmount()
  })
})
