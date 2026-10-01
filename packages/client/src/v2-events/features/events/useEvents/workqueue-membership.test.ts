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
import { byIdSearchOptions, scopedSearchOptions } from './procedures/search'

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

/** What the server currently returns for the workqueue. */
let queueOnServer: EventIndex[] = []
let queueFetches = 0
/** Response delays, to choose which of the queue and the counts lands first. */
let delays = { search: 0, count: 0 }
let inFlight = 0
let maxInFlight = 0

async function respond(data: unknown, delay: number) {
  inFlight++
  maxInFlight = Math.max(maxInFlight, inFlight)
  await new Promise((resolve) => setTimeout(resolve, delay))
  inFlight--
  return HttpResponse.json({ result: { data: serialize(data), type: 'data' } })
}

const server = setupServer(
  http.get('/api/events/event.search', async () => {
    queueFetches++
    return respond(
      { results: queueOnServer, total: queueOnServer.length },
      delays.search
    )
  }),
  http.get('/api/events/workqueue.count', async () =>
    respond({ [SLUG]: queueOnServer.length }, delays.count)
  )
)

async function mountWorkqueue(rows: EventIndex[]) {
  queueOnServer = rows
  const queue = new QueryObserver(queryClient, {
    ...scopedSearchOptions({ query }, ['workqueue', SLUG]),
    refetchInterval: false
  })
  const { queryFn: _queryFn, ...countOptions } =
    trpcOptionsProxy.workqueue.count.queryOptions(countInput)
  const count = new QueryObserver(queryClient, {
    ...countOptions,
    refetchInterval: false
  })
  const unsubscribe = [queue, count].map((observer) =>
    observer.subscribe(() => undefined)
  )

  await vi.waitFor(() => {
    expect(queue.getCurrentResult().data?.results).toEqual(rows)
    expect(count.getCurrentResult().data).toEqual({ [SLUG]: rows.length })
  })
  queueFetches = 0
  maxInFlight = 0

  return {
    rows: () => queue.getCurrentResult().data?.results,
    /** What the sidebar's 20 s poll does: refetch the counts. */
    pollCounts: async () => count.refetch(),
    /** What the queue's own poll does. */
    pollQueue: async () => queue.refetch(),
    unmount: () => unsubscribe.forEach((fn) => fn())
  }
}

/** The overview's lookup of `record`, as mounted on its page. */
function mountLookup() {
  const lookup = new QueryObserver(queryClient, {
    ...byIdSearchOptions(record.id, () => ({ results: [], total: 0 })),
    refetchInterval: false
  })
  return lookup.subscribe(() => undefined)
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
  delays = { search: 0, count: 0 }
})

afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

describe('a mounted workqueue follows the server without waiting for the poll', () => {
  it.each(workqueueAffecting)(
    '%s: the record leaves the queue in one refetch',
    async (_action, mutationKey, response = record) => {
      const workqueue = await mountWorkqueue([row])

      queueOnServer = []
      await onSuccessOf(mutationKey)(response)

      await vi.waitFor(() => expect(workqueue.rows()).toEqual([]))
      expect(queueFetches).toBe(1)
      workqueue.unmount()
    }
  )

  it.each(workqueueAffecting)(
    '%s: a same-count swap reaches the queue',
    async (_action, mutationKey, response = record) => {
      const workqueue = await mountWorkqueue([row])

      queueOnServer = [otherRow]
      await onSuccessOf(mutationKey)(response)

      await vi.waitFor(() => expect(workqueue.rows()).toEqual([otherRow]))
      expect(queueFetches).toBe(1)
      workqueue.unmount()
    }
  )

  it('ASSIGN: the record enters an assigned-to-me queue', async () => {
    const workqueue = await mountWorkqueue([])

    queueOnServer = [row]
    await onSuccessOf(actions.assignment.assign.mutationKey())(assigned)

    await vi.waitFor(() => expect(workqueue.rows()).toEqual([row]))
    expect(queueFetches).toBe(1)
    workqueue.unmount()
  })

  it.each<[string, MutationKey, EventDocument | EventDocumentOnlyLastAction]>([
    ['ASSIGN', actions.assignment.assign.mutationKey(), assigned],
    ['UNASSIGN', actions.assignment.unassign.mutationKey(), record]
  ])(
    '%s from the overview: one lookup fetch, no queue fetch',
    async (_action, mutationKey, response) => {
      queueOnServer = [row]
      const lookup = new QueryObserver(queryClient, {
        ...byIdSearchOptions(record.id, () => ({ results: [], total: 0 })),
        refetchInterval: false
      })
      const unsubscribe = lookup.subscribe(() => undefined)
      await vi.waitFor(() =>
        expect(lookup.getCurrentResult().data).toBeDefined()
      )
      queueFetches = 0

      await onSuccessOf(mutationKey)(response)
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(queueFetches).toBe(1)
      unsubscribe()
    }
  )

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
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(queueFetches).toBe(0)
    workqueue.unmount()
  })

  it.each<[string, { search: number; count: number }]>([
    ['the counts answer first', { search: 100, count: 10 }],
    ['the queue answers first', { search: 10, count: 100 }]
  ])(
    'the queue and the counts are fetched together, the queue once, when %s',
    async (_order, responseDelays) => {
      const workqueue = await mountWorkqueue([row])
      delays = responseDelays

      queueOnServer = []
      await onSuccessOf(actions.register.request.mutationKey())(record)

      await vi.waitFor(() => expect(workqueue.rows()).toEqual([]))
      await new Promise((resolve) => setTimeout(resolve, 150))
      expect(maxInFlight).toBe(2)
      expect(queueFetches).toBe(1)
      workqueue.unmount()
    }
  )

  it("the record's lookup goes out together with the queue and the counts", async () => {
    const workqueue = await mountWorkqueue([row])
    const unmountLookup = mountLookup()
    await vi.waitFor(() => expect(queueFetches).toBe(1))
    delays = { search: 50, count: 50 }
    maxInFlight = 0

    await onSuccessOf(actions.register.request.mutationKey())(record)

    await vi.waitFor(() => expect(maxInFlight).toBe(3))
    unmountLookup()
    workqueue.unmount()
  })
})

describe('the sidebar poll keeps the queue on screen in step with its count', () => {
  it('refreshes the queue when its count changes', async () => {
    const workqueue = await mountWorkqueue([row])

    queueOnServer = []
    await workqueue.pollCounts()

    await vi.waitFor(() => expect(workqueue.rows()).toEqual([]))
    expect(queueFetches).toBe(1)
    workqueue.unmount()
  })

  it('refreshes the queue when its own poll went out before the change', async () => {
    const workqueue = await mountWorkqueue([row])
    delays = { search: 100, count: 10 }

    const stalePoll = workqueue.pollQueue()
    await vi.waitFor(() => expect(inFlight).toBe(1))
    queueOnServer = []
    await workqueue.pollCounts()
    await stalePoll

    await vi.waitFor(() => expect(workqueue.rows()).toEqual([]))
    workqueue.unmount()
  })
})
