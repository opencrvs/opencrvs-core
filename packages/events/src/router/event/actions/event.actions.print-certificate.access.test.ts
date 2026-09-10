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

import { http, HttpResponse } from 'msw'
import {
  ActionType,
  UUID,
  getUUID,
  getOrThrow,
  encodeScope,
  createPrng
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  createSystemTestClient,
  createTestClient,
  seedEvent,
  setupTestCase,
  TEST_SYSTEM_ID
} from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

const ASSIGNED_ERROR = 'User is assigned to this event'
const FORBIDDEN_ERROR = 'FORBIDDEN'
const systemClient = createSystemTestClient(TEST_SYSTEM_ID, [
  encodeScope({ type: 'record.print-certified-copies' })
])

describe('Print certificate action', () => {
  test('Prevents system requesting the action when it is assigned to a user', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, {
        keepAssignment: true,
        waitFor: false
      })
    )

    await client.event.actions.register.request(
      generator.event.actions.register(event.id, {
        waitFor: false
      })
    )

    await expect(
      systemClient.event.actions.printCertificate.request(
        generator.event.actions.printCertificate(event.id)
      )
    ).rejects.toThrow(FORBIDDEN_ERROR)
  })

  test('Prevents system requesting the action when it is not assigned to user', async () => {
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())
    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, {
        waitFor: false,
        keepAssignment: true
      })
    )
    client.event.actions.register.request(
      generator.event.actions.register(event.id)
    )

    await expect(
      systemClient.event.actions.printCertificate.request(
        generator.event.actions.printCertificate(event.id)
      )
    ).rejects.toThrow(FORBIDDEN_ERROR)
  })

  describe('with an already requested action', () => {
    let actionPayload: { eventId: UUID; actionId: UUID; transactionId: UUID }

    function mockActionApi(action: ActionType, status: number) {
      return mswServer.use(
        http.post<never, { actionId: string }>(
          `${env.COUNTRY_CONFIG_URL}/trigger/events/tennis-club-membership/actions/${action}`,
          () => {
            return HttpResponse.json({}, { status })
          }
        )
      )
    }

    beforeEach(async () => {
      const { user, eventsDb, generator } = await setupTestCase()

      mockActionApi(ActionType.PRINT_CERTIFICATE, 202)

      const { eventId } = await seedEvent(eventsDb, {
        actions: [ActionType.DECLARE, ActionType.REGISTER],
        eventConfig: tennisClubMembershipEvent,
        user,
        rng: createPrng(1279)
      })

      const client = createTestClient(user)

      const printCertificateRequestResponse =
        await client.event.actions.printCertificate.request(
          generator.event.actions.printCertificate(eventId, {
            waitFor: false
          })
        )

      const printCertificateRequestAction =
        printCertificateRequestResponse.actions.find(
          (a) => a.type === ActionType.PRINT_CERTIFICATE
        )

      await client.event.actions.assignment.assign({
        type: ActionType.ASSIGN,
        eventId,
        assignedTo: user.id,
        transactionId: getUUID()
      })
      actionPayload = {
        eventId,
        actionId: getOrThrow(printCertificateRequestAction?.id, 'no action id'),
        transactionId: getUUID()
      }
    })

    test('Prevents system accepting the action when it is assigned to a user', async () => {
      await expect(
        systemClient.event.actions.printCertificate.accept({
          ...actionPayload,
          registrationNumber: '12HZND4'
        })
      ).rejects.toThrow(ASSIGNED_ERROR)
    })

    test('Prevents system rejecting the action when it is assigned to a user', async () => {
      await expect(
        systemClient.event.actions.printCertificate.reject(actionPayload)
      ).rejects.toThrow(ASSIGNED_ERROR)
    })
  })
})
