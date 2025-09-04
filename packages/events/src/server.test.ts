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

import superjson from 'superjson'
import { createTRPCClient, httpBatchLink, HTTPHeaders } from '@trpc/client'
import { http, HttpResponse } from 'msw'
import { TRPCError } from '@trpc/server'
import {
  ActionStatus,
  ActionType,
  BearerTokenByUserType,
  getTokenPayload,
  getUUID,
  TENNIS_CLUB_MEMBERSHIP,
  TestUserRole
} from '@opencrvs/commons'
import { AppRouter } from './router'
import { server } from './server'
import { mswServer } from './tests/msw'
import { env } from './environment'
import { setupTestCase } from './tests/utils'

/**
 * This test suite verifies that the server starts up correctly and handles basic dependencies.
 *
 * Compared to route based testing (e.g. event.create.test.ts), this test suite focuses on the server's ability to handle requests rather than mocking the context.
 */

let serverInstance: ReturnType<typeof server>
let url: string
let customClient: ReturnType<typeof createTRPCClient<AppRouter>>

beforeAll(() => {
  serverInstance = server()
  const listener = serverInstance.listen(0, () => {
    const address = listener.address()
    const port = typeof address === 'object' && address?.port
    url = `http://localhost:${port}`

    customClient = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url,
          transformer: superjson,
          headers({ opList }) {
            const ctxHeaders = opList[0].context.headers
            if (ctxHeaders && typeof ctxHeaders === 'object') {
              return ctxHeaders as HTTPHeaders
            }
            return {}
          }
        })
      ]
    })
  })
})

afterAll(() => {
  serverInstance.close()
})

async function createEvent(token: string) {
  const authorization = `Bearer ${token}`

  const res = await customClient.event.create.mutate(
    {
      transactionId: getUUID(),
      type: TENNIS_CLUB_MEMBERSHIP
    },
    {
      context: {
        headers: {
          authorization
        }
      }
    }
  )

  return res
}

test('Server starts up and returns an event based on context dependency values', async () => {
  const { locations } = await setupTestCase()
  expect(serverInstance).toBeDefined()
  expect(url).toBeDefined()

  const mockUserResponse = {
    primaryOfficeId: locations[0].id,
    role: TestUserRole.enum.LOCAL_REGISTRAR,
    signature: '/ocrvs/my-signature.png'
  }

  mswServer.use(
    http.post(`${env.USER_MANAGEMENT_URL}/getUser`, () =>
      HttpResponse.json(mockUserResponse)
    )
  )

  const response = await customClient.event.create.mutate(
    {
      transactionId: getUUID(),
      type: TENNIS_CLUB_MEMBERSHIP
    },
    {
      context: {
        headers: {
          authorization: `Bearer ${BearerTokenByUserType.localRegistrar}`
        }
      }
    }
  )

  const userId = getTokenPayload(BearerTokenByUserType.localRegistrar).sub

  expect(response.actions.length).toEqual(2)
  const [createAction] = response.actions

  expect(createAction.type).toEqual(ActionType.CREATE)
  expect(createAction.createdBy).toEqual(userId)
  expect(createAction.createdBySignature).toEqual(mockUserResponse.signature)
  expect(createAction.createdAtLocation).toEqual(
    mockUserResponse.primaryOfficeId
  )
  expect(createAction.status).toEqual(ActionStatus.Accepted)
})

test('Server will accept requests after error', async () => {
  const { locations } = await setupTestCase()

  expect(serverInstance).toBeDefined()
  expect(url).toBeDefined()

  mswServer.use(
    http.post(`${env.USER_MANAGEMENT_URL}/getUser`, () => {
      return HttpResponse.json(
        { message: 'Invalid credentials' },
        // @ts-expect-error - MSW does not have a type for this?
        { status: 401 }
      )
    })
  )

  await expect(
    createEvent(BearerTokenByUserType.localRegistrar)
  ).rejects.toMatchObject(new TRPCError({ code: 'INTERNAL_SERVER_ERROR' }))

  mswServer.use(
    http.post(`${env.USER_MANAGEMENT_URL}/getUser`, () => {
      return HttpResponse.json({
        primaryOfficeId: locations[0].id,
        role: TestUserRole.enum.LOCAL_REGISTRAR,
        signature: '/ocrvs/my-signature.png'
      })
    })
  )

  await expect(
    createEvent(BearerTokenByUserType.fieldAgent)
  ).resolves.toBeDefined()
})

test('Throws when dependency payload returns malformed data', async () => {
  expect(serverInstance).toBeDefined()
  expect(url).toBeDefined()

  mswServer.use(
    http.post(`${env.USER_MANAGEMENT_URL}/getUser`, () => {
      return HttpResponse.json({ allNeededPropertiesMissing: true })
    })
  )

  await expect(
    createEvent(BearerTokenByUserType.localRegistrar)
  ).rejects.toMatchObject(new TRPCError({ code: 'INTERNAL_SERVER_ERROR' }))
})

test('Throws with malformed token', async () => {
  expect(serverInstance).toBeDefined()
  expect(url).toBeDefined()

  await expect(createEvent('bad-token')).rejects.toMatchObject(
    new TRPCError({ code: 'UNAUTHORIZED' })
  )
})

test('UNAUTHORIZED error is thrown when authorization header is missing', async () => {
  expect(serverInstance).toBeDefined()
  expect(url).toBeDefined()

  await expect(
    customClient.event.create.mutate(
      {
        transactionId: getUUID(),
        type: TENNIS_CLUB_MEMBERSHIP
      },
      {
        context: {
          headers: {}
        }
      }
    )
  ).rejects.toThrow(
    new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authorization token is missing'
    })
  )
})
