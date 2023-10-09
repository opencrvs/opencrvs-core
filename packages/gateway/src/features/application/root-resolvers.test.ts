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
import { resolvers as rootResolvers } from '@gateway/features/application/root-resolvers'
import * as fetchAny from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'

const fetch = fetchAny as any
const resolvers = rootResolvers as any
beforeEach(() => {
  fetch.resetMocks()
})

describe('Application config root resolvers', () => {
  let authHeaderNatlSYSAdmin: { Authorization: string }
  let authHeaderRegister: { Authorization: string }
  beforeEach(() => {
    fetch.resetMocks()

    const natlSYSAdminToken = jwt.sign(
      { scope: ['natlsysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        subject: 'ba7022f0ff4822',
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:gateway-user'
      }
    )
    authHeaderNatlSYSAdmin = {
      Authorization: `Bearer ${natlSYSAdminToken}`
    }
    const regsiterToken = jwt.sign(
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
      Authorization: `Bearer ${regsiterToken}`
    }
  })
  const applicationConfig = {
    APPLICATION_NAME: 'Farajaland CRVS'
  }

  it('updates application config by natlsysadmin', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        statusCode: '201',
        APPLICATION_NAME: 'Farajaland CRVS'
      }),
      { status: 201 }
    )

    const response = await resolvers.Mutation.updateApplicationConfig(
      {},
      { applicationConfig },
      { headers: authHeaderNatlSYSAdmin }
    )

    expect(response).toEqual({
      statusCode: '201',
      APPLICATION_NAME: 'Farajaland CRVS'
    })
  })

  it('should throw error for register', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        statusCode: '201'
      }),
      { status: 400 }
    )

    expect(
      resolvers.Mutation.updateApplicationConfig(
        {},
        { applicationConfig },
        { headers: authHeaderRegister }
      )
    ).rejects.toThrowError(
      'Update application config is only allowed for natlsysadmin'
    )
  })

  it('should throw error when /updateApplicationConfig sends anything but 201', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        statusCode: '201'
      }),
      { status: 400 }
    )

    expect(
      resolvers.Mutation.updateApplicationConfig(
        {},
        { applicationConfig },
        { headers: authHeaderNatlSYSAdmin }
      )
    ).rejects.toThrowError(
      "Something went wrong on config service. Couldn't update application config"
    )
  })
})
