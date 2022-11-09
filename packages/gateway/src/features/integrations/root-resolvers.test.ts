/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import { readFileSync } from 'fs'
import * as fetchAny from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import { resolvers } from './root-resolvers'

const fetch = fetchAny as any

beforeEach(() => {
  fetch.resetMocks()
})

describe('generate refresh token', () => {
  let authHeaderRegister: { Authorization: string }
  let authHeaderNatlSysAdmin: { Authorization: string }
  beforeEach(() => {
    fetch.resetMocks()
    const naltSysAdminToken = jwt.sign(
      { scope: ['natlsysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        subject: 'ba7022f0ff4822',
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:gateway-user'
      }
    )
    authHeaderNatlSysAdmin = {
      Authorization: `Bearer ${naltSysAdminToken}`
    }
    const registerToken = jwt.sign(
      { scope: ['register'] },
      readFileSync('../auth/test/cert.key'),
      {
        subject: 'ba7022f0ff4822',
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:gateway-user'
      }
    )
    authHeaderRegister = {
      Authorization: `Bearer ${registerToken}`
    }
  })

  const fetchRefreshUser = {
    name: 'emmanuel.mayuka',
    clientId: '38ea3d84-6403-40f0-bce2-485caf655585',
    shaSecret: 'c2844fd0-ce88-4d5c-8bbb-634e9618ec63',
    clientSecret: 'fb82cd2f-6c95-4dff-92f5-22c787b7f277'
  }

  it('update refresh token for national system admin', async () => {
    fetch.mockResponseOnce(JSON.stringify(fetchRefreshUser), { status: 200 })

    const response = await resolvers.Mutation.refreshSystemClientSecret(
      {},
      { clientId: '38ea3d84-6403-40f0-bce2-485caf655585' },
      authHeaderNatlSysAdmin
    )

    expect(response).toEqual(fetchRefreshUser)
  })

  it('should throw error for register user', async () => {
    fetch.mockResponseOnce(JSON.stringify({}), { status: 400 })

    const response = resolvers.Mutation.refreshSystemClientSecret(
      {},
      { clientId: '38ea3d84-6403-40f0-bce2-485caf655585' },
      authHeaderRegister
    )
    await expect(response).rejects.toThrowError(
      'Only system user can update refresh client secret'
    )
  })
})
