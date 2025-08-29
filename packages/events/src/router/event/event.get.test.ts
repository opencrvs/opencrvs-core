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
import { ActionType, generateUuid, getUUID, SCOPES } from '@opencrvs/commons'
import {
  createTestClient,
  setupTestCase,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'
import { indexEvent } from '@events/service/indexing/indexing'

type TestClient = ReturnType<typeof createTestClient>
type CreatedEvent = Awaited<ReturnType<TestClient['event']['create']>>

vi.mock('@events/service/indexing/indexing', () => ({
  indexEvent: vi.fn()
}))

test('prevents forbidden access if missing required scope', async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [])

  await expect(client.event.get(generateUuid())).rejects.toMatchObject(
    new TRPCError({ code: 'FORBIDDEN' })
  )
})

test(`allows access with required scope`, async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user, [SCOPES.RECORD_READ])

  await expect(client.event.get(generateUuid())).rejects.not.toMatchObject(
    new TRPCError({ code: 'FORBIDDEN' })
  )
})

test(`Returns 404 when not found`, async () => {
  const { user } = await setupTestCase()
  const client = createTestClient(user)

  await expect(
    client.event.get(generateUuid())
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('Returns event', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await client.event.create(generator.event.create())

  const fetchedEvent = await client.event.get(event.id)

  expect(fetchedEvent.id).toEqual(event.id)

  const fetchedEventWithoutReadAction = fetchedEvent.actions.slice(0, -1)
  expect(fetchedEventWithoutReadAction).toEqual(event.actions)

  expect(fetchedEvent.actions[fetchedEvent.actions.length - 1]).toMatchObject({
    type: ActionType.READ
  })
})

test('Returns event with all actions', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    ...TEST_USER_DEFAULT_SCOPES,
    SCOPES.RECORD_SUBMIT_INCOMPLETE
  ])

  const event = await client.event.create(generator.event.create())
  await client.event.actions.notify.request(
    generator.event.actions.notify(event.id)
  )

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

  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })

  await client.event.actions.validate.request(
    generator.event.actions.validate(event.id)
  )

  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })

  await client.event.actions.reject.request(
    generator.event.actions.reject(event.id)
  )

  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })

  await client.event.actions.validate.request(
    generator.event.actions.validate(event.id)
  )

  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })

  await client.event.actions.register.request(
    generator.event.actions.register(event.id)
  )

  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })

  await client.event.actions.printCertificate.request(
    generator.event.actions.printCertificate(event.id)
  )
  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })

  const correctionRequest =
    await client.event.actions.correction.request.request(
      generator.event.actions.correction.request(event.id)
    )

  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })

  await client.event.actions.correction.reject.request(
    generator.event.actions.correction.reject(
      event.id,
      // last action is the assign action and 2nd last is the automatic unassign action
      correctionRequest.actions[correctionRequest.actions.length - 2].id,
      {
        reason: { message: 'No legal proof' }
      }
    )
  )

  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })

  const correctionRequest2 =
    await client.event.actions.correction.request.request(
      generator.event.actions.correction.request(event.id)
    )

  await client.event.actions.assignment.assign({
    ...assignmentInput,
    transactionId: getUUID()
  })

  await client.event.actions.correction.approve.request(
    generator.event.actions.correction.approve(
      event.id,
      // last action is the assign action and 2nd last is the automatic unassign action
      correctionRequest2.actions[correctionRequest2.actions.length - 2].id
    )
  )

  await client.event.get(event.id)
  const secondTimefetchedEvent = await client.event.get(event.id)

  expect(
    secondTimefetchedEvent.actions.filter(
      (action) => action.type === ActionType.READ
    )
  ).toHaveLength(2)
})

