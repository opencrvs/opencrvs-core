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
import { expect, test } from '@playwright/test'
import { createClient } from '@opencrvs/toolkit/api'
import { omit } from 'lodash'
import { CREDENTIALS, GATEWAY_HOST } from '@e2e/support/constants'
import { getToken } from '@e2e/support/helpers'
import {
  createDeclaration,
  getDeclaration,
  type Declaration
} from '@e2e/support/test-data/birth-declaration'

async function getEventById(eventId: string, token: string) {
  const client = createClient(`${GATEWAY_HOST}/events`, `Bearer ${token}`)
  return client.event.get.query({ eventId })
}

test.describe.serial('Birth registration forwarding to MOSIP', () => {
  let token: string
  let declaration: Declaration
  let eventId: string

  test.beforeAll(async () => {
    token = await getToken(CREDENTIALS.REGISTRAR)

    const declarationForMosipForwarding = await getDeclaration({
      token,
      partialDeclaration: {
        'mother.verified': 'authenticated'
      }
    })

    const res = await createDeclaration(
      token,
      omit(declarationForMosipForwarding, ['mother.idType', 'mother.nid'])
    )

    declaration = res.declaration
    eventId = res.eventId

    expect(res.registrationNumber).toBeUndefined()
  })

  test('register action is requested then accepted through MOSIP flow', async () => {
    expect((declaration as Record<string, unknown>)['mother.verified']).toBe(
      'authenticated'
    )

    await expect
      .poll(
        async () => {
          const event = await getEventById(eventId, token)
          const registerActions = event.actions.filter(
            (action: { type: string }) => action.type === 'REGISTER'
          )

          const hasRequestedRegisterAction = registerActions.some(
            (action: { status: string }) => action.status === 'Requested'
          )
          const acceptedAction = registerActions.find(
            (action: { status: string }) => action.status === 'Accepted'
          )

          if (!hasRequestedRegisterAction || !acceptedAction) {
            return false
          }

          const acceptedActionRegistrationNumber = (
            acceptedAction as { registrationNumber?: string }
          ).registrationNumber

          return Boolean(acceptedActionRegistrationNumber)
        },
        {
          timeout: 30_000,
          intervals: [500, 1000, 2000]
        }
      )
      .toBe(true)
  })
})
