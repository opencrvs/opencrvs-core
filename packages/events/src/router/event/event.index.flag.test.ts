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
import { ActionStatus, ActionType, CustomFlags, Flag } from '@opencrvs/commons'
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
      `${env.COUNTRY_CONFIG_URL}/events/tennis-club-membership/actions/REGISTER`,
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
      `${env.COUNTRY_CONFIG_URL}/events/tennis-club-membership/actions/REGISTER`,
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
      `${env.COUNTRY_CONFIG_URL}/events/tennis-club-membership/actions/REGISTER`,
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

test(`Adds ${CustomFlags.CERTIFICATE_PRINTED} flag after ${ActionType.PRINT_CERTIFICATE} is called`, async () => {
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

  expect(index[0].flags).toContain(CustomFlags.CERTIFICATE_PRINTED)
})

test(`Removes ${CustomFlags.CERTIFICATE_PRINTED} flag after ${ActionType.APPROVE_CORRECTION} is called`, async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const event = await createEvent(client, generator, [
    ActionType.DECLARE,
    ActionType.VALIDATE,
    ActionType.REGISTER,
    ActionType.PRINT_CERTIFICATE
  ])

  const index = await client.event.list()
  expect(index[0].flags).toContain(CustomFlags.CERTIFICATE_PRINTED)

  const withCorrectionRequest = await client.event.actions.correction.request(
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

  await client.event.actions.correction.approve(approveCorrectionPayload)

  const index2 = await client.event.list()
  expect(index2[0].flags).not.toContain(CustomFlags.CERTIFICATE_PRINTED)
})
