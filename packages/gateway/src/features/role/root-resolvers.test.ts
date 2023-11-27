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
import { resolvers as rootResolvers } from '@gateway/features/role/root-resolvers'
import * as fetchAny from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import { TestResolvers } from '@gateway/utils/testUtils'

const resolvers = rootResolvers as unknown as TestResolvers
const fetch = fetchAny as any

beforeEach(() => {
  fetch.resetMocks()
})

describe('Role root resolvers', () => {
  describe('getSystemRoles()', () => {
    const dummyRoleList = [
      {
        _id: '63a06b979538ca7ab52f9759',
        active: true,
        value: 'FIELD_AGENT',
        creationDate: 1671457687106,
        roles: [
          {
            labels: [
              {
                lang: 'en',
                label: 'Healthcare Worker'
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
                label: 'Police Officer'
              },
              {
                lang: 'fr',
                label: 'Agent de Police'
              }
            ]
          },
          {
            labels: [
              {
                lang: 'en',
                label: 'Social Worker'
              },
              {
                lang: 'fr',
                label: 'Travailleur Social'
              }
            ]
          },
          {
            labels: [
              {
                lang: 'en',
                label: 'Local Leader'
              },
              {
                lang: 'fr',
                label: 'Leader Local'
              }
            ]
          }
        ]
      },
      {
        _id: '63a06b979538ca7ab52f975a',
        active: true,
        value: 'REGISTRATION_AGENT',
        creationDate: 1671457687107,
        roles: [
          {
            labels: [
              {
                lang: 'en',
                label: 'Registration Agent'
              },
              {
                lang: 'fr',
                label: "Agent d'enregistrement"
              }
            ]
          }
        ]
      },
      {
        _id: '63a06b979538ca7ab52f975b',
        active: true,
        value: 'LOCAL_REGISTRAR',
        creationDate: 1671457687107,
        roles: [
          {
            labels: [
              {
                lang: 'en',
                label: 'Local Registrar'
              },
              {
                lang: 'fr',
                label: 'Registraire local'
              }
            ]
          }
        ]
      },
      {
        _id: '63a06b979538ca7ab52f975c',
        active: true,
        value: 'LOCAL_SYSTEM_ADMIN',
        creationDate: 1671457687107,
        roles: [
          {
            labels: [
              {
                lang: 'en',
                label: 'Local System_admin'
              },
              {
                lang: 'fr',
                label: 'Administrateur système local'
              }
            ]
          }
        ]
      },
      {
        _id: '63a06b979538ca7ab52f975d',
        active: true,
        value: 'NATIONAL_SYSTEM_ADMIN',
        creationDate: 1671457687107,
        roles: [
          {
            labels: [
              {
                lang: 'en',
                label: 'National System_admin'
              },
              {
                lang: 'fr',
                label: 'Administrateur système national'
              }
            ]
          }
        ]
      },
      {
        _id: '63a06b979538ca7ab52f975e',
        active: true,
        value: 'PERFORMANCE_MANAGEMENT',
        creationDate: 1671457687107,
        roles: [
          {
            labels: [
              {
                lang: 'en',
                label: 'Performance Management'
              },
              {
                lang: 'fr',
                label: 'Gestion des performances'
              }
            ]
          }
        ]
      },
      {
        _id: '63a06b979538ca7ab52f975f',
        active: true,
        value: 'NATIONAL_REGISTRAR',
        creationDate: 1671457687107,
        roles: [
          {
            labels: [
              {
                lang: 'en',
                label: 'National Registrar'
              },
              {
                lang: 'fr',
                label: 'Registraire national'
              }
            ]
          }
        ]
      }
    ]
    it('returns full role list', async () => {
      fetch.mockResponseOnce(JSON.stringify(dummyRoleList))

      const response = await resolvers.Query!.getSystemRoles(
        {},
        {},
        { headers: undefined }
      )

      expect(response).toEqual(dummyRoleList)
    })
    it('returns filtered role list', async () => {
      fetch.mockResponseOnce(JSON.stringify([dummyRoleList[2]]))

      const response = await resolvers.Query!.getSystemRoles(
        {},
        {
          sortBy: '_id',
          sortOrder: 'desc',
          title: 'Registrar',
          value: 'LOCAL_REGISTRAR',
          type: 'Mayor',
          active: true
        },
        { headers: undefined }
      )
      expect(response).toEqual([dummyRoleList[2]])
    })
  })
})

describe('system role update', () => {
  const mockSystemRole = {
    systemRole: {
      _id: '63b3f284452f2e40afa4409e',
      active: true,
      value: 'FIELD_AGENT_POLICE',
      roles: ['63d27c9e2d06f966f28763fc']
    }
  }

  const mockUpdateRoleRequest = {
    systemRole: {
      id: '63b3f284452f2e40afa4409e',
      value: 'FIELD_AGENT_POLICE',
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
        }
      ]
    }
  }
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
  })
  it('should update system role', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockSystemRole), {
      status: 200
    })

    const response = await resolvers.Mutation!.updateRole(
      {},
      mockUpdateRoleRequest,
      { headers: authHeaderSysAdmin }
    )

    expect(mockSystemRole).toEqual(response)
  })
})
