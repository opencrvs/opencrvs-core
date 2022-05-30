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
import Role from '@user-mgnt/model/role'
import { createServer } from '@user-mgnt/server'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'

let server: any

beforeEach(async () => {
  server = await createServer()
})

const token = jwt.sign(
  { scope: ['sysadmin'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:user-mgnt-user'
  }
)
const dummyRoleList = [
  {
    title: 'Field Agent',
    value: 'FIELD_AGENT',
    types: ['Hospital', 'CHA'],
    active: true,
    creationDate: 1559054406433
  },
  {
    title: 'Registration Agent',
    value: 'REGISTRATION_AGENT',
    types: ['Entrepeneur', 'Data entry clerk'],
    active: true,
    creationDate: 1559054406444
  },
  {
    title: 'Registrar',
    value: 'LOCAL_REGISTRAR',
    types: ['Secretary', 'Chairman', 'Mayor'],
    active: true,
    creationDate: 1559054406455
  }
]

describe('getRoles tests', () => {
  it('Successfully returns full role list', async () => {
    Role.find = jest.fn().mockReturnValue(dummyRoleList)
    Role.find().sort = jest.fn().mockReturnValue(dummyRoleList)

    const res = await server.server.inject({
      method: 'POST',
      url: '/getRoles',
      payload: {},
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.result).toEqual(dummyRoleList)
  })
  it('Successfully returns filtered user list', async () => {
    const filteredList = [dummyRoleList[2]]
    Role.find = jest.fn().mockReturnValue(filteredList)
    Role.find().sort = jest.fn().mockReturnValue(filteredList)

    const res = await server.server.inject({
      method: 'POST',
      url: '/getRoles',
      payload: {
        sortBy: '_id',
        sortOrder: 'desc',
        title: 'Registrar',
        value: { $eq: 'LOCAL_REGISTRAR' },
        type: 'Mayor',
        active: true
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.result).toEqual(filteredList)
  })
})
