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

const mockRoles = [
  { id: 'REGISTRATION_AGENT', scopes: ['record.declare-birth'] },
  {
    id: 'LOCAL_REGISTRAR',
    scopes: ['record.declare-birth', 'record.register-birth']
  }
]

function mockGetRoles(roles = mockRoles, status = 200) {
  mswServer.use(
    http.get(`${env.COUNTRY_CONFIG_URL}/config/roles`, () => {
      return HttpResponse.json(roles, { status } as HttpResponseInit)
    })
  )
}

describe('user.roles.list', () => {
  test('returns roles from country config', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)

    mockGetRoles()

    const result = await client.user.roles.list()

    expect(result).toEqual(mockRoles)
  })

  test('returns empty array when country config returns no roles', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)

    mockGetRoles([])

    const result = await client.user.roles.list()

    expect(result).toEqual([])
  })

  test('throws when country config returns non-ok response', async () => {
    const { user } = await setupTestCase()
    const client = createTestClient(user)

    mockGetRoles([], 500)

    await expect(client.user.roles.list()).rejects.toThrow(
      'Failed to fetch roles config'
    )
  })

  test('system client cannot call roles.list', async () => {
    const systemId = getUUID()
    const client = createSystemTestClient(systemId)

    await expect(client.user.roles.list()).rejects.toMatchObject(
      new TRPCError({ code: 'FORBIDDEN' })
    )
  })
})
