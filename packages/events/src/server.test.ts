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
  encodeScope,
  getTokenPayload,
  getUUID,
  TENNIS_CLUB_MEMBERSHIP,
  TestUserRole,
  TokenUserType
} from '@opencrvs/commons'
import { AppRouter } from './router'
import { server } from './server'
import { mswServer } from './tests/msw'
import { createTestToken, setupTestCase } from './tests/utils'

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

  const userId = getTokenPayload(BearerTokenByUserType.localRegistrar).sub

  const mockUserResponse = {
    primaryOfficeId: locations[0].id,
    role: TestUserRole.enum.LOCAL_REGISTRAR,
    signature: {
      data: 'my-signature.png'
    }
  }

  const eventId = getUUID()
  const mockEvent = {
    id: eventId,
    type: TENNIS_CLUB_MEMBERSHIP,
    trackingId: 'TRK-MOCK-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    actions: [
      {
        id: getUUID(),
        type: ActionType.CREATE,
        transactionId: getUUID(),
        createdBy: userId,
        createdByUserType: TokenUserType.enum.user,
        createdByRole: TestUserRole.enum.LOCAL_REGISTRAR,
        createdBySignature: 'my-signature.png',
        createdAtLocation: mockUserResponse.primaryOfficeId,
        status: ActionStatus.Accepted,
        declaration: {},
        annotation: null,
        createdAt: new Date().toISOString()
      },
      {
        id: getUUID(),
        type: ActionType.ASSIGN,
        transactionId: getUUID(),
        createdBy: userId,
        createdByUserType: TokenUserType.enum.user,
        createdByRole: TestUserRole.enum.LOCAL_REGISTRAR,
        createdAtLocation: mockUserResponse.primaryOfficeId,
        status: ActionStatus.Accepted,
        declaration: {},
        annotation: null,
        createdAt: new Date().toISOString(),
        assignedTo: userId
      }
    ]
  }

  mswServer.use(
    http.post(`${url}/event.create`, () =>
      HttpResponse.json([{ result: { data: superjson.serialize(mockEvent) } }])
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

  expect(response.actions.length).toEqual(2)
  const [createAction] = response.actions

  expect(createAction.type).toEqual(ActionType.CREATE)
  expect(createAction.createdBy).toEqual(userId)
  expect(createAction.createdBySignature).toEqual('my-signature.png')
  expect(createAction.createdAtLocation).toEqual(
    mockUserResponse.primaryOfficeId
  )
  expect(createAction.status).toEqual(ActionStatus.Accepted)
})

test('Server will accept requests after error', async () => {
  const { user, generator } = await setupTestCase()
  expect(serverInstance).toBeDefined()
  expect(url).toBeDefined()

  const tokenWithoutCreateScope = createTestToken({
    userId: user.id,
    scopes: [],
    userType: TokenUserType.enum.user,
    role: user.role
  })

  await expect(
    customClient.event.create.mutate(generator.event.create(), {
      context: { headers: { authorization: tokenWithoutCreateScope } }
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))

  const tokenWithCreateScope = createTestToken({
    userId: user.id,
    scopes: [encodeScope({ type: 'record.create' })],
    userType: TokenUserType.enum.user,
    role: user.role
  })

  await expect(
    customClient.event.create.mutate(generator.event.create(), {
      context: { headers: { authorization: tokenWithCreateScope } }
    })
  ).resolves.toBeDefined()
})

test('Throws when dependency payload returns malformed data', async () => {
  expect(serverInstance).toBeDefined()
  expect(url).toBeDefined()

  mswServer.use(
    http.post(`${url}/event.create`, () =>
      HttpResponse.json([
        {
          error: {
            json: {
              message: 'Authentication failed',
              code: -32001,
              data: {
                code: 'UNAUTHORIZED',
                httpStatus: 401,
                path: 'event.create'
              }
            }
          }
        }
      ])
    )
  )

  await expect(
    createEvent(BearerTokenByUserType.localRegistrar)
  ).rejects.toMatchObject({ data: { code: 'UNAUTHORIZED' } })
})

test('Throws with malformed token', async () => {
  expect(serverInstance).toBeDefined()
  expect(url).toBeDefined()

  await expect(createEvent('bad-token')).rejects.toMatchObject({
    data: { code: 'UNAUTHORIZED' }
  })
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
