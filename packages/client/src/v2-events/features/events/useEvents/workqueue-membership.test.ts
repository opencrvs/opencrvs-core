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

function respond(data: unknown) {
  return HttpResponse.json({ result: { data: serialize(data), type: 'data' } })
}

const server = setupServer(
  http.get('/api/events/event.search', () => {
    queueFetches++
    return respond({ results: queueOnServer, total: queueOnServer.length })
  }),
  http.get('/api/events/workqueue.count', () =>
    respond({ [SLUG]: queueOnServer.length })
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

  return {
    rows: () => queue.getCurrentResult().data?.results,
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
})
