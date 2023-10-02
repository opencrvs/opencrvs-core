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
/* eslint-disable @typescript-eslint/no-var-requires */
import { createServer } from '@metrics/server'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import * as fetchMock from 'jest-fetch-mock'
import * as mockingoose from 'mockingoose'
import vsExport from '@metrics/models/vsExports'

const token = jwt.sign(
  { scope: ['natlsysadmin'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:metrics-user'
  }
)
const fetch = fetchMock as fetchMock.FetchMock
const vsExportMockResponse = [
  {
    event: 'birth',
    year: 2011,
    fileSize: '2KB',
    url: 'minio-bucket/ocrvs',
    createdOn: 1643292520393
  }
]

describe('createCertificate handler', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('fetch all vsExports data', async () => {
    mockingoose(vsExport).toReturn(vsExportMockResponse, 'find')

    const res = await server.server.inject({
      method: 'GET',
      url: '/fetchVSExport',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('returns 500 if error occurs when failed to fetch vsExport data', async () => {
    mockingoose(vsExport).toReturn(new Error('boom'), 'find')

    const res = await server.server.inject({
      method: 'GET',
      url: '/fetchVSExport',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(500)
  })

  it('returns 401 if authentication failed', async () => {
    mockingoose(vsExport).toReturn(vsExportMockResponse, 'find')

    const res = await server.server.inject({
      method: 'GET',
      url: '/fetchVSExport',
      headers: {
        Authorization: `Bearer ${null}`
      }
    })
    expect(res.statusCode).toBe(401)
  })
})
