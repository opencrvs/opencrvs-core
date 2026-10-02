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
import { MutationKey } from '@tanstack/react-query'
import {
  ActionType,
  EventDocumentOnlyLastAction,
  EventIndex,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { queryClient, trpcOptionsProxy } from '@client/v2-events/trpc'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import {
  addLocalEventConfig,
  findLocalEventDocument,
  findLocalEventIndex,
  setEventData
} from './api'
import { searchKeys } from './procedures/search'

// Importing these registers each procedure's mutation defaults.
/* eslint-disable import/no-unassigned-import */
import './procedures/create'
import './procedures/delete'
import './procedures/actions/action'
/* eslint-enable import/no-unassigned-import */

const record = tennisClubMembershipEventDocument

function defaultsOf(mutationKey: MutationKey) {
  return queryClient.getMutationDefaults(mutationKey) as {
    onMutate: (...args: unknown[]) => unknown
    onSuccess: (...args: unknown[]) => unknown
  }
}

beforeEach(() => {
  global.caches = {
    keys: vi.fn().mockResolvedValue([])
  } as unknown as CacheStorage
  queryClient.clear()
  addLocalEventConfig(tennisClubMembershipEvent)
})

it('CREATE offline: the new record resolves by its temporary id', () => {
  const transactionId = 'tmp-offline-create'

  defaultsOf(trpcOptionsProxy.event.create.mutationKey()).onMutate({
    transactionId,
    type: tennisClubMembershipEvent.id
  })

  expect(findLocalEventIndex(transactionId)?.id).toBe(transactionId)
})

it('CREATE: once synced, the record also resolves by its final id', () => {
  const transactionId = 'tmp-synced-create'

  defaultsOf(trpcOptionsProxy.event.create.mutationKey()).onSuccess(
    record,
    {},
    { transactionId }
  )

  for (const id of [record.id, transactionId]) {
    expect(queryClient.getQueryData(searchKeys.byId(id))?.results).toEqual([
      expect.objectContaining({ id: record.id })
    ])
  }
})

it('ASSIGN on a sealed record patches only the assignee onto its cached row', async () => {
  const assigned = EventDocumentOnlyLastAction.parse({
    ...record,
    actions: record.actions
      .filter((action) => action.type === ActionType.ASSIGN)
      .slice(-1)
  })
  const redactedRow = {
    id: record.id,
    declaration: {},
    assignedTo: null
  } as unknown as EventIndex
  const workqueueKey = searchKeys.workqueue(
    { query: { type: 'and', clauses: [] } },
    'ready'
  )
  queryClient.setQueryData(workqueueKey, { results: [redactedRow], total: 1 })
  setEventData(record.id, record)

  await defaultsOf(
    trpcOptionsProxy.event.actions.assignment.assign.mutationKey()
  ).onSuccess(assigned)

  const assignment = assigned.actions[0] as { assignedTo: string }
  expect(queryClient.getQueryData(workqueueKey)?.results).toEqual([
    { ...redactedRow, assignedTo: assignment.assignedTo }
  ])
})

it('MARK_AS_NOT_DUPLICATE keeps the local record', async () => {
  setEventData(record.id, record)

  await defaultsOf(
    trpcOptionsProxy.event.actions.duplicate.markNotDuplicate.mutationKey()
  ).onSuccess(record)

  expect(findLocalEventDocument(record.id)).toBeDefined()
})
