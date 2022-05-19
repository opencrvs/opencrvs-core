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
import { createServer } from '@config/server'
import { fetchFHIR, deleteFHIR } from '@config/services/fhirService'
import { HearthCollectionsName } from '@config/services/formDraftService'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import * as fetchMock from 'jest-fetch-mock'

const token = jwt.sign(
  { scope: ['natlsysadmin', 'demo'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:config-user'
  }
)

const taskBundleMock = {
  resourceType: 'Bundle',
  type: 'document',
  entry: [
    {
      fullUrl: 'urn:uuid:104ad8fd-e7b8-4e3e-8193-abc2c473f2c9',
      resource: {
        resourceType: 'Task',
        status: 'requested',
        focus: {
          reference: 'Composition/95035079-ec2c-451c-b514-664e838e8a5b'
        },
        code: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/types',
              code: 'birth-registration'
            }
          ]
        },
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/paper-form-id',
            value: '12345678'
          },
          {
            system: 'http://opencrvs.org/specs/id/birth-tracking-id',
            value: 'B5WGYJE'
          }
        ],
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/contact-person',
            valueString: 'MOTHER'
          },
          {
            url: 'http://opencrvs.org/specs/extension/configuration',
            valueReference: { reference: 'IN_CONFIGURATION' }
          }
        ],
        id: '104ad8fd-e7b8-4e3e-8193-abc2c473f2c9'
      }
    }
  ]
}

const fetch = fetchMock as fetchMock.FetchMock

describe('fetchFHIR()', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
    fetch.resetMocks()
    fetch.mockReject(new Error())
  })

  it('should return response from fhir', async () => {
    fetch.mockResponse(JSON.stringify(taskBundleMock))
    const taskBundle = await fetchFHIR(HearthCollectionsName.Task, token)
    expect(taskBundle.resourceType).toEqual('Bundle')
  })

  it('should return error if fhir failed to fetch', async () => {
    fetch.mockReject(new Error('error'))
    await expect(
      fetchFHIR(HearthCollectionsName.Task, token)
    ).rejects.toThrowError('error')
  })
})

describe('deleteFHIR()', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
    fetch.resetMocks()
    fetch.mockReject(new Error())
  })

  it('should return response from fhir', async () => {
    fetch.mockResponse(JSON.stringify({ status: 'ok' }))
    const res = await deleteFHIR(HearthCollectionsName.Task, token)
    expect(res.status).toBe(200)
  })

  it('should return error if fhir failed to fetch', async () => {
    fetch.mockReject(new Error('error'))
    await expect(
      deleteFHIR(HearthCollectionsName.Task, token)
    ).rejects.toThrowError('error')
  })
})
