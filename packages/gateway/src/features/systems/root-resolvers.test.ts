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
import { resolvers } from '@gateway/features/systems/root-resolvers'
import * as fetchAny from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'

const fetch = fetchAny as any
let authHeaderSysAdmin: { Authorization: string }
let authHeaderRegister: { Authorization: string }

beforeEach(() => {
  fetch.resetMocks()
  const sysAdminToken = jwt.sign(
    { scope: ['sysadmin'] },
    readFileSync('../auth/test/cert.key'),
    {
      subject: 'ba7022f0ff4822',
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:gateway-user'
    }
  )
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
  authHeaderSysAdmin = {
    Authorization: `Bearer ${sysAdminToken}`
  }
  authHeaderRegister = {
    Authorization: `Bearer ${registerToken}`
  }
})

describe('Integrations root resolvers', () => {
  describe('toggleSystemUser mutation', () => {
    it('activate user mutation', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({ clientId: 'faf79994-2197-4007-af17-883bd1c3375b' }),
          { status: 200 }
        ],
        [JSON.stringify({})]
      )

      const response = await resolvers.Mutation.reactivateSystem(
        {},
        {
          clientId: 'faf79994-2197-4007-af17-883bd1c3375b'
        },
        authHeaderSysAdmin
      )

      expect(response).toEqual({
        clientId: 'faf79994-2197-4007-af17-883bd1c3375b'
      })
    })

    it('deactivate user', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({ clientId: 'faf79994-2197-4007-af17-883bd1c3375b' }),
          { status: 200 }
        ],
        [JSON.stringify({})]
      )

      const response = await resolvers.Mutation.deactivateSystemClient(
        {},
        {
          clientId: 'faf79994-2197-4007-af17-883bd1c3375b'
        },
        authHeaderSysAdmin
      )

      expect(response).toEqual({
        clientId: 'faf79994-2197-4007-af17-883bd1c3375b'
      })
    })
    it('should throw error for users other than the system admin who try to deactivate integration client', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          statusCode: '201'
        }),
        { status: 400 }
      )
      fetch.mockResponseOnce(
        [
          JSON.stringify({ clientId: 'faf79994-2197-4007-af17-883bd1c3375b' }),
          { status: 400 }
        ],
        [JSON.stringify({})]
      )
      expect(
        resolvers.Mutation.deactivateSystemClient(
          {},
          {
            clientId: 'faf79994-2197-4007-af17-883bd1c3375b'
          },
          authHeaderRegister
        )
      ).rejects.toThrowError('Deactivate user is only allowed for sysadmin')
    })
  })
  it('should throw error for users other than the system admin who try to activate integration client', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        statusCode: '201'
      }),
      { status: 400 }
    )
    fetch.mockResponseOnce(
      [
        JSON.stringify({ clientId: 'faf79994-2197-4007-af17-883bd1c3375b' }),
        { status: 400 }
      ],
      [JSON.stringify({})]
    )
    expect(
      resolvers.Mutation.reactivateSystem(
        {},
        {
          clientId: 'faf79994-2197-4007-af17-883bd1c3375b'
        },
        authHeaderRegister
      )
    ).rejects.toThrowError('Activate user is only allowed for sysadmin')
  })
})
