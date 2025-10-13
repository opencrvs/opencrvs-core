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

import { TRPCError } from '@trpc/server'
import { http, HttpResponse } from 'msw'
import { intersectionBy } from 'lodash'
import {
  LocationType,
  SCOPES,
  generateUuid,
  TestUserRole,
  ActionType
} from '@opencrvs/commons'
import {
  createEvent,
  createTestClient,
  setupTestCase
} from '@events/tests/utils'
import { mswServer } from '../../tests/msw'

test('Throws error if user does not required scope', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)

  await expect(
    client.user.actions({
      userId: '123-123-123'
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'NOT_FOUND' }))
})

test('Throws error when accessing user outside jurisdiction with my jurisdiction scope', async () => {
  const { users } = await setupTestCase()
  const client = createTestClient(users[0], [SCOPES.USER_READ_MY_JURISDICTION])

  await expect(
    client.user.actions({
      userId: users[1].id
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'NOT_FOUND' }))
})

test('Throws error when accessing user in different office with my office scope', async () => {
  const { users } = await setupTestCase()
  const client = createTestClient(users[0], [SCOPES.USER_READ_MY_OFFICE])

  await expect(
    client.user.actions({
      userId: users[1].id
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'NOT_FOUND' }))
})

test('Throws error when accessing oneself user without my audit scope', async () => {
  const { users } = await setupTestCase()
  const client = createTestClient(users[0])

  await expect(
    client.user.actions({
      userId: users[1].id
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'NOT_FOUND' }))
})

test('Find user by id outside of jurisdiction with global scope', async () => {
  const { users } = await setupTestCase()
  const client = createTestClient(users[0], [SCOPES.USER_READ])

  await expect(
    client.user.actions({
      userId: users[1].id
    })
  ).resolves.toMatchObject({
    results: [],
    total: 0
  })
})

test('Find user with appropriate scopes', async () => {
  const { user: userOnParentLocation, seed } = await setupTestCase()
  const clientWithJurisdictionScope = createTestClient(userOnParentLocation, [
    SCOPES.USER_READ_MY_JURISDICTION
  ])

  const userToSearchLocationId = generateUuid()

  await seed.locations([
    {
      name: 'Child office',
      parentId: userOnParentLocation.primaryOfficeId,
      locationType: LocationType.Enum.CRVS_OFFICE,
      id: userToSearchLocationId,
      validUntil: null
    }
  ])

  const userInTheSameOffice = seed.user({
    name: [{ family: 'Jones', given: ['James'], use: 'en' }],
    primaryOfficeId: userToSearchLocationId,
    role: TestUserRole.Enum.FIELD_AGENT
  })

  const clientWithOfficeScope = createTestClient(userInTheSameOffice, [
    SCOPES.USER_READ_MY_OFFICE
  ])

  const userToSearch = seed.user({
    name: [{ family: 'Smith', given: ['John'], use: 'en' }],
    primaryOfficeId: userToSearchLocationId,
    role: TestUserRole.Enum.FIELD_AGENT
  })

  const userToSearchClient = createTestClient(userToSearch, [
    SCOPES.USER_READ_ONLY_MY_AUDIT
  ])

  mswServer.use(
    http.post(`http://localhost:3030/getUser`, async ({ request }) => {
      const body = (await request.clone().json()) as { userId: string }
      const userId = body.userId

      if (userId === userToSearch.id) {
        return HttpResponse.json(userToSearch)
      }

      if (userId === userInTheSameOffice.id) {
        return HttpResponse.json(userInTheSameOffice)
      }

      if (userId === userOnParentLocation.id) {
        return HttpResponse.json(userOnParentLocation)
      }

      throw new Error('should not happen')
    })
  )

  await expect(
    clientWithJurisdictionScope.user.actions({
      userId: userToSearch.id
    })
  ).resolves.toMatchObject({
    results: [],
    total: 0
  })

  await expect(
    clientWithOfficeScope.user.actions({
      userId: userToSearch.id
    })
  ).resolves.toMatchObject({
    results: [],
    total: 0
  })

  await expect(
    userToSearchClient.user.actions({
      userId: userToSearch.id
    })
  ).resolves.toMatchObject({
    results: [],
    total: 0
  })
})

test('Returns user actions', async () => {
  const { users, generator } = await setupTestCase()
  const clientThatSearchesUser = createTestClient(users[0], [SCOPES.USER_READ])
  const userThatDoesThings = users[1]
  const clientThatDoesThings = createTestClient(userThatDoesThings)

  // CREATE + ASSIGN
  await clientThatDoesThings.event.create(generator.event.create())

  // CREATE + ASSIGN
  const event2 = await clientThatDoesThings.event.create(
    generator.event.create()
  )

  // REMOVES CREATE + ASSIGN
  await clientThatDoesThings.event.delete({ eventId: event2.id })

  // CREATE + ASSIGN
  await createEvent(clientThatDoesThings, generator, [
    ActionType.DECLARE, // x2
    ActionType.VALIDATE, // x2
    ActionType.REGISTER, // x2
    ActionType.PRINT_CERTIFICATE // x2
  ])

  const expectedTotalActions = 12

  const userActions = await clientThatSearchesUser.user.actions({
    userId: userThatDoesThings.id
  })

  expect(userActions.total).toBe(expectedTotalActions)
  // DEFAULTS TO 10 RESULTS
  expect(userActions.results.length).toBe(10)

  const allUserActions = await clientThatSearchesUser.user.actions({
    userId: userThatDoesThings.id,
    count: 20
  })

  expect(allUserActions.total).toBe(expectedTotalActions)
  expect(allUserActions.results.length).toBe(expectedTotalActions)

  const userDeclarationActions = await clientThatSearchesUser.user.actions({
    userId: userThatDoesThings.id,
    count: 20,
    actionTypes: [
      ActionType.CREATE,
      ActionType.DECLARE,
      ActionType.VALIDATE,
      ActionType.REGISTER
    ]
  })

  const userOtherActions = await clientThatSearchesUser.user.actions({
    userId: userThatDoesThings.id,
    count: 20,
    actionTypes: [ActionType.PRINT_CERTIFICATE, ActionType.ASSIGN]
  })

  expect(userOtherActions.total).toBe(4)

  // No other action types generated, delete is not visible.
  expect(userDeclarationActions.total).toBe(
    allUserActions.total - userOtherActions.total
  )
})
