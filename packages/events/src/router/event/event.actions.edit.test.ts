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
import {
  ActionStatus,
  ActionType,
  AddressType,
  getUUID,
  ActionUpdate
} from '@opencrvs/commons'

import { createTestClient, setupTestCase } from '@events/tests/utils'

test('prevents forbidden access if missing required scope', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(
    client.event.actions.edit.request(
      generator.event.actions.edit('registered-event-test-id-12345')
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('allows access if required scope is present', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  await expect(
    client.event.actions.edit.request(
      generator.event.actions.edit('registered-event-test-id-12345')
    )
  ).rejects.not.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('Validation error message contains all the offending fields', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const createAction = event.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(event.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id)
  )

  /** Partial payload is accepted, so it should not complain about fields already send during declaration. */
  const data = generator.event.actions.edit(event.id, {
    declaration: {
      'applicant.dob': '02-02',
      'applicant.dobUnknown': false,
      'recommender.none': true
    }
  })

  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })

  await expect(client.event.actions.edit.request(data)).rejects.matchSnapshot()
})

test('when mandatory field is invalid, conditional hidden fields are still skipped', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())
  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id)
  )

  const createAction = event.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(event.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

  const data = generator.event.actions.edit(event.id, {
    declaration: {
      'applicant.dob': '02-1-2024',
      'applicant.dobUnknown': false,
      'applicant.name': {
        firstname: 'John',
        surname: 'Doe'
      },
      'recommender.none': true
    }
  })

  await expect(client.event.actions.edit.request(data)).rejects.matchSnapshot()
})

test('Skips required field validation when they are conditionally hidden', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id)
  )

  const createAction = event.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(event.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

  const form = {
    'applicant.dob': '2024-02-01',
    'applicant.dobUnknown': false,
    'applicant.name': {
      firstname: 'John',
      surname: 'Doe'
    },
    'recommender.none': true,
    'applicant.address': {
      country: 'FAR',
      addressType: AddressType.DOMESTIC,
      streetLevelDetails: {
        state: 'State',
        district2: 'District2'
      }
    }
  } satisfies ActionUpdate

  const declaration = generator.event.actions.edit(event.id, {
    declaration: form
  })

  const response = await client.event.actions.edit.request(declaration)

  const savedAction = response.actions.find(
    (action) =>
      action.type === ActionType.EDIT && action.status === ActionStatus.Accepted
  )

  expect(savedAction).toMatchObject({
    status: ActionStatus.Accepted,
    declaration: {}
  })
})
