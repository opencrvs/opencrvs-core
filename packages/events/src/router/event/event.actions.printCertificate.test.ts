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
import { ActionType, getUUID, PageTypes, SCOPES } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'

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
    SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES
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

  const event = await client.event.create(generator.event.create())
  const declaredEvent = await client.event.actions.declare.request(
    generator.event.actions.declare(event.id)
  )

  const createAction = event.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(event.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

  await expect(
    client.event.actions.printCertificate.request(
      generator.event.actions.printCertificate(declaredEvent.id, {
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

  const event = await client.event.create(generator.event.create())
  const declaredEvent = await client.event.actions.declare.request(
    generator.event.actions.declare(event.id)
  )

  const createAction = event.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(event.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

  await expect(
    client.event.actions.printCertificate.request(
      generator.event.actions.printCertificate(declaredEvent.id, {
        annotation: {
          'collector.requesterId': 'INFORMANT',
          'collector.identity.verify': true
        }
      })
    )
  ).resolves.toBeDefined()
})

test(`${ActionType.PRINT_CERTIFICATE} action can be added to registered event`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(originalEvent.id)
  )

  const createAction = originalEvent.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(originalEvent.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

  const registeredEvent = await client.event.actions.register.request(
    generator.event.actions.register(originalEvent.id)
  )

  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })
  const printCertificate = await client.event.actions.printCertificate.request(
    generator.event.actions.printCertificate(registeredEvent.id)
  )

  expect(printCertificate.actions.slice(-2)).toEqual([
    expect.objectContaining({ type: ActionType.PRINT_CERTIFICATE }),
    expect.objectContaining({ type: ActionType.UNASSIGN })
  ])
})

test('when mandatory field is invalid, conditional hidden fields are still skipped', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  await expect(
    client.event.actions.printCertificate.request(
      generator.event.actions.printCertificate(event.id, {
        annotation: {}
      })
    )
  ).rejects.matchSnapshot()
})

test(`${ActionType.PRINT_CERTIFICATE} is idempotent`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(originalEvent.id)
  )

  const createAction = originalEvent.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(originalEvent.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

  const registeredEvent = await client.event.actions.register.request(
    generator.event.actions.register(originalEvent.id)
  )

  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })
  const printCertificatePayload = generator.event.actions.printCertificate(
    registeredEvent.id
  )
  const firstResponse = await client.event.actions.printCertificate.request(
    printCertificatePayload
  )
  const secondResponse = await client.event.actions.printCertificate.request(
    printCertificatePayload
  )

  expect(firstResponse).toEqual(secondResponse)
})
