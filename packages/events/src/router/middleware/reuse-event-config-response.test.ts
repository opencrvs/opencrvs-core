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

import { expect, test, vi, type Mock } from 'vitest'
import { getInMemoryEventConfigurations } from '@events/service/config/config'
import { reuseEventConfigResponse } from './reuse-event-config-response'

const env = vi.hoisted(() => ({ isProduction: true }))

vi.mock('@events/environment', () => ({ env }))

vi.mock('@events/service/config/config', () => ({
  getInMemoryEventConfigurations: vi.fn()
}))

const mockedGetConfigurations = getInMemoryEventConfigurations as Mock

type MiddlewareOptions = Parameters<typeof reuseEventConfigResponse>[0]

// The middleware keeps its response across calls, so every test uses its own configuration array.
function useNewConfigurations() {
  const configurations = [{ id: crypto.randomUUID() }]
  mockedGetConfigurations.mockResolvedValue(configurations)
  return configurations
}

function okResult(data: unknown) {
  return { ok: true, data, marker: 'middlewareMarker' }
}

async function callMiddleware(next: Mock) {
  return reuseEventConfigResponse({
    next,
    ctx: { token: 'Bearer token' }
  } as unknown as MiddlewareOptions)
}

test('repeated calls with the same configurations build the response once', async () => {
  const configurations = useNewConfigurations()
  const next = vi.fn().mockResolvedValue(okResult(configurations))

  const first = await callMiddleware(next)
  const second = await callMiddleware(next)
  const third = await callMiddleware(next)

  expect(next).toHaveBeenCalledTimes(1)
  expect(second).toBe(first)
  expect(third).toBe(first)
})

test('concurrent calls share a single rebuild', async () => {
  const configurations = useNewConfigurations()
  let resolveNext: (value: unknown) => void = () => undefined
  const next = vi.fn(
    async () =>
      new Promise((resolve) => {
        resolveNext = resolve
      })
  )

  const calls = Array.from({ length: 20 }, async () => callMiddleware(next))
  // Let every call reach the cache check before the first rebuild finishes.
  await vi.waitFor(() => expect(next).toHaveBeenCalled())
  resolveNext(okResult(configurations))
  const results = await Promise.all(calls)

  expect(next).toHaveBeenCalledTimes(1)
  results.forEach((result) => expect(result).toBe(results[0]))
})

test('a new configurations array rebuilds the response', async () => {
  const oldConfigurations = useNewConfigurations()
  const next = vi.fn().mockResolvedValue(okResult(oldConfigurations))
  const oldResult = await callMiddleware(next)

  const newConfigurations = useNewConfigurations()
  next.mockResolvedValue(okResult(newConfigurations))
  const newResult = await callMiddleware(next)

  expect(next).toHaveBeenCalledTimes(2)
  expect(newResult).not.toBe(oldResult)
  expect(newResult).toEqual(okResult(newConfigurations))
})

test('a failed response is not reused', async () => {
  const configurations = useNewConfigurations()
  const failed = { ok: false, error: new Error('Output validation failed') }
  const next = vi
    .fn()
    .mockResolvedValueOnce(failed)
    .mockResolvedValue(okResult(configurations))

  expect(await callMiddleware(next)).toBe(failed)
  expect(await callMiddleware(next)).toEqual(okResult(configurations))
  expect(next).toHaveBeenCalledTimes(2)
})

test('outside production every call builds the response', async () => {
  env.isProduction = false
  try {
    const configurations = useNewConfigurations()
    const next = vi.fn().mockResolvedValue(okResult(configurations))

    await callMiddleware(next)
    await callMiddleware(next)

    expect(next).toHaveBeenCalledTimes(2)
  } finally {
    env.isProduction = true
  }
})
