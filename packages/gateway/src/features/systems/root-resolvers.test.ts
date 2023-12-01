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
import { resolvers as typeResolvers } from '@gateway/features/systems/root-resolvers'
import * as fetchAny from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import { TestResolvers } from '@gateway/utils/testUtils'

const fetch = fetchAny as fetchAny.FetchMock
const resolvers = typeResolvers as unknown as TestResolvers

let authHeaderSysAdmin: { Authorization: string }
let authHeaderRegister: { Authorization: string }

beforeEach(() => {
  fetch.resetMocks()
  const sysAdminToken = jwt.sign(
    { scope: ['natlsysadmin'] },
    readFileSync('./test/cert.key'),
    {
      subject: 'ba7022f0ff4822',
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:gateway-user'
    }
  )
  const registerToken = jwt.sign(
    { scope: ['register'] },
    readFileSync('./test/cert.key'),
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
        [JSON.stringify({}), { status: 200 }]
      )

      const response = await resolvers.Mutation!.reactivateSystem(
        {},
        {
          clientId: 'faf79994-2197-4007-af17-883bd1c3375b'
        },
        { headers: authHeaderSysAdmin }
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
        [JSON.stringify({}), { status: 200 }]
      )

      const response = await resolvers.Mutation!.deactivateSystem(
        {},
        {
          clientId: 'faf79994-2197-4007-af17-883bd1c3375b'
        },
        { headers: authHeaderSysAdmin }
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
        JSON.stringify({ clientId: 'faf79994-2197-4007-af17-883bd1c3375b' })
      )
      expect(
        resolvers.Mutation!.deactivateSystem(
          {},
          {
            clientId: 'faf79994-2197-4007-af17-883bd1c3375b'
          },
          { headers: authHeaderRegister }
        )
      ).rejects.toThrowError('Deactivate user is only allowed for natlsysadmin')
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
      JSON.stringify({ clientId: 'faf79994-2197-4007-af17-883bd1c3375b' })
    )
    expect(
      resolvers.Mutation!.reactivateSystem(
        {},
        {
          clientId: 'faf79994-2197-4007-af17-883bd1c3375b'
        },
        { headers: authHeaderRegister }
      )
    ).rejects.toThrowError('Activate user is only allowed for natlsysadmin')
  })
})

describe('generate refresh token', () => {
  let authHeaderRegister: { Authorization: string }
  let authHeaderSysAdmin: { Authorization: string }
  beforeEach(() => {
    fetch.resetMocks()
    const sysAdminToken = jwt.sign(
      { scope: ['natlsysadmin'] },
      readFileSync('./test/cert.key'),
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
    const registerToken = jwt.sign(
      { scope: ['register'] },
      readFileSync('./test/cert.key'),
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

  it('update refresh token for system admin', async () => {
    const responsePayload = {
      clientSecret: '38ea3d84-6403-40f0-bce2-485caf655585',
      system: {
        _id: '234241',
        name: 'Dummy System',
        status: 'active',
        type: 'HEALTH',
        shaSecret: '823823',
        clientId: '1239014'
      }
    }
    fetch.mockResponseOnce(JSON.stringify(responsePayload), { status: 200 })

    const response = await resolvers.Mutation!.refreshSystemSecret(
      {},
      { clientId: '1231234' },
      { headers: authHeaderSysAdmin }
    )

    expect(response).toEqual(responsePayload)
  })

  it('should throw error for register user', async () => {
    fetch.mockResponseOnce(JSON.stringify({}), { status: 400 })

    const response = resolvers.Mutation!.refreshSystemSecret(
      {},
      { clientId: '1231234' },
      { headers: authHeaderRegister }
    )
    await expect(response).rejects.toThrowError(
      'Only system user can update refresh client secret'
    )
  })
})

describe('delete system integration', () => {
  let authHeaderRegister: { Authorization: string }
  let authHeaderSysAdmin: { Authorization: string }
  beforeEach(() => {
    fetch.resetMocks()
    const sysAdminToken = jwt.sign(
      { scope: ['natlsysadmin'] },
      readFileSync('./test/cert.key'),
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
    const registerToken = jwt.sign(
      { scope: ['register'] },
      readFileSync('./test/cert.key'),
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

  it('delete system by system admin', async () => {
    const responsePayload = {
      system: {
        _id: '234241',
        name: 'Dummy System',
        status: 'active',
        type: 'HEALTH',
        shaSecret: '823823',
        clientId: '1239014'
      }
    }
    fetch.mockResponseOnce(JSON.stringify(responsePayload), { status: 200 })

    const response = await resolvers.Mutation!.deleteSystem(
      {},
      { clientId: '1231234' },
      { headers: authHeaderSysAdmin }
    )

    expect(response).toEqual(responsePayload)
  })

  it('should throw error for register user', async () => {
    fetch.mockResponseOnce(JSON.stringify({}), { status: 400 })

    const response = resolvers.Mutation!.deleteSystem(
      {},
      { clientId: '1231234' },
      { headers: authHeaderRegister }
    )
    await expect(response).rejects.toThrowError(
      'Only system user can delete the system'
    )
  })
})
