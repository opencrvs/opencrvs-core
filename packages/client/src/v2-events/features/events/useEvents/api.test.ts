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
import {
  tennisClubMembershipEvent,
  EventDocument,
  EventIndex
} from '@opencrvs/commons/client'
import { queryClient, trpcOptionsProxy } from '@client/v2-events/trpc'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { addLocalEventConfig, updateLocalEventIndex } from './api'

describe('updateLocalEventIndex', () => {
  beforeEach(() => {
    queryClient.clear()
    addLocalEventConfig(tennisClubMembershipEvent)
  })

  afterAll(() => {
    queryClient.clear()
  })

  it('preserves total count in cached queries after update', () => {
    const eventDocument = tennisClubMembershipEventDocument

    // Prepare a cached query simulating a workqueue result
    const queryKey = trpcOptionsProxy.event.search.queryKey({
      query: { type: 'and', clauses: [{ status: 'PENDING' }] }
    })

    queryClient.setQueryData(queryKey, {
      total: 13,
      results: [
        { id: 'abc', status: 'PENDING' },
        { id: eventDocument.id, status: 'PENDING' },
        { id: 'def', status: 'REGISTERED' }
      ] as EventIndex[]
    })

    // Call the update
    updateLocalEventIndex(eventDocument.id, {
      ...eventDocument,
      status: 'REGISTERED'
    } as EventDocument)

    // Re-fetch cache
    const updated = queryClient.getQueryData(queryKey)

    // total must NOT be overwritten by results.length (which is 3)
    expect(updated?.total).toBe(13)

    // the event status should update correctly
    const updatedEvent = updated?.results.find((r) => r.id === eventDocument.id)
    expect(updatedEvent?.status).toBe('REGISTERED')

    // unrelated events untouched
    expect(updated?.results.find((r) => r.id === 'def')?.status).toBe(
      'REGISTERED'
    )
    expect(updated?.results.find((r) => r.id === 'abc')?.status).toBe('PENDING')
  })
})
