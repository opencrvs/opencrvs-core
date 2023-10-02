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

import * as fetchMock from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import * as mockingoose from 'mockingoose'
import { createServer } from '@user-mgnt/server'
import SystemRole from '@user-mgnt/model/systemRole'

const fetch = fetchMock as fetchMock.FetchMock

const token = jwt.sign(
  { scope: ['natlsysadmin', 'sysadmin', 'demo'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:user-mgnt-user'
  }
)

const mockSystemRole = {
  _id: '63b3f284452f2e40afa4409d',
  active: true,
  value: 'FIELD_AGENT',
  roles: ['63d27c9e2d06f966f28763fc']
}
const mockUpdateRoleRequest = {
  id: '63b3f284452f2e40afa4409e',
  value: 'FIELD AGENT',
  active: false,
  roles: [
    {
      _id: '63d27c9e2d06f966f28763fc',
      labels: [
        {
          lang: 'en',
          label: 'Health Worker'
        },
        {
          lang: 'fr',
          label: 'Professionnel de Santé'
        }
      ]
    },
    {
      labels: [
        {
          lang: 'en',
          label: 'Police Worker'
        },
        {
          lang: 'fr',
          label: 'Agent de Police'
        }
      ]
    }
  ]
}

describe('updateSystem role', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('should update system role', async () => {
    mockingoose(SystemRole).toReturn(mockSystemRole, 'findOne')
    const res = await server.server.inject({
      method: 'POST',
      url: '/updateRole',
      payload: mockUpdateRoleRequest,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
  })
})