describe('Event indexing behavior', () => {
  let client: ReturnType<typeof createTestClient>
  let generator: Awaited<ReturnType<typeof setupTestCase>>['generator']
  let user: Awaited<ReturnType<typeof setupTestCase>>['user']

  beforeEach(async () => {
    vi.mocked(indexEvent).mockClear()
    const setup = await setupTestCase()
    user = setup.user
    generator = setup.generator
    client = createTestClient(user)
  })

  const createEvent = async () => client.event.create(generator.event.create())

  const declareEvent = async (event: CreatedEvent) =>
    client.event.actions.declare.request(
      generator.event.actions.declare(event.id)
    )

  const findCreateAction = (event: CreatedEvent) =>
    event.actions.find(
      (action: { type: string }) => action.type === ActionType.CREATE
    ) ?? ({} as { createdBy: string })

  const assignEvent = async (event: CreatedEvent, assignedTo: string) =>
    client.event.actions.assignment.assign({
      ...generator.event.actions.assign(event.id, { assignedTo }),
      transactionId: getUUID()
    })

  const validateEvent = async (event: CreatedEvent) =>
    client.event.actions.validate.request(
      generator.event.actions.validate(event.id)
    )

  const registerEvent = async (event: CreatedEvent) =>
    client.event.actions.register.request(
      generator.event.actions.register(event.id)
    )

  const archiveEvent = async (event: CreatedEvent) =>
    client.event.actions.archive.request(
      generator.event.actions.archive(event.id)
    )

  const rejectEvent = async (event: CreatedEvent) =>
    client.event.actions.reject.request(
      generator.event.actions.reject(event.id)
    )

  const printCertificate = async (event: CreatedEvent) =>
    client.event.actions.printCertificate.request(
      generator.event.actions.printCertificate(event.id)
    )

  const correctionRequest = async (event: CreatedEvent) =>
    client.event.actions.correction.request.request(
      generator.event.actions.correction.request(event.id)
    )

  const correctionApprove = async (event: CreatedEvent, actionId: string) =>
    client.event.actions.correction.approve.request(
      generator.event.actions.correction.approve(event.id, actionId)
    )

  const correctionReject = async (event: CreatedEvent, actionId: string) =>
    client.event.actions.correction.reject.request(
      generator.event.actions.correction.reject(event.id, actionId, {
        reason: { message: 'No legal proof' }
      })
    )

  describe('Non-indexing actions', () => {
    test('does not index on create', async () => {
      await createEvent()
      expect(indexEvent).not.toHaveBeenCalled()
    })

    test('does not index on create and read', async () => {
      const event = await createEvent()
      await client.event.get(event.id)
      await client.event.get(event.id)
      expect(indexEvent).not.toHaveBeenCalled()
    })

    test('does not index on read', async () => {
      const event = await createEvent()
      await client.event.get(event.id)
      expect(indexEvent).not.toHaveBeenCalled()
    })
  })

  describe('Indexing actions', () => {
    test('indexes on declare', async () => {
      const event = await createEvent()
      await declareEvent(event)
      expect(indexEvent).toHaveBeenCalledTimes(1)
    })

    test('indexes on assign', async () => {
      const event = await createEvent()
      await declareEvent(event)
      const createAction = findCreateAction(event)
      await assignEvent(event, createAction.createdBy)
      expect(indexEvent).toHaveBeenCalledTimes(2) // declare -> assign
    })

    test('indexes on validate', async () => {
      const event = await createEvent()
      await declareEvent(event)
      const createAction = findCreateAction(event)
      await assignEvent(event, createAction.createdBy)
      await validateEvent(event)
      expect(indexEvent).toHaveBeenCalledTimes(3) // declare -> assign -> validate
    })

    test('indexes on register', async () => {
      const event = await createEvent()
      await declareEvent(event)
      const createAction = findCreateAction(event)
      await assignEvent(event, createAction.createdBy)
      await validateEvent(event)
      await assignEvent(event, createAction.createdBy)
      await registerEvent(event)
      expect(indexEvent).toHaveBeenCalledTimes(5) // declare -> assign -> validate -> assign -> register
    })

    test('indexes on register (with reads)', async () => {
      const event = await createEvent()
      await declareEvent(event)
      await client.event.get(event.id)
      const createAction = findCreateAction(event)
      await assignEvent(event, createAction.createdBy)
      await validateEvent(event)
      await client.event.get(event.id)
      await assignEvent(event, createAction.createdBy)
      await registerEvent(event)
      await client.event.get(event.id)
      expect(indexEvent).toHaveBeenCalledTimes(8) // declare -> view -> assign -> validate -> view -> assign -> register -> view
    })

    test('indexes on notify', async () => {
      const notifyClient = createTestClient(user, [
        'record.declaration-submit-incomplete'
      ])
      const event = await notifyClient.event.create(generator.event.create())
      await notifyClient.event.actions.notify.request(
        generator.event.actions.notify(event.id)
      )
      expect(indexEvent).toHaveBeenCalledTimes(1)
    })

    test('indexes on reject', async () => {
      const event = await createEvent()
      await declareEvent(event)
      const createAction = findCreateAction(event)
      await assignEvent(event, createAction.createdBy)
      await rejectEvent(event)
      expect(indexEvent).toHaveBeenCalledTimes(3) // declare -> assign -> reject
    })

    test('indexes on archive', async () => {
      const event = await createEvent()
      await declareEvent(event)
      const createAction = findCreateAction(event)
      await assignEvent(event, createAction.createdBy)
      await archiveEvent(event)
      expect(indexEvent).toHaveBeenCalledTimes(3) // declare -> assign -> archive
    })

    test('indexes on printCertificate', async () => {
      const event = await createEvent()
      await declareEvent(event)
      const createAction = findCreateAction(event)
      await assignEvent(event, createAction.createdBy)
      await validateEvent(event)
      await assignEvent(event, createAction.createdBy)
      await registerEvent(event)
      await assignEvent(event, createAction.createdBy)
      await printCertificate(event)
      expect(indexEvent).toHaveBeenCalledTimes(7) // declare -> assign -> validate -> assign -> register -> assign -> print
    })

    describe('Correction flow', () => {
      test('indexes on correction request', async () => {
        const event = await createEvent()
        await declareEvent(event)
        const createAction = findCreateAction(event)
        await assignEvent(event, createAction.createdBy)
        await validateEvent(event)
        await assignEvent(event, createAction.createdBy)
        await registerEvent(event)
        await assignEvent(event, createAction.createdBy)
        await correctionRequest(event)
        expect(indexEvent).toHaveBeenCalledTimes(7) // declare -> assign -> validate -> assign -> register -> assign -> correction-req
      })

      test('indexes on correction approve', async () => {
        const event = await createEvent()
        await declareEvent(event)
        const createAction = findCreateAction(event)
        await assignEvent(event, createAction.createdBy)
        await validateEvent(event)
        await assignEvent(event, createAction.createdBy)
        await registerEvent(event)
        await assignEvent(event, createAction.createdBy)
        const correction = await correctionRequest(event)
        await assignEvent(event, createAction.createdBy)
        await correctionApprove(
          event,
          correction.actions[correction.actions.length - 2].id
        )
        expect(indexEvent).toHaveBeenCalledTimes(9) // declare -> assign -> validate -> assign -> register -> assign -> correction-req -> assign -> correction-approve
      })

      test('indexes on correction reject', async () => {
        const event = await createEvent()
        await declareEvent(event)
        const createAction = findCreateAction(event)
        await assignEvent(event, createAction.createdBy)
        await validateEvent(event)
        await assignEvent(event, createAction.createdBy)
        await registerEvent(event)
        await assignEvent(event, createAction.createdBy)
        const correction = await correctionRequest(event)
        await assignEvent(event, createAction.createdBy)
        await correctionReject(
          event,
          correction.actions[correction.actions.length - 2].id
        )
        expect(indexEvent).toHaveBeenCalledTimes(9) // declare -> assign -> validate -> assign -> register -> assign -> correction-req -> assign -> correction-reject
      })
    })
  })
})
