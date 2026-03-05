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
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import { TestResolvers } from '@gateway/utils/testUtils'
import { SCOPES } from '@opencrvs/commons/authentication'

const resolvers = typeResolvers as unknown as TestResolvers

let authHeaderSysAdmin: { Authorization: string }
let authHeaderRegister: { Authorization: string }

beforeEach(() => {
  const sysAdminToken = jwt.sign(
    { scope: [SCOPES.CONFIG_UPDATE_ALL] },
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

describe('registerSystem mutation', () => {
  it('should reject IMPORT_EXPORT system type', async () => {
    const response = resolvers.Mutation!.registerSystem(
      {},
      {
        system: {
          name: 'Test Import Export System',
          type: 'IMPORT_EXPORT'
        }
      },
      { headers: authHeaderSysAdmin }
    )
    await expect(response).rejects.toThrowError(
      'Invalid system integration type: IMPORT_EXPORT'
    )
  })

  it('should reject non-admin users', async () => {
    const response = resolvers.Mutation!.registerSystem(
      {},
      {
        system: {
          name: 'Test System',
          type: 'HEALTH'
        }
      },
      { headers: authHeaderRegister }
    )
    await expect(response).rejects.toThrowError(
      'User is not allowed to create client'
    )
  })
})
