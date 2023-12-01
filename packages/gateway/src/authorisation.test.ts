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
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'

import { IAuthHeader } from '@opencrvs/commons'

import * as fetchMock from 'jest-fetch-mock'

type AuthHeader = { Authorization?: string } & IAuthHeader
import { checkUserAssignment } from './authorisation'
describe('checkUserAssignment()', () => {
  const fetch = fetchMock as fetchMock.FetchMock
  const registerCertifyToken = jwt.sign(
    { scope: ['register', 'certify'] },
    readFileSync('./test/cert.key'),
    {
      subject: '121221',
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:gateway-user'
    }
  )
  const authHeaderRegCert: AuthHeader = {
    Authorization: `Bearer ${registerCertifyToken}`
  }
  it('should return true if user is assigned on task', async () => {
    fetch.mockResponseOnce(JSON.stringify({ userId: '121221' }))
    const bundle = await checkUserAssignment(
      '5d027bc403b93b17526323f6',
      authHeaderRegCert
    )
    expect(bundle).toBe(true)
  })

  it('should return false if user is not assigned on task', async () => {
    fetch.mockResponseOnce(JSON.stringify({ userId: '123456' }))
    const bundle = await checkUserAssignment(
      '5d027bc403b93b17526323f6',
      authHeaderRegCert
    )
    expect(bundle).toBe(false)
  })

  it('should return false if authHeader has no Authorization', async () => {
    fetch.mockResponse(JSON.stringify({ userId: '121221' }))
    //@ts-ignore
    delete authHeaderRegCert.Authorization
    const bundle = await checkUserAssignment(
      '5d027bc403b93b17526323f6',
      authHeaderRegCert
    )
    expect(bundle).toBe(false)
  })
})
