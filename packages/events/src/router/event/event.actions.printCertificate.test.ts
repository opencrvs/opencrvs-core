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
import { ActionType, PageTypes } from '@opencrvs/commons'
import {
  createEvent,
  createTestClient,
  setupTestCase
} from '@events/tests/utils'

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
    'record.registered.print-certified-copies[event=birth|death|tennis-club-membership]'
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
    ActionType.VALIDATE,
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
    ActionType.VALIDATE,
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
    ActionType.VALIDATE,
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
    ActionType.VALIDATE,
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
    ActionType.VALIDATE,
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

test(`PRINT_CERTIFICATE is not allowed if the event is waiting for correction`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REGISTER,
    ActionType.REQUEST_CORRECTION
  ])

  await expect(
    client.event.actions.printCertificate.request(
      generator.event.actions.printCertificate(event.id)
    )
  ).rejects.toThrowErrorMatchingSnapshot()
})
