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
import { focusManager, QueryObserver } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { queryClient } from '@client/v2-events/trpc'
import { RefetchGroup, useSharedRefetch } from './useSharedRefetch'

const POLL: RefetchGroup = { name: 'test-poll', intervalMs: 1000 }

/** An observed query that counts how often it is fetched. */
function observe(name: string) {
  const query = { queryKey: [name], fetches: 0 }
  const observer = new QueryObserver(queryClient, {
    queryKey: query.queryKey,
    queryFn: () => ++query.fetches,
    staleTime: Infinity
  })
  observer.subscribe(() => undefined)
  return query
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
})

afterEach(() => {
  focusManager.setFocused(undefined)
  queryClient.clear()
  vi.useRealTimers()
})

it('refetches every query in a group on the same tick', async () => {
  const counts = observe('counts')
  const queue = observe('queue')
  await vi.waitFor(() => expect(counts.fetches + queue.fetches).toBe(2))

  renderHook(() => useSharedRefetch(POLL, counts.queryKey))
  renderHook(() => useSharedRefetch(POLL, queue.queryKey))
  vi.advanceTimersByTime(POLL.intervalMs - 1)
  await Promise.resolve()
  expect(counts.fetches + queue.fetches).toBe(2)
  vi.advanceTimersByTime(1)

  await vi.waitFor(() => {
    expect(counts.fetches).toBe(2)
    expect(queue.fetches).toBe(2)
  })
})

it('polls a query that is alone in its group', async () => {
  const counts = observe('counts')
  await vi.waitFor(() => expect(counts.fetches).toBe(1))

  renderHook(() => useSharedRefetch(POLL, counts.queryKey))
  vi.advanceTimersByTime(POLL.intervalMs)

  await vi.waitFor(() => expect(counts.fetches).toBe(2))
})

it('ticks each group on its own interval', async () => {
  const SLOW_POLL: RefetchGroup = { name: 'slow-poll', intervalMs: 3000 }
  const counts = observe('counts')
  const queue = observe('queue')
  await vi.waitFor(() => expect(counts.fetches + queue.fetches).toBe(2))

  renderHook(() => useSharedRefetch(POLL, counts.queryKey))
  renderHook(() => useSharedRefetch(SLOW_POLL, queue.queryKey))
  vi.advanceTimersByTime(POLL.intervalMs)

  await vi.waitFor(() => expect(counts.fetches).toBe(2))
  expect(queue.fetches).toBe(1)
})

it('keeps polling a query after the other leaves the group', async () => {
  const counts = observe('counts')
  const queue = observe('queue')
  await vi.waitFor(() => expect(counts.fetches + queue.fetches).toBe(2))

  renderHook(() => useSharedRefetch(POLL, counts.queryKey))
  const queueHook = renderHook(() => useSharedRefetch(POLL, queue.queryKey))
  queueHook.unmount()
  vi.advanceTimersByTime(POLL.intervalMs)

  await vi.waitFor(() => expect(counts.fetches).toBe(2))
  expect(queue.fetches).toBe(1)
})

it('runs one tick for a group that empties and fills again', async () => {
  const counts = observe('counts')
  await vi.waitFor(() => expect(counts.fetches).toBe(1))

  renderHook(() => useSharedRefetch(POLL, counts.queryKey)).unmount()
  // Rejoin out of phase, so a timer left over would tick on its own.
  vi.advanceTimersByTime(POLL.intervalMs / 2)
  renderHook(() => useSharedRefetch(POLL, counts.queryKey))
  await vi.advanceTimersByTimeAsync(POLL.intervalMs)

  expect(counts.fetches).toBe(2)
})

it('skips the tick while the tab is hidden', async () => {
  const counts = observe('counts')
  await vi.waitFor(() => expect(counts.fetches).toBe(1))

  renderHook(() => useSharedRefetch(POLL, counts.queryKey))
  focusManager.setFocused(false)
  vi.advanceTimersByTime(POLL.intervalMs)

  await Promise.resolve()
  expect(counts.fetches).toBe(1)
})

it('leaves a refetch already in flight to finish', async () => {
  const counts = observe('counts')
  await vi.waitFor(() => expect(counts.fetches).toBe(1))
  renderHook(() => useSharedRefetch(POLL, counts.queryKey))

  // What a write's own refresh does, still in flight when the tick lands.
  void queryClient.refetchQueries({ queryKey: counts.queryKey })
  vi.advanceTimersByTime(POLL.intervalMs)

  await vi.waitFor(() =>
    expect(queryClient.isFetching({ queryKey: counts.queryKey })).toBe(0)
  )
  expect(counts.fetches).toBe(2)
})
