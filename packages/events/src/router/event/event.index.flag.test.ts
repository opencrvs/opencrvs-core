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

import { HttpResponse, http } from 'msw'
import {
  ActionStatus,
  ActionType,
  InherentFlags,
  SCOPES,
  Flag
} from '@opencrvs/commons'
import { env } from '@events/environment'
import {
  createEvent,
  createTestClient,
  setupTestCase
} from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'

function generateFlag(type: ActionType, status: ActionStatus): Flag {
  return `${type.toLowerCase()}:${status.toLowerCase()}`
}

test('Adds ACTION-requested flag while waiting for external validation', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.VALIDATE
  ])

  mswServer.use(
    http.post(
      `${env.COUNTRY_CONFIG_URL}/trigger/events/tennis-club-membership/actions/REGISTER`,
      () => {
        return HttpResponse.json(
          {},
          // @ts-expect-error - "For some reason the msw types here complain about the status, even though this is correct"
          { status: 202 }
        )
      }
    )
  )

  await client.event.actions.register.request(
    generator.event.actions.register(event.id)
  )

  const index = await client.event.list()

  expect(index[0].flags).toContain(
    generateFlag(ActionType.REGISTER, ActionStatus.Requested)
  )
  expect(index[0].flags).not.toContain(
    generateFlag(ActionType.REGISTER, ActionStatus.Accepted)
  )
  expect(index[0].flags).not.toContain(
    generateFlag(ActionType.REGISTER, ActionStatus.Rejected)
  )
})

test('Does not add any flags when accepted form countryconfig', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.VALIDATE
  ])

  mswServer.use(
    http.post(
      `${env.COUNTRY_CONFIG_URL}/trigger/events/tennis-club-membership/actions/REGISTER`,
      () => {
        return HttpResponse.json(
          { registrationNumber: 'SOME0REG0NUM' },
          // @ts-expect-error - "For some reason the msw types here complain about the status, even though this is correct"
          { status: 200 }
        )
      }
    )
  )

  await client.event.actions.register.request(
    generator.event.actions.register(event.id)
  )

  const index = await client.event.list()

  expect(index[0].flags).not.toContain(
    generateFlag(ActionType.REGISTER, ActionStatus.Requested)
  )
  expect(index[0].flags).not.toContain(
    generateFlag(ActionType.REGISTER, ActionStatus.Accepted)
  )
  expect(index[0].flags).not.toContain(
    generateFlag(ActionType.REGISTER, ActionStatus.Rejected)
  )
})

test('Adds ACTION-rejected flag when rejected form countryconfig', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.VALIDATE
  ])

  mswServer.use(
    http.post(
      `${env.COUNTRY_CONFIG_URL}/trigger/events/tennis-club-membership/actions/REGISTER`,
      () => {
        return HttpResponse.json(
          {},
          // @ts-expect-error - "For some reason the msw types here complain about the status, even though this is correct"
          { status: 400 }
        )
      }
    )
  )

  await client.event.actions.register.request(
    generator.event.actions.register(event.id)
  )

  const index = await client.event.list()

  expect(index[0].flags).not.toContain(
    generateFlag(ActionType.REGISTER, ActionStatus.Requested)
  )
  expect(index[0].flags).not.toContain(
    generateFlag(ActionType.REGISTER, ActionStatus.Accepted)
  )
  expect(index[0].flags).toContain(
    generateFlag(ActionType.REGISTER, ActionStatus.Rejected)
  )
})

test(`Adds ${InherentFlags.PENDING_CERTIFICATION} flag after ${ActionType.REGISTER} is called`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REGISTER
  ])

  const index = await client.event.list()

  expect(index[0].flags).toContain(InherentFlags.PENDING_CERTIFICATION)
})

test(`Removes ${InherentFlags.PENDING_CERTIFICATION} flag after ${ActionType.PRINT_CERTIFICATE} is called`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REGISTER
  ])

  await client.event.actions.printCertificate.request(
    generator.event.actions.printCertificate(event.id)
  )

  const index = await client.event.list()

  expect(index[0].flags).not.toContain(InherentFlags.PENDING_CERTIFICATION)
})

