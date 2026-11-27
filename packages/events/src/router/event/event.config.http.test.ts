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

import { createTRPCClient, httpLink } from '@trpc/client'
import { jsonTransformer, TokenUserType } from '@opencrvs/commons'
import { AppRouter } from '@events/router'
import { server } from '@events/server'
import {
  createTestClient,
  createTestToken,
  setupTestCase
} from '@events/tests/utils'

// The event config response is only reused in production.
vi.mock('@events/environment', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@events/environment')>()
  return { env: { ...actual.env, isProduction: true } }
})

let serverInstance: ReturnType<typeof server>
let url: string

beforeAll(async () => {
  serverInstance = server()
  await new Promise<void>((resolve) => {
    const listener = serverInstance.listen(0, () => {
      const address = listener.address()
      const port = typeof address === 'object' && address?.port
      url = `http://localhost:${port}`
      resolve()
    })
  })
})

afterAll(() => serverInstance.close())

test('a reused event config response survives the HTTP round trip', async () => {
  const { user } = await setupTestCase()
  const token = createTestToken({
    userId: user.id,
    scopes: [],
    userType: TokenUserType.enum.user,
    role: user.role
  })
  const client = createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url,
        transformer: jsonTransformer,
        headers: { authorization: token }
      })
    ]
  })
  const expected = await createTestClient(user, []).event.config.get()

  // The first call builds and stores the response.
  expect(await client.event.config.get.query()).toEqual(expected)

  const second = await client.event.config.get.query()
  const third = await client.event.config.get.query()

  expect(second).toEqual(expected)
  expect(third).toEqual(expected)
})
