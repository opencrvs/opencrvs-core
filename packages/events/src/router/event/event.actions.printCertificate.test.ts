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

import { ActionType, SCOPES } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import { TRPCError } from '@trpc/server'

test('prevents forbidden access if missing required scope', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(
    client.event.actions.printCertificate(
      generator.event.actions.printCertificate('event-test-id-12345')
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test(`allows access if required scope is present`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES
  ])

  await expect(
    client.event.actions.printCertificate(
      generator.event.actions.printCertificate('event-test-id-12345')
    )
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('Validation error message contains all the offending fields', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  await expect(
    client.event.actions.printCertificate(
      generator.event.actions.printCertificate(event.id, {
        data: {
          'applicant.dob': '02-02',
          'recommender.none': true
        }
      })
    )
  ).rejects.matchSnapshot()
})

test('Has validation errors when required VERIFICATION page metadata is missing', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())
  const declaredEvent = await client.event.actions.declare(
    generator.event.actions.declare(event.id)
  )

  await expect(
    client.event.actions.printCertificate(
      generator.event.actions.printCertificate(declaredEvent.id, {
        // The tennis club membership print certificate form has a verification page with conditional 'field('collector.requesterId').isEqualTo('INFORMANT')'
        // Thus if the requester is set as INFORMANT and verification page result is not set, we should see a validation error.
        metadata: { 'collector.requesterId': 'INFORMANT' }
      })
    )
  ).rejects.matchSnapshot()
})

test('Has no validation errors when required VERIFICATION page metadata is set', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())
  const declaredEvent = await client.event.actions.declare(
    generator.event.actions.declare(event.id)
  )

  await expect(
    client.event.actions.printCertificate(
      generator.event.actions.printCertificate(declaredEvent.id, {
        metadata: {
          'collector.requesterId': 'INFORMANT',
          'collector.identity.verify': true
        }
      })
    )
  ).resolves.toBeDefined()
})

test('print certificate action can be added to a created event', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  await client.event.actions.declare(
    generator.event.actions.declare(originalEvent.id)
  )

  const registeredEvent = await client.event.actions.printCertificate(
    generator.event.actions.printCertificate(originalEvent.id)
  )

  const printCertificate = await client.event.actions.printCertificate(
    generator.event.actions.printCertificate(
      registeredEvent.id,
      generator.event.actions.printCertificate(registeredEvent.id)
    )
  )

  expect(
    printCertificate.actions[printCertificate.actions.length - 1].type
  ).toBe(ActionType.PRINT_CERTIFICATE)
})

test('when mandatory field is invalid, conditional hidden fields are still skipped', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const data = generator.event.actions.printCertificate(event.id, {
    data: {}
  })

  await expect(
    client.event.actions.printCertificate(data)
  ).rejects.matchSnapshot()
})
