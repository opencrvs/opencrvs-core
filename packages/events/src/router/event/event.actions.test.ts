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
  getCurrentEventState,
  getUUID,
  PrintCertificateAction
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  createTestClient,
  sanitizeForSnapshot,
  setupTestCase,
  UNSTABLE_EVENT_FIELDS
} from '@events/tests/utils'

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
    expect.objectContaining({
      type: ActionType.DECLARE,
      status: ActionStatus.Requested
    }),
    expect.objectContaining({
      type: ActionType.DECLARE,
      status: ActionStatus.Accepted
    }),
    expect.objectContaining({ type: ActionType.UNASSIGN })
  ])
})

test('Event document contains all created actions', async () => {
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
    expect.objectContaining({
      type: ActionType.DECLARE,
      status: ActionStatus.Requested
    }),
    expect.objectContaining({
      type: ActionType.DECLARE,
      status: ActionStatus.Accepted
    }),
    expect.objectContaining({ type: ActionType.UNASSIGN }),
    expect.objectContaining({ type: ActionType.ASSIGN }),
    expect.objectContaining({
      type: ActionType.VALIDATE,
      status: ActionStatus.Requested
    }),
    expect.objectContaining({
      type: ActionType.VALIDATE,
      status: ActionStatus.Accepted
    }),
    expect.objectContaining({ type: ActionType.UNASSIGN }),
    expect.objectContaining({ type: ActionType.ASSIGN }),
    expect.objectContaining({
      type: ActionType.REGISTER,
      status: ActionStatus.Requested
    }),
    expect.objectContaining({
      type: ActionType.REGISTER,
      status: ActionStatus.Accepted
    }),
    expect.objectContaining({ type: ActionType.UNASSIGN }),
    expect.objectContaining({ type: ActionType.READ })
  ])

  updatedEvent.actions.forEach((action) => {
    expect(action.createdAtLocation).toBe(user.primaryOfficeId)
    expect(action.createdByRole).toBe(user.role)
    expect(action.createdBySignature).toBe(user.signature)

    const actionsWithoutAnnotatation = [
      ActionType.CREATE,
      ActionType.READ,
      ActionType.ASSIGN,
      ActionType.UNASSIGN
    ]

    if (actionsWithoutAnnotatation.every((ac) => ac !== action.type)) {
      expect(action).toHaveProperty('annotation')
    }
  })

  expect(
    sanitizeForSnapshot(updatedEvent, UNSTABLE_EVENT_FIELDS)
  ).toMatchSnapshot()
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
        path: '/ocrvs/4f095fc4-4312-4de2-aa38-86dcc0f71044.png'
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
        path: '/ocrvs/4f095fc4-4312-4de2-aa38-86dcc0f71044.png'
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

  const eventState = getCurrentEventState(event, tennisClubMembershipEvent)

  expect(eventState.declaration).toMatchSnapshot()
})

test('PRINT_CERTIFICATE action can include a valid content.templateId property in payload', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(originalEvent.id, { keepAssignment: true })
  )

  await client.event.actions.validate.request(
    generator.event.actions.validate(originalEvent.id, { keepAssignment: true })
  )

  await client.event.actions.register.request(
    generator.event.actions.register(originalEvent.id, { keepAssignment: true })
  )

  const basePrintAction = generator.event.actions.printCertificate(
    originalEvent.id,
    { keepAssignment: true }
  )
  const printActionWithDetails = {
    ...basePrintAction,
    content: {
      templateId: 'birth-certificate-template'
    }
  }

  const result = await client.event.actions.printCertificate.request(
    printActionWithDetails
  )
  expect(result).toBeDefined()

  const updatedEvent = await client.event.get(originalEvent.id)
  const printAction = updatedEvent.actions.find(
    (action) => action.type === ActionType.PRINT_CERTIFICATE
  ) as PrintCertificateAction
  expect(printAction.content?.templateId).toBeDefined()
})

test('REGISTER action throws when content property is in payload', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const originalEvent = await client.event.create(generator.event.create())

  await client.event.actions.declare.request(
    generator.event.actions.declare(originalEvent.id, { keepAssignment: true })
  )

  await client.event.actions.validate.request(
    generator.event.actions.validate(originalEvent.id, { keepAssignment: true })
  )

  const baseRegisterAction = generator.event.actions.register(originalEvent.id)
  const registerActionWithDetails = {
    ...baseRegisterAction,
    content: {
      templateId: 'some-template'
    }
  }

  await expect(
    client.event.actions.register.request(registerActionWithDetails)
  ).rejects.toThrow()
})
