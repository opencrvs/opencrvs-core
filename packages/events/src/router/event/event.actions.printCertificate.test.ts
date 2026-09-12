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
import {
  ActionStatus,
  ActionType,
  encodeScope,
  EventStatus,
  getCurrentEventState,
  PageTypes
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  createEvent,
  createTestClient,
  setupTestCase
} from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

test('prevents forbidden access if missing required scope', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(
    client.event.actions.printCertificate.request(
      generator.event.actions.printCertificate('event-test-id-12345')
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`allows access if required scope is present`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    encodeScope({
      type: 'record.print-certified-copies',
      options: {
        event: ['birth', 'death', 'tennis-club-membership']
      }
    })
  ])

  await expect(
    client.event.actions.printCertificate.request(
      generator.event.actions.printCertificate('event-test-id-12345')
    )
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`Has validation errors when required ${PageTypes.enum.VERIFICATION} page fields are missing`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER
  ])

  await expect(
    client.event.actions.printCertificate.request(
      generator.event.actions.printCertificate(event.id, {
        // The tennis club membership print certificate form has a verification page with conditional 'field('collector.requesterId').isEqualTo('INFORMANT')'
        // Thus if the requester is set as INFORMANT and verification page result is not set, we should see a validation error.
        annotation: { 'collector.requesterId': 'INFORMANT' }
      })
    )
  ).rejects.matchSnapshot()
})

test(`Has no validation errors when required ${PageTypes.enum.VERIFICATION} page fields are set`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER
  ])

  await expect(
    client.event.actions.printCertificate.request(
      generator.event.actions.printCertificate(event.id, {
        annotation: {
          'collector.requesterId': 'INFORMANT',
          'collector.identity.verify': true
        }
      })
    )
  ).resolves.toBeDefined()
})

test(`PRINT_CERTIFICATE action can not be performed on a declared, non-registered event`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)
  const event = await createEvent(client, generator, [ActionType.DECLARE])

  await expect(
    client.event.actions.printCertificate.request(
      generator.event.actions.printCertificate(event.id)
    )
  ).rejects.toThrowErrorMatchingSnapshot()
})

test(`PRINT_CERTIFICATE action can be added to registered event`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER
  ])

  const printCertificate = await client.event.actions.printCertificate.request(
    generator.event.actions.printCertificate(event.id)
  )

  expect(printCertificate.actions.slice(-2)).toEqual([
    expect.objectContaining({ type: ActionType.PRINT_CERTIFICATE }),
    expect.objectContaining({ type: ActionType.UNASSIGN })
  ])
})

test('when mandatory field is invalid, conditional hidden fields are still skipped', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER
  ])

  await expect(
    client.event.actions.printCertificate.request(
      generator.event.actions.printCertificate(event.id, {
        annotation: {}
      })
    )
  ).rejects.matchSnapshot()
})

test(`PRINT_CERTIFICATE is idempotent`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.REGISTER
  ])

  const printCertificatePayload = generator.event.actions.printCertificate(
    event.id,
    { keepAssignment: true }
  )
  const firstResponse = await client.event.actions.printCertificate.request(
    printCertificatePayload
  )
  const secondResponse = await client.event.actions.printCertificate.request(
    printCertificatePayload
  )

  expect(firstResponse).toEqual(secondResponse)
})

describe('3rd party integration confirmation behaviour', () => {
  function mockActionApi(action: ActionType, status: number) {
    return mswServer.use(
      http.post<never, { actionId: string }>(
        `${env.COUNTRY_CONFIG_URL}/trigger/events/tennis-club-membership/actions/${action}`,
        () => {
          return HttpResponse.json({}, { status })
        }
      )
    )
  }

  test('Throws when integration responds with 202 when keepAssignment is given', async () => {
    mockActionApi(ActionType.PRINT_CERTIFICATE, 202)
    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    await client.event.actions.register.request(
      generator.event.actions.register(event.id, { keepAssignment: true })
    )

    await expect(
      client.event.actions.printCertificate.request(
        generator.event.actions.printCertificate(event.id, {
          keepAssignment: true
        })
      )
    ).rejects.toThrow('Confirmation API did not return a synchronous response.')
  })

  test('Throws when integration responds with 202 when keepAssignmentIfRejected is given', async () => {
    mockActionApi(ActionType.PRINT_CERTIFICATE, 202)
    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    await client.event.actions.register.request(
      generator.event.actions.register(event.id, {
        keepAssignment: true
      })
    )

    await expect(
      client.event.actions.printCertificate.request(
        generator.event.actions.printCertificate(event.id, {
          keepAssignmentIfRejected: true
        })
      )
    ).rejects.toThrow('Confirmation API did not return a synchronous response.')
  })

  test('Throws when integration responds with 202 when keepAssignmentIfAccepted is given', async () => {
    mockActionApi(ActionType.PRINT_CERTIFICATE, 202)
    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )
    await client.event.actions.register.request(
      generator.event.actions.register(event.id, {
        keepAssignment: true
      })
    )
    await expect(
      client.event.actions.printCertificate.request(
        generator.event.actions.printCertificate(event.id, {
          keepAssignmentIfAccepted: true
        })
      )
    ).rejects.toThrow('Confirmation API did not return a synchronous response.')
  })

  test('Unassigns when integration responds with 202', async () => {
    mockActionApi(ActionType.PRINT_CERTIFICATE, 202)

    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )

    await client.event.actions.register.request(
      generator.event.actions.register(event.id, { keepAssignment: true })
    )

    const response = await client.event.actions.printCertificate.request(
      generator.event.actions.printCertificate(event.id)
    )

    const lastAction = response.actions[response.actions.length - 1]

    expect(lastAction.type).toEqual(ActionType.UNASSIGN)
    expect(lastAction.status).toEqual(ActionStatus.Accepted)

    const currentState = getCurrentEventState(
      response,
      tennisClubMembershipEvent
    )

    expect(currentState.flags).toEqual(['print_certificate:requested'])
    expect(currentState.status).toEqual(EventStatus.enum.REGISTERED)
    expect(currentState.assignedTo).toEqual(undefined)
  })

  test('Keeps assignment when integration responds with 500', async () => {
    mockActionApi(ActionType.PRINT_CERTIFICATE, 500)

    const { generator, user } = await setupTestCase()

    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, { keepAssignment: true })
    )
    await client.event.actions.register.request(
      generator.event.actions.register(event.id, { keepAssignment: true })
    )

    await expect(
      client.event.actions.printCertificate.request(
        generator.event.actions.printCertificate(event.id)
      )
    ).rejects.toThrow(
      'Unexpected failure from country config action confirmation API'
    )

    const eventAfterFailure = await client.event.get({ eventId: event.id })

    const currentState = getCurrentEventState(
      eventAfterFailure,
      tennisClubMembershipEvent
    )

    expect(currentState.flags).toEqual(['print_certificate:requested'])
    expect(currentState.status).toEqual(EventStatus.enum.REGISTERED)
    expect(currentState.assignedTo).toEqual(user.id)
  })
})
