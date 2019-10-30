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
import { createServer } from '@resources/index'

describe('assets handler tests', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it('returns appropriate asset', async () => {
    const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:resources-user'
    })

    const res = await server.server.inject({
      method: 'GET',
      url: '/bgd/assets/logo.png',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.payload).toBeDefined()
  })
})
