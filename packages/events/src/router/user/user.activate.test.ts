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
import { http, HttpResponse, HttpResponseInit } from 'msw'
import { getUUID } from '@opencrvs/commons'
import {
  createSystemTestClient,
  createTestClient,
  setupTestCase
} from '@events/tests/utils'
import { env } from '@events/environment'
import { mswServer } from '../../tests/msw'

const activatePayload = {
  userId: '5d10885374be318fa7689f0b',
  password: 'new_password',
  securityQNAs: [
    { questionKey: 'HOME_TOWN', answer: 'test' },
    { questionKey: 'FIRST_SCHOOL', answer: 'test' },
    { questionKey: 'FAVORITE_COLOR', answer: 'test' }
  ]
}

describe('user.activate', () => {
  test('successfully activates a pending user', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)

    mswServer.use(
      http.post(`${env.USER_MANAGEMENT_URL}/activateUser`, () => {
        return HttpResponse.json({ userId: activatePayload.userId }, {
          status: 201
        } as HttpResponseInit)
      })
    )

    await expect(client.user.activate(activatePayload)).resolves.not.toThrow()
  })

  test('throws error when user-mgnt returns a non-ok response', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)

    mswServer.use(
      http.post(`${env.USER_MANAGEMENT_URL}/activateUser`, () => {
        return HttpResponse.json(null, { status: 401 } as HttpResponseInit)
      })
    )

    await expect(client.user.activate(activatePayload)).rejects.toThrow(
      'Unable to change password. Error: 401 status received'
    )
  })

  test('system client cannot call activate', async () => {
    const systemId = getUUID()
    const client = createSystemTestClient(systemId)

    await expect(client.user.activate(activatePayload)).rejects.toMatchObject(
      new TRPCError({ code: 'FORBIDDEN' })
    )
  })
})
