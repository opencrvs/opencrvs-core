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

test('prevents forbidden access if missing required scope', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  await expect(
    client.event.actions.printCertificate(
      generator.event.actions.printCertificate('event-test-id-12345')
    )
  ).rejects.matchSnapshot()
})

test('Validation error message contains all the offending fields', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_DECLARATION_PRINT])

  const event = await client.event.create(generator.event.create())

  await expect(
    client.event.actions.printCertificate(
      generator.event.actions.printCertificate(event.id, {
        data: {
          'applicant.dob': '02-02'
        }
      })
    )
  ).rejects.matchSnapshot()
})

test('print certificate action can be added to a created event', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_DECLARATION_PRINT])

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
  const client = createTestClient(user, [SCOPES.RECORD_DECLARATION_PRINT])

  const event = await client.event.create(generator.event.create())

  const data = generator.event.actions.printCertificate(event.id, {
    data: {
      'applicant.dob': '02-1-2024',
      'applicant.firstname': 'John',
      'applicant.surname': 'Doe',
      'recommender.none': false
    }
  })

  await expect(
    client.event.actions.printCertificate(data)
  ).rejects.matchSnapshot()
})

test('Skips required field validation when they are conditionally hidden', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_DECLARATION_PRINT])

  const event = await client.event.create(generator.event.create())

  const form = {
    'applicant.dob': '2024-02-01',
    'applicant.firstname': 'John',
    'applicant.surname': 'Doe',
    'recommender.none': false
  }

  const data = generator.event.actions.printCertificate(event.id, {
    data: form
  })

  const response = await client.event.actions.printCertificate(data)
  const savedAction = response.actions.find(
    (action) => action.type === ActionType.PRINT_CERTIFICATE
  )
  expect(savedAction?.data).toEqual(form)
})

test('Prevents adding birth date in future', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_DECLARATION_PRINT])

  const event = await client.event.create(generator.event.create())

  const form = {
    'applicant.dob': '2040-02-01',
    'applicant.firstname': 'John',
    'applicant.surname': 'Doe',
    'recommender.none': false
  }

  const payload = generator.event.actions.printCertificate(event.id, {
    data: form
  })

  await expect(
    client.event.actions.printCertificate(payload)
  ).rejects.matchSnapshot()
})
