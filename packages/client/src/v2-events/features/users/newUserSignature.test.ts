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
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import superjson from 'superjson'
import { vi } from 'vitest'
import { DocumentPath, getUUID, UUID } from '@opencrvs/commons/client'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { AppRouter } from '@client/v2-events/trpc'
import { createTemporaryId } from '@client/v2-events/utils'
import { saveNewUserSignature } from './newUserSignature'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const uploads: { path: string; transactionId: string }[] = []
const updateUserSpy = vi.fn()

const server = setupServer(
  http.post('/api/upload', async ({ request }) => {
    const formData = await request.formData()
    const path = String(formData.get('path'))
    const transactionId = String(formData.get('transactionId'))
    uploads.push({ path, transactionId })

    return HttpResponse.text(`${path}${transactionId}.png`)
  }),
  tRPCMsw.user.update.mutation((input) => {
    updateUserSpy(input)
    return {
      ...testDataGenerator().user.registrationAgent().v2,
      id: input.id as UUID,
      signature: input.signature?.path as DocumentPath | undefined
    }
  })
)

/**
 * The service worker cache does not exist in jsdom. This fake keeps the cached
 * responses in a map, by URL.
 */
const cachedFiles = new Map<string, Response>()
const fakeCache = {
  match: async (url: string) => cachedFiles.get(url)?.clone(),
  put: async (url: string, response: Response) => {
    cachedFiles.set(url, response)
  },
  delete: async (url: string) => cachedFiles.delete(url)
}

beforeAll(() => {
  vi.stubGlobal('caches', {
    keys: async () => ['workbox-runtime-test'],
    open: async () => fakeCache
  })
  server.listen()
})
afterEach(() => {
  server.resetHandlers()
  uploads.length = 0
  updateUserSpy.mockReset()
  cachedFiles.clear()
})
afterAll(() => {
  server.close()
  vi.unstubAllGlobals()
})

describe('saveNewUserSignature', () => {
  const userId = getUUID() as UUID
  const temporaryPath =
    `users/${createTemporaryId()}/0f5c7e1a-signature.png` as DocumentPath
  const signature = {
    path: temporaryPath,
    originalFilename: 'sign1.png',
    type: 'image/png'
  }

  test('uploads the cached signature under the user id and stores the new path on the user', async () => {
    cachedFiles.set(
      `/${temporaryPath}`,
      new Response('signature', { headers: { 'Content-Type': 'image/png' } })
    )

    await saveNewUserSignature({ userId, signature })

    expect(uploads).toEqual([
      { path: `users/${userId}/`, transactionId: '0f5c7e1a-signature' }
    ])
    expect(updateUserSpy).toHaveBeenCalledWith({
      id: userId,
      signature: {
        ...signature,
        path: `users/${userId}/0f5c7e1a-signature.png`
      }
    })
  })

  test('moves the cached file to the new path', async () => {
    cachedFiles.set(
      `/${temporaryPath}`,
      new Response('signature', { headers: { 'Content-Type': 'image/png' } })
    )

    await saveNewUserSignature({ userId, signature })

    expect([...cachedFiles.keys()]).toEqual([
      `/users/${userId}/0f5c7e1a-signature.png`
    ])
  })

  test('keeps the cached file when the update fails, so that a retry can read it', async () => {
    server.use(
      tRPCMsw.user.update.mutation(() => {
        throw new Error('update failed')
      })
    )
    cachedFiles.set(
      `/${temporaryPath}`,
      new Response('signature', { headers: { 'Content-Type': 'image/png' } })
    )

    await expect(
      saveNewUserSignature({ userId, signature })
    ).rejects.toThrow()

    expect(cachedFiles.has(`/${temporaryPath}`)).toBe(true)
  })

  test('fails and does not update the user when the cache has no file', async () => {
    await expect(
      saveNewUserSignature({ userId, signature })
    ).rejects.toThrow(temporaryPath)

    expect(uploads).toEqual([])
    expect(updateUserSpy).not.toHaveBeenCalled()
  })
})
