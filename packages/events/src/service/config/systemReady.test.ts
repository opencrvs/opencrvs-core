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

import fetch from 'node-fetch'
import { getIntegrationCreatorToken } from '@events/service/auth'
import { triggerSystemReady } from './systemReady'

vi.mock('node-fetch', () => ({ default: vi.fn() }))
vi.mock('@events/service/auth', () => ({
  getIntegrationCreatorToken: vi.fn()
}))

const mockFetch = vi.mocked(fetch)
const mockGetToken = vi.mocked(getIntegrationCreatorToken)

function response(status: number) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => Promise.resolve('')
  } as unknown as Awaited<ReturnType<typeof fetch>>
}

/** Fast-forwards through the backoff sleeps instead of waiting them out */
async function runWithoutWaiting(promise: Promise<void>) {
  await vi.runAllTimersAsync()
  return promise
}

describe('triggerSystemReady', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockGetToken.mockResolvedValue('bootstrap-token')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('calls the country config trigger with a bootstrap token', async () => {
    mockFetch.mockResolvedValue(response(200))

    await runWithoutWaiting(triggerSystemReady())

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, options] = mockFetch.mock.calls[0]
    expect(String(url)).toContain('/trigger/system/ready')
    expect(options?.headers).toMatchObject({
      Authorization: 'Bearer bootstrap-token'
    })
    // A peer that accepts the connection but never answers must not hang the loop
    expect(options?.timeout).toBeGreaterThan(0)
  })

  test('bounds the bootstrap token request too', async () => {
    mockFetch.mockResolvedValue(response(200))

    await runWithoutWaiting(triggerSystemReady())

    // The loop can only retry a call that fails. Auth and events start
    // concurrently, and an unbounded token request parks every attempt on the
    // first one forever — silently, since nothing is logged until an attempt
    // settles. That leaves integrations unregistered with no trace anywhere.
    expect(mockGetToken).toHaveBeenCalledWith(expect.any(Number))
    expect(mockGetToken.mock.calls[0][0]).toBeGreaterThan(0)
  })

  test('retries when minting the bootstrap token fails', async () => {
    mockGetToken.mockRejectedValueOnce(new Error('ETIMEDOUT'))
    mockFetch.mockResolvedValue(response(200))

    await runWithoutWaiting(triggerSystemReady())

    expect(mockGetToken).toHaveBeenCalledTimes(2)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  test('retries until the country config is listening', async () => {
    // Events and the country config start concurrently, so the first attempts
    // routinely hit a closed port
    mockFetch
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
      .mockResolvedValueOnce(response(200))

    await runWithoutWaiting(triggerSystemReady())

    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  test('retries a failing status response', async () => {
    mockFetch
      .mockResolvedValueOnce(response(500))
      .mockResolvedValueOnce(response(200))

    await runWithoutWaiting(triggerSystemReady())

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  test('mints a fresh short-lived token for every attempt', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
      .mockResolvedValueOnce(response(200))

    await runWithoutWaiting(triggerSystemReady())

    expect(mockGetToken).toHaveBeenCalledTimes(2)
  })

  test.each([404, 501])(
    'does not retry %i, which means the trigger is not implemented',
    async (status) => {
      mockFetch.mockResolvedValue(response(status))

      await runWithoutWaiting(triggerSystemReady())

      expect(mockFetch).toHaveBeenCalledTimes(1)
    }
  )

  test('gives up after the attempt limit rather than retrying forever or throwing', async () => {
    mockFetch.mockRejectedValue(new Error('ECONNREFUSED'))

    await expect(
      runWithoutWaiting(triggerSystemReady())
    ).resolves.toBeUndefined()
    expect(mockFetch).toHaveBeenCalledTimes(10)
  })
})
