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

import { ActionType, getCurrentEventState } from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'

test('actions can be added to created events', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  const event = await client.event.actions.declare(
    generator.event.actions.declare(originalEvent.id)
  )

  expect(event.actions).toEqual([
    expect.objectContaining({ type: ActionType.CREATE }),
    expect.objectContaining({ type: ActionType.DECLARE })
  ])
})

test('Action data can be retrieved', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  const generatedDeclaration = generator.event.actions.declare(originalEvent.id)
  await client.event.actions.declare(generatedDeclaration)

  const generatedValidation = generator.event.actions.validate(originalEvent.id)
  await client.event.actions.validate(generatedValidation)

  const generatedRegistration = generator.event.actions.register(
    originalEvent.id
  )
  await client.event.actions.register(generatedRegistration)

  const updatedEvent = await client.event.get(originalEvent.id)

  expect(updatedEvent.actions).toEqual([
    expect.objectContaining({ type: ActionType.CREATE }),
    expect.objectContaining({ type: ActionType.DECLARE }),
    expect.objectContaining({ type: ActionType.VALIDATE }),
    expect.objectContaining({ type: ActionType.REGISTER })
  ])
})

test('Action data accepts partial changes', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  const addressWithoutVillage = {
    country: 'FAR',
    province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
    district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
    urbanOrRural: 'RURAL' as const
  }

  const initialAddress = {
    ...addressWithoutVillage,
    village: 'Small village'
  }

  const initialForm = {
    'applicant.dob': '2000-02-01',
    'applicant.firstname': 'John',
    'applicant.surname': 'Doe',
    'recommender.none': true,
    'applicant.address': { ...initialAddress }
  }

  const firstDeclarationPayload = generator.event.actions.declare(
    originalEvent.id,
    { data: initialForm }
  )
  await client.event.actions.declare(firstDeclarationPayload)

  const declarationWithoutVillage = generator.event.actions.declare(
    originalEvent.id,
    {
      data: {
        ...initialForm,
        'applicant.address': addressWithoutVillage
      }
    }
  )

  await client.event.actions.declare(declarationWithoutVillage)

  const updatedEvent = await client.event.get(originalEvent.id)

  const eventStateBeforeVillageRemoval = getCurrentEventState(updatedEvent)
  expect(eventStateBeforeVillageRemoval.data).toEqual(initialForm)

  const declarationWithVillageNull = generator.event.actions.declare(
    originalEvent.id,
    {
      data: {
        ...initialForm,
        'applicant.address': {
          ...addressWithoutVillage,
          village: null
        }
      }
    }
  )

  await client.event.actions.declare(declarationWithVillageNull)
  const eventAfterVillageRemoval = await client.event.get(originalEvent.id)
  const stateAfterVillageRemoval = getCurrentEventState(
    eventAfterVillageRemoval
  )

  expect(stateAfterVillageRemoval.data).toEqual({
    ...initialForm,
    'applicant.address': addressWithoutVillage
  })

  const events = await client.event.list()

  expect(events).toEqual([stateAfterVillageRemoval])
})
