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
import { renderHook, act } from '@testing-library/react'
import { onlineManager } from '@tanstack/react-query'
import createFetchMock from 'vitest-fetch-mock'
import { useNetworkProbe } from './config'

const fetchMock = createFetchMock(vi)
fetchMock.enableMocks()

const ALL_SERVICES_HEALTHY = {
  auth: true,
  search: true,
  'user-mgnt': true,
  metrics: true,
  notification: true,
  countryconfig: true,
  workflow: true
}

// fetch-mock resolves as microtasks; act() flushes them without advancing fake timers
async function flushFetch() {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  await act(async () => {})
}

beforeEach(() => {
  vi.useFakeTimers()
  onlineManager.setOnline(true)
  fetchMock.resetMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useNetworkProbe', () => {
  it('sets offline immediately on mount, then online when all services are healthy', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(ALL_SERVICES_HEALTHY))

    const { unmount } = renderHook(() => useNetworkProbe())

    expect(onlineManager.isOnline()).toBe(false)

    await flushFetch()

    expect(onlineManager.isOnline()).toBe(true)
    unmount()
  })

  it('remains offline when a service is not ready', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ ...ALL_SERVICES_HEALTHY, metrics: false })
    )

    const { unmount } = renderHook(() => useNetworkProbe())

    await flushFetch()

    expect(onlineManager.isOnline()).toBe(false)
    unmount()
  })

  it('remains offline when fetch throws a network error', async () => {
    fetchMock.mockRejectOnce(new Error('Network error'))

    const { unmount } = renderHook(() => useNetworkProbe())

    await flushFetch()

    expect(onlineManager.isOnline()).toBe(false)
    unmount()
  })

  it('retries the probe every 5 seconds while offline', async () => {
    fetchMock.mockRejectOnce(new Error('Network error'))
    fetchMock.mockResponseOnce(JSON.stringify(ALL_SERVICES_HEALTHY))

    const { unmount } = renderHook(() => useNetworkProbe())

    await flushFetch()
    expect(onlineManager.isOnline()).toBe(false)

    await act(async () => {
      vi.advanceTimersByTime(5000)
    })
    await flushFetch()

    expect(onlineManager.isOnline()).toBe(true)
    unmount()
  })

  it('does not run concurrent probes', async () => {
    let resolveFirst!: (value: Response) => void
    const slowFetch = new Promise<Response>((resolve) => {
      resolveFirst = resolve
    })
    fetchMock.mockImplementationOnce(() => slowFetch)
    fetchMock.mockResponseOnce(JSON.stringify(ALL_SERVICES_HEALTHY))

    const { unmount } = renderHook(() => useNetworkProbe())

    await act(async () => {
      vi.advanceTimersByTime(5000)
    })

    expect(fetch).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveFirst(
        new Response(JSON.stringify(ALL_SERVICES_HEALTHY), { status: 200 })
      )
    })
    await flushFetch()
    unmount()
  })

  it('clears the retry interval once online', async () => {
    fetchMock.mockResponse(JSON.stringify(ALL_SERVICES_HEALTHY))

    const { unmount } = renderHook(() => useNetworkProbe())

    await flushFetch()
    expect(onlineManager.isOnline()).toBe(true)

    const callsAfterOnline = fetchMock.mock.calls.length

    await act(async () => {
      vi.advanceTimersByTime(20000)
    })
    await flushFetch()

    expect(fetchMock.mock.calls.length).toBe(callsAfterOnline)
    unmount()
  })

  it('aborts the in-flight fetch and clears the interval on unmount', async () => {
    const abortSpy = vi.fn()
    const controller = { abort: abortSpy, signal: new AbortController().signal }
    const OriginalAbortController = global.AbortController
    global.AbortController = vi.fn(
      () => controller
    ) as unknown as typeof AbortController

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    fetchMock.mockImplementationOnce(() => new Promise<Response>(() => {}))

    const { unmount } = renderHook(() => useNetworkProbe())

    unmount()

    expect(abortSpy).toHaveBeenCalled()
    global.AbortController = OriginalAbortController
  })
})
