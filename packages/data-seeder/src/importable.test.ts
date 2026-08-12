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

/**
 * The seeding modules must be importable.
 *
 * `src/index.ts` runs the seed at import time. While `./users` and
 * `./locations` still imported back into it, importing either one
 * authenticated against a live gateway, seeded, and deactivated the superuser
 * — so nothing in this package could be reached from a test.
 *
 * These tests pin the absence of that cycle by the only thing an outside
 * observer can see: the package's two ways of reaching the network. Both are
 * replaced with spies before any seeding module is loaded. Were the cycle
 * reintroduced, importing a seeding module would run the entry point's
 * `main()`, which calls `getToken()` — and therefore `node-fetch` —
 * synchronously, so the spy would record the call and these tests would fail.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const transport = vi.hoisted(() => ({
  fetch: vi.fn(async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({ token: 'a-token' })
  })),
  createTRPCClient: vi.fn(() => ({})),
  httpLink: vi.fn(() => ({}))
}))

vi.mock('node-fetch', () => ({ default: transport.fetch }))

vi.mock('@trpc/client', () => ({
  createTRPCClient: transport.createTRPCClient,
  httpLink: transport.httpLink
}))

beforeEach(() => {
  vi.resetModules()
  transport.fetch.mockClear()
  transport.createTRPCClient.mockClear()
  transport.httpLink.mockClear()

  // Keeps a `raise()` reached through a reintroduced cycle from taking the
  // test worker down with it before the assertions below have run.
  vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
    throw new Error(`process.exit(${code}) was called while importing`)
  }) as never)
})

describe('the seeding modules', () => {
  it('attempts no network call when ./users is imported', async () => {
    const users = await import('./users.js')

    expect(users.seedUsers).toBeTypeOf('function')
    expect(transport.fetch).not.toHaveBeenCalled()
    expect(transport.createTRPCClient).not.toHaveBeenCalled()
  })

  it('attempts no network call when ./locations is imported', async () => {
    const locations = await import('./locations.js')

    expect(locations.seedLocations).toBeTypeOf('function')
    expect(transport.fetch).not.toHaveBeenCalled()
    expect(transport.createTRPCClient).not.toHaveBeenCalled()
  })

  it('attempts no network call when ./application-config is imported', async () => {
    const applicationConfig = await import('./application-config.js')

    expect(applicationConfig.getApplicationConfig).toBeTypeOf('function')
    expect(transport.fetch).not.toHaveBeenCalled()
    expect(transport.createTRPCClient).not.toHaveBeenCalled()
  })

  it('builds no client when ./initialisation-client is imported', async () => {
    const { createInitialisationClient } = await import(
      './initialisation-client.js'
    )

    expect(createInitialisationClient).toBeTypeOf('function')
    expect(transport.createTRPCClient).not.toHaveBeenCalled()

    createInitialisationClient('a-token')

    // The spy is the one the module actually reaches for, so the assertions
    // above are about the seeding modules rather than about a stub that was
    // never wired up.
    expect(transport.createTRPCClient).toHaveBeenCalledTimes(1)
  })
})

describe('the network stubs', () => {
  it('replace the transport the seeding modules resolve', async () => {
    const nodeFetch = await import('node-fetch')
    const trpc = await import('@trpc/client')

    expect(nodeFetch.default).toBe(transport.fetch)
    expect(trpc.createTRPCClient).toBe(transport.createTRPCClient)
  })
})
