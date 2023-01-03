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
    value: 'FIELD_AGENT',
    roles: [
      {
        lang: 'en',
        label: 'Healthcare Worker'
      },
      {
        lang: 'fr',
        label: 'Professionnel de Santé'
      },
      {
        lang: 'en',
        label: 'Police Officer'
      },
      {
        lang: 'fr',
        label: 'Agent de Police'
      },
      {
        lang: 'en',
        label: 'Social Worker'
      },
      {
        lang: 'fr',
        label: 'Travailleur Social'
      },
      {
        lang: 'en',
        label: 'Local Leader'
      },
      {
        lang: 'fr',
        label: 'Leader Local'
      }
    ],
    active: true
  },
  {
    value: 'REGISTRATION_AGENT',
    roles: [
      {
        lang: 'en',
        label: 'Registration Agent'
      },
      {
        lang: 'fr',
        label: "Agent d'enregistrement"
      }
    ],
    active: true
  },
  {
    value: 'LOCAL_REGISTRAR',
    roles: [
      {
        lang: 'en',
        label: 'Local Registrar'
      },
      {
        lang: 'fr',
        label: 'Registraire local'
      }
    ],
    active: true
  },
  {
    value: 'LOCAL_SYSTEM_ADMIN',
    roles: [
      {
        lang: 'en',
        label: 'Local System_admin'
      },
      {
        lang: 'fr',
        label: 'Administrateur système local'
      }
    ],
    active: true
  },
  {
    value: 'NATIONAL_SYSTEM_ADMIN',
    roles: [
      {
        lang: 'en',
        label: 'National System_admin'
      },
      {
        lang: 'fr',
        label: 'Administrateur système national'
      }
    ],
    active: true
  },
  {
    value: 'PERFORMANCE_MANAGEMENT',
    roles: [
      {
        lang: 'en',
        label: 'Performance Management'
      },
      {
        lang: 'fr',
        label: 'Gestion des performances'
      }
    ],
    active: true
  },
  {
    value: 'NATIONAL_REGISTRAR',
    roles: [
      {
        lang: 'en',
        label: 'National Registrar'
      },
      {
        lang: 'fr',
        label: 'Registraire national'
      }
    ],
    active: true
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
        value: { $eq: 'LOCAL_REGISTRAR' },
        role: 'Mayor',
        active: true
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.result).toEqual(filteredList)
  })
})