test(`Removes ${InherentFlags.PENDING_CERTIFICATION} flag after ${ActionType.REQUEST_CORRECTION} is called`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REGISTER,
    ActionType.PRINT_CERTIFICATE
  ])

  await client.event.actions.correction.request.request(
    generator.event.actions.correction.request(event.id, {
      keepAssignment: true
    })
  )

  const index = await client.event.list()
  expect(index[0].flags).not.toContain(InherentFlags.PENDING_CERTIFICATION)
})
test(`Adds back ${InherentFlags.PENDING_CERTIFICATION} flag after ${ActionType.APPROVE_CORRECTION} is called`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REGISTER,
    ActionType.PRINT_CERTIFICATE
  ])

  const withCorrectionRequest =
    await client.event.actions.correction.request.request(
      generator.event.actions.correction.request(event.id, {
        keepAssignment: true
      })
    )

  const actionId = withCorrectionRequest.actions.at(-1)?.id

  if (!actionId) {
    throw new Error('Request ID is undefined')
  }

  const approveCorrectionPayload = generator.event.actions.correction.approve(
    withCorrectionRequest.id,
    actionId
  )

  await client.event.actions.correction.approve.request(
    approveCorrectionPayload
  )

  const index2 = await client.event.list()
  expect(index2[0].flags).toContain(InherentFlags.PENDING_CERTIFICATION)
})

test(`Adds ${InherentFlags.CORRECTION_REQUESTED} flag after ${ActionType.REQUEST_CORRECTION} is called`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REGISTER
  ])

  await client.event.actions.correction.request.request(
    generator.event.actions.correction.request(event.id, {
      keepAssignment: true
    })
  )

  const index = await client.event.list()
  expect(index[0].flags).toContain(InherentFlags.CORRECTION_REQUESTED)
})

test(`Removes ${InherentFlags.CORRECTION_REQUESTED} flag after ${ActionType.APPROVE_CORRECTION} is called`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REGISTER
  ])

  const withCorrectionRequest =
    await client.event.actions.correction.request.request(
      generator.event.actions.correction.request(event.id, {
        keepAssignment: true
      })
    )

  const index = await client.event.list()
  expect(index[0].flags).toContain(InherentFlags.CORRECTION_REQUESTED)
  const actionId = withCorrectionRequest.actions.at(-1)?.id

  if (!actionId) {
    throw new Error('Request ID is undefined')
  }

  const approveCorrectionPayload = generator.event.actions.correction.approve(
    withCorrectionRequest.id,
    actionId
  )

  await client.event.actions.correction.approve.request(
    approveCorrectionPayload
  )

  const index2 = await client.event.list()
  expect(index2[0].flags).not.toContain(InherentFlags.CORRECTION_REQUESTED)
})

test(`Adds ${InherentFlags.INCOMPLETE} flag after ${ActionType.NOTIFY} is called`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    SCOPES.RECORD_SUBMIT_INCOMPLETE,
    SCOPES.RECORD_DECLARE
  ])

  const event = await createEvent(client, generator, [])

  await client.event.actions.notify.request(
    generator.event.actions.notify(event.id)
  )

  const index = await client.event.list()
  expect(index[0].flags).toContain(InherentFlags.INCOMPLETE)
})

test(`Removes ${InherentFlags.INCOMPLETE} flag after ${ActionType.DECLARE} is called`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user, [
    SCOPES.RECORD_SUBMIT_INCOMPLETE,
    SCOPES.RECORD_DECLARE
  ])

  const event = await createEvent(client, generator, [])

  await client.event.actions.notify.request(
    generator.event.actions.notify(event.id)
  )

  await client.event.actions.assignment.assign(
    generator.event.actions.assign(event.id, {
      assignedTo: event.actions[0].createdBy
    })
  )

  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id)
  )
  const index = await client.event.list()
  expect(index[0].flags).not.toContain(InherentFlags.INCOMPLETE)
})

test(`Adds ${InherentFlags.REJECTED} flag after ${ActionType.REJECT} is called`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [ActionType.DECLARE])

  await client.event.actions.reject.request(
    generator.event.actions.reject(event.id)
  )
  const index = await client.event.list()
  expect(index[0].flags).toContain(InherentFlags.REJECTED)
})

test(`Removes ${InherentFlags.REJECTED} flag after ${ActionType.DECLARE} is called again`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [ActionType.DECLARE])

  await client.event.actions.reject.request(
    generator.event.actions.reject(event.id)
  )

  await client.event.actions.assignment.assign(
    generator.event.actions.assign(event.id, {
      assignedTo: event.actions[0].createdBy
    })
  )

  await client.event.actions.declare.request(
    generator.event.actions.declare(event.id)
  )

  const index = await client.event.list()
  expect(index[0].flags).not.toContain(InherentFlags.REJECTED)
})
