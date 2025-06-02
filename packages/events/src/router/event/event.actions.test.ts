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

import {
  ActionStatus,
  ActionType,
  AddressType,
  EventIndex,
  EventStatus,
  getCurrentEventState,
  getUUID
} from '@opencrvs/commons'
import { createTestClient, setupTestCase } from '@events/tests/utils'

test('actions can be added to created events', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  const event = await client.event.actions.declare.request(
    generator.event.actions.declare(originalEvent.id)
  )

  expect(event.actions).toEqual([
    expect.objectContaining({ type: ActionType.CREATE }),
    expect.objectContaining({ type: ActionType.ASSIGN }),
    expect.objectContaining({ type: ActionType.DECLARE }),
    expect.objectContaining({ type: ActionType.UNASSIGN })
  ])
})

test('Action data can be retrieved', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  const generatedDeclaration = generator.event.actions.declare(originalEvent.id)
  await client.event.actions.declare.request(generatedDeclaration)

  const createAction = originalEvent.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(originalEvent.id, {
    assignedTo: createAction[0].createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

  const generatedValidation = generator.event.actions.validate(originalEvent.id)
  await client.event.actions.validate.request(generatedValidation)

  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })

  const generatedRegistration = generator.event.actions.register(
    originalEvent.id
  )
  await client.event.actions.register.request(generatedRegistration)

  const updatedEvent = await client.event.get(originalEvent.id)

  expect(updatedEvent.actions).toEqual([
    expect.objectContaining({ type: ActionType.CREATE }),
    expect.objectContaining({ type: ActionType.ASSIGN }),
    expect.objectContaining({ type: ActionType.DECLARE }),
    expect.objectContaining({ type: ActionType.UNASSIGN }),
    expect.objectContaining({ type: ActionType.ASSIGN }),
    expect.objectContaining({ type: ActionType.VALIDATE }),
    expect.objectContaining({ type: ActionType.UNASSIGN }),
    expect.objectContaining({ type: ActionType.ASSIGN }),
    expect.objectContaining({ type: ActionType.REGISTER }),
    expect.objectContaining({ type: ActionType.UNASSIGN }),
    expect.objectContaining({ type: ActionType.READ })
  ])
})

test('Action data accepts partial changes', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  const addressWithoutVillage = {
    country: 'FAR',
    addressType: AddressType.DOMESTIC,
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
    { declaration: initialForm }
  )
  await client.event.actions.declare.request(firstDeclarationPayload)

  const declarationWithoutVillage = generator.event.actions.declare(
    originalEvent.id,
    {
      declaration: {
        ...initialForm,
        'applicant.address': addressWithoutVillage
      }
    }
  )

  const [createAction] = originalEvent.actions.filter(
    (action) => action.type === ActionType.CREATE
  )

  const assignmentInput = generator.event.actions.assign(originalEvent.id, {
    assignedTo: createAction.createdBy
  })

  await client.event.actions.assignment.assign(assignmentInput)

  await client.event.actions.declare.request(declarationWithoutVillage)

  const updatedEvent = await client.event.get(originalEvent.id)

  const eventStateBeforeVillageRemoval = getCurrentEventState(updatedEvent)
  expect(eventStateBeforeVillageRemoval.declaration).toEqual(initialForm)

  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })
  const declarationWithVillageNull = generator.event.actions.declare(
    originalEvent.id,
    {
      declaration: {
        ...initialForm,
        'applicant.address': {
          ...addressWithoutVillage,
          village: null
        }
      }
    }
  )

  await client.event.actions.declare.request(declarationWithVillageNull)
  const eventAfterVillageRemoval = await client.event.get(originalEvent.id)
  const stateAfterVillageRemoval = getCurrentEventState(
    eventAfterVillageRemoval
  )

  expect(stateAfterVillageRemoval.declaration).toEqual({
    ...initialForm,
    'applicant.address': addressWithoutVillage
  })

  const events = await client.event.list()
  expect(events).toMatchObject([
    {
      ...stateAfterVillageRemoval,
      legalStatuses: {
        [EventStatus.DECLARED]: {
          acceptedAt: stateAfterVillageRemoval.updatedAt as string,
          createdAt: stateAfterVillageRemoval.updatedAt as string,
          createdByRole: user.role,
          createdBy: user.id,
          createdAtLocation: user.primaryOfficeId
        }
      }
    } satisfies EventIndex
  ])
})

test('READ action does not delete draft', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  const draftData = {
    type: ActionType.DECLARE,
    declaration: {
      ...generator.event.actions.declare(originalEvent.id).declaration,
      'applicant.image': {
        type: 'image/png',
        originalFilename: 'abcd.png',
        filename: '4f095fc4-4312-4de2-aa38-86dcc0f71044.png'
      }
    },
    transactionId: getUUID(),
    eventId: originalEvent.id,
    status: ActionStatus.Requested
  }

  await client.event.draft.create(draftData)

  const draftEvents = await client.event.draft.list()

  const event = await client.event.get(originalEvent.id)
  // this triggers READ action
  expect(event.actions.at(-1)?.type).toBe(ActionType.READ)

  const draftEventsAfterRead = await client.event.draft.list()

  expect(draftEvents).toEqual(draftEventsAfterRead)
})

test('Action other than READ deletes draft', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  const draftData = {
    type: ActionType.DECLARE,
    declaration: {
      ...generator.event.actions.declare(originalEvent.id).declaration,
      'applicant.image': {
        type: 'image/png',
        originalFilename: 'abcd.png',
        filename: '4f095fc4-4312-4de2-aa38-86dcc0f71044.png'
      }
    },
    transactionId: getUUID(),
    eventId: originalEvent.id,
    status: ActionStatus.Requested
  }

  await client.event.draft.create(draftData)

  const draftEvents = await client.event.draft.list()
  expect(draftEvents.length).toBe(1)

  await client.event.actions.declare.request(
    generator.event.actions.declare(originalEvent.id)
  )

  const draftEventsAfterRead = await client.event.draft.list()

  expect(draftEventsAfterRead.length).toBe(0)
})

test('partial declaration update accounts for conditional field values not in payload', async () => {
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

  await client.event.actions.validate.request({
    type: ActionType.VALIDATE,
    duplicates: [],
    declaration: {
      'applicant.dobUnknown': true,
      'applicant.age': 25
    },
    eventId: originalEvent.id,
    transactionId: getUUID()
  })

  const event = await client.event.get(originalEvent.id)

  const eventState = getCurrentEventState(event)

  expect(eventState.declaration).toMatchSnapshot()
})
