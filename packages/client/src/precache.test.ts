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
import { PrecacheController } from 'workbox-precaching'
import { installPrecache } from './precache'

function manifest(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    url: `/assets/chunk-${i}.js`,
    revision: null
  }))
}

/*
 * Stands in for the network: every fetch the precache strategy starts stays
 * pending until the test settles it, so the test can count how many are in
 * flight at once. With `fail`, every fetch rejects instead.
 */
function controlledController(
  entries: Parameters<PrecacheController['addToCacheList']>[0],
  { fail = false } = {}
) {
  const controller = new PrecacheController()
  controller.addToCacheList(entries)

  const pending: { request: Request; resolve: () => void }[] = []
  const inFlight = { now: 0, max: 0 }
  vi.spyOn(controller.strategy, 'handleAll').mockImplementation(
    ({ request }) => {
      if (fail) {
        const failed = Promise.reject(new Error('bad-precaching-response'))
        return [failed, failed.then(() => undefined)]
      }
      inFlight.max = Math.max(inFlight.max, ++inFlight.now)
      const done = new Promise<void>((resolve) =>
        pending.push({
          request: request as Request,
          resolve: () => {
            inFlight.now--
            resolve()
          }
        })
      )
      return [done.then(() => new Response()), done]
    }
  )
  return { controller, pending, inFlight }
}

const event = { waitUntil: vi.fn() } as unknown as ExtendableEvent

async function settle(pending: { resolve: () => void }[]) {
  await new Promise((r) => setTimeout(r))
  while (pending.length) {
    pending.shift()!.resolve()
    await new Promise((r) => setTimeout(r))
  }
}

describe('installPrecache', () => {
  it.each([
    { concurrency: 1, entries: 5, maxInFlight: 1 },
    { concurrency: 3, entries: 10, maxInFlight: 3 },
    { concurrency: 4, entries: 4, maxInFlight: 4 },
    { concurrency: 6, entries: 2, maxInFlight: 2 }
  ])(
    'caches $entries entries with at most $maxInFlight in flight when concurrency is $concurrency',
    async ({ concurrency, entries, maxInFlight }) => {
      const { controller, pending, inFlight } = controlledController(
        manifest(entries)
      )

      const installed = installPrecache(controller, event, concurrency)
      await settle(pending)
      await installed

      expect(inFlight.max).toBe(maxInFlight)
      expect(controller.strategy.handleAll).toHaveBeenCalledTimes(entries)
    }
  )

  it('fetches revisioned entries past the HTTP cache and hashed ones through it', async () => {
    const { controller, pending } = controlledController([
      { url: '/index.html', revision: 'abc' },
      { url: '/assets/index-DNIA-jHU.js', revision: null }
    ])

    const installed = installPrecache(controller, event)
    await new Promise((r) => setTimeout(r))

    const modes = Object.fromEntries(
      pending.map(({ request }) => [
        new URL(request.url).pathname,
        request.cache
      ])
    )
    expect(modes).toEqual({
      '/index.html': 'reload',
      '/assets/index-DNIA-jHU.js': 'default'
    })

    await settle(pending)
    await installed
  })

  it("sends each entry's integrity and same-origin credentials", async () => {
    const integrity = 'sha384-abc'
    const { controller, pending } = controlledController([
      { url: '/assets/index-DNIA-jHU.js', revision: null, integrity }
    ])

    const installed = installPrecache(controller, event)
    await new Promise((r) => setTimeout(r))

    expect(pending[0].request).toMatchObject({
      integrity,
      credentials: 'same-origin'
    })

    await settle(pending)
    await installed
  })

  it('rejects when an entry fails to cache', async () => {
    const { controller } = controlledController(manifest(3), { fail: true })

    await expect(installPrecache(controller, event)).rejects.toThrow(
      'bad-precaching-response'
    )
  })
})
