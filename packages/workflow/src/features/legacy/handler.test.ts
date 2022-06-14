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
import { createServer } from '../../server'
import {
  patientMock,
  compositionMock,
  deathCompositionMock
} from '@workflow/test/utils'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

describe('Verify handler', () => {
  let server: any

  beforeEach(async () => {
    fetch.resetMocks()
    server = await createServer()
  })

  describe('updatePatientRegistrationNumberHandler', () => {
    const mockTaskSearchBundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 2,
      entry: [
        {
          resource: {
            resourceType: 'Task',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/types',
                  code: 'BIRTH'
                }
              ]
            },
            focus: {
              reference: 'Composition/4b640fb3-6721-403e-841f-a12e7512241a'
            },
            id: 'd73596cf-60e4-451f-9b41-4d3564e17b81',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/birth-tracking-id',
                value: 'BWADGPR'
              },
              {
                system:
                  'http://opencrvs.org/specs/id/birth-registration-number',
                value: '20207210411000115'
              }
            ],
            businessStatus: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/reg-status',
                  code: 'REGISTERED'
                }
              ]
            }
          }
        },
        {
          resource: {
            resourceType: 'Task',
            code: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/types',
                  code: 'DEATH'
                }
              ]
            },
            focus: {
              reference: 'Composition/a7478390-ef0e-496b-9a44-83844303ec73'
            },
            id: '83d8aea8-446b-4f78-9485-2af20a8074a2',
            identifier: [
              {
                system: 'http://opencrvs.org/specs/id/death-tracking-id',
                value: 'DSK3OO6'
              },
              {
                system:
                  'http://opencrvs.org/specs/id/death-registration-number',
                value: '20207210411000114'
              }
            ],
            businessStatus: {
              coding: [
                {
                  system: 'http://opencrvs.org/specs/reg-status',
                  code: 'REGISTERED'
                }
              ]
            }
          }
        }
      ]
    }

    const sysToken = jwt.sign(
      { scope: ['sysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )
    const nonSysToken = jwt.sign(
      { scope: ['registrar'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )

    it('returns OK for a correctly authenticated system admin user', async () => {
      fetch.mockResponses(
        [JSON.stringify(mockTaskSearchBundle), { status: 200 }],
        [compositionMock, { status: 200 }],
        [patientMock, { status: 200 }],
        [deathCompositionMock, { status: 200 }],
        [patientMock, { status: 200 }],
        [JSON.stringify({}), { status: 200 }]
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/updateLegacyRegistrationNumbers',
        headers: {
          Authorization: `Bearer ${sysToken}`
        }
      })
      expect(res.statusCode).toBe(200)
    })

    it('returns 401 for non sysadmin', async () => {
      const res = await server.server.inject({
        method: 'POST',
        url: '/updateLegacyRegistrationNumbers',
        headers: {
          Authorization: `Bearer ${nonSysToken}`
        }
      })
      expect(res.statusCode).toBe(401)
    })
    it('returns 500 if no task list found', async () => {
      fetch.mockResponses([JSON.stringify({}), { status: 200 }])

      const res = await server.server.inject({
        method: 'POST',
        url: '/updateLegacyRegistrationNumbers',
        headers: {
          Authorization: `Bearer ${sysToken}`
        }
      })
      expect(res.statusCode).toBe(500)
    })
  })
})
