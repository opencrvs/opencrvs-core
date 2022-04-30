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
import * as jwt from 'jsonwebtoken'
import { createServer } from '@search/server'
import { client } from '@search/elasticsearch/client'
let server: any

// @ts-ignore
jest.spyOn(client.indices, 'delete').mockResolvedValue(() => mockDataTable)

describe('Delete Handler', () => {
  beforeEach(async () => {
    server = await createServer()
  })
  it('should return status code 403 if the token does not hold any of the Nation System Admin scope', async () => {
    const token = jwt.sign(
      {
        scope: ['anonymous']
      },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:search-user'
      }
    )

    const res = await server.server.inject({
      method: 'DELETE',
      url: '/elasticIndex',
      payload: {},
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(403)
  })
  it('should delete ocrvs index and return status code 200 when the token hold NATLSYSADMIN scope', async () => {
    const token = jwt.sign(
      {
        scope: ['natlsysadmin']
      },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:search-user'
      }
    )

    const res = await server.server.inject({
      method: 'DELETE',
      url: '/elasticIndex',
      payload: {},
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
})
