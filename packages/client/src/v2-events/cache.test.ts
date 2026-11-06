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
import { DocumentPath, UUID } from '@opencrvs/commons/client'

const eventId = '7a8b3c4d-5e6f-4a1b-8c2d-3e4f5a6b7c8d' as UUID
const userId = '1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f' as UUID

const recordFile = `events/${eventId}/a.png` as DocumentPath
const otherRecordFile = `events/${eventId}/b.png` as DocumentPath
const userFile = `users/${userId}/avatar.png` as DocumentPath

function signed(path: string) {
  return `https://minio.test/ocrvs/${path}?X-Amz-Signature=x`
}

/**
 * An in-memory stand-in for the service worker's CacheStorage, keyed by
 * absolute URL like the real one.
 */
function fakeCacheStorage() {
  const entries = new Map<string, Response>()
  const toAbsolute = (url: string) => new URL(url, window.location.origin).href

  const cache = {
    put: vi.fn(async (url: string, response: Response) => {
      entries.set(toAbsolute(url), response)
      return Promise.resolve()
    }),
    keys: vi.fn(async () =>
      Promise.resolve([...entries.keys()].map((url) => ({ url })))
    ),
    delete: vi.fn()
  }

  return {
    entries,
    storage: {
      keys: async () => Promise.resolve(['workbox-runtime']),
      open: async () => Promise.resolve(cache)
    }
  }
}

/**
 * Imports `./cache` fresh with the tRPC client mocked; the test setup has
 * already imported it, so a plain vi.mock wouldn't take effect.
 */
async function setup(urls: Record<string, string>) {
  const eventPresign = vi.fn(async () => Promise.resolve(urls))
  const userPresign = vi.fn(async () => Promise.resolve(urls))

  vi.resetModules()
  vi.doMock('@client/v2-events/trpc', () => ({
    isExpectedAccessError: () => false,
    trpcClient: {
      event: { files: { presign: { query: eventPresign } } },
      user: { files: { presign: { query: userPresign } } }
    }
  }))

  const { entries, storage } = fakeCacheStorage()
  vi.stubGlobal('caches', storage)
  const fetchMock = vi.fn(async () =>
    Promise.resolve(new Response('file-content'))
  )
  vi.stubGlobal('fetch', fetchMock)

  const cache = await import('./cache')

  const cachedPaths = () =>
    [...entries.keys()].map((url) => new URL(url).pathname.slice(1))

  return { cache, eventPresign, userPresign, fetchMock, cachedPaths }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.doUnmock('@client/v2-events/trpc')
})

describe('precacheFiles', () => {
  test('presigns the record once and caches each file under its own path', async () => {
    const { cache, eventPresign, fetchMock, cachedPaths } = await setup({
      [recordFile]: signed(recordFile),
      [otherRecordFile]: signed(otherRecordFile)
    })

    await cache.precacheFiles([recordFile, otherRecordFile], { eventId })

    expect(eventPresign).toHaveBeenCalledTimes(1)
    expect(eventPresign).toHaveBeenCalledWith({ eventId })
    expect(fetchMock).toHaveBeenCalledWith(signed(recordFile))
    expect(cachedPaths().sort()).toEqual([recordFile, otherRecordFile].sort())
  })

  test('presigns a user through the user endpoint', async () => {
    const { cache, userPresign, cachedPaths } = await setup({
      [userFile]: signed(userFile)
    })

    await cache.precacheFiles([userFile], { userId })

    expect(userPresign).toHaveBeenCalledWith({ userIds: [userId] })
    expect(cachedPaths()).toEqual([userFile])
  })

  test('makes no request when every file is already cached', async () => {
    const { cache, eventPresign } = await setup({
      [recordFile]: signed(recordFile)
    })
    await cache.precacheFiles([recordFile], { eventId })
    eventPresign.mockClear()

    await cache.precacheFiles([recordFile], { eventId })

    expect(eventPresign).not.toHaveBeenCalled()
  })

  test('leaves out a file the server did not sign', async () => {
    const { cache, fetchMock, cachedPaths } = await setup({
      [recordFile]: signed(recordFile)
    })

    await cache.precacheFiles([recordFile, otherRecordFile], { eventId })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(cachedPaths()).toEqual([recordFile])
  })
})

describe('precacheFile', () => {
  test('re-signs a record file through its record and caches only that file', async () => {
    const { cache, eventPresign, fetchMock, cachedPaths } = await setup({
      [recordFile]: signed(recordFile),
      [otherRecordFile]: signed(otherRecordFile)
    })

    await cache.precacheFile(recordFile)

    expect(eventPresign).toHaveBeenCalledWith({ eventId })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(cachedPaths()).toEqual([recordFile])
  })

  test('re-signs a user file through its user', async () => {
    const { cache, userPresign, cachedPaths } = await setup({
      [userFile]: signed(userFile)
    })

    await cache.precacheFile(userFile)

    expect(userPresign).toHaveBeenCalledWith({ userIds: [userId] })
    expect(cachedPaths()).toEqual([userFile])
  })

  test('makes no request for a path that names no record or user', async () => {
    const { cache, eventPresign, userPresign } = await setup({})

    await cache.precacheFile('a1b2c3d4.png' as DocumentPath)

    expect(eventPresign).not.toHaveBeenCalled()
    expect(userPresign).not.toHaveBeenCalled()
  })
})

describe('precacheUserFiles', () => {
  test('presigns several users at once and caches their files', async () => {
    const otherUserId = '9f8e7d6c-5b4a-4392-8170-6f5e4d3c2b1a' as UUID
    const otherUserFile = `users/${otherUserId}/avatar.png` as DocumentPath
    const { cache, userPresign, cachedPaths } = await setup({
      [userFile]: signed(userFile),
      [otherUserFile]: signed(otherUserFile)
    })

    await cache.precacheUserFiles([userId, otherUserId])

    expect(userPresign).toHaveBeenCalledTimes(1)
    expect(userPresign).toHaveBeenCalledWith({
      userIds: [userId, otherUserId]
    })
    expect(cachedPaths().sort()).toEqual([userFile, otherUserFile].sort())
  })
})
