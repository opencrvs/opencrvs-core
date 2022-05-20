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
import FormDraft from '@config/models/formDraft'
import * as fetchMock from 'jest-fetch-mock'
import * as mockingoose from 'mockingoose'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import * as fhirService from '@config/services/fhirService'

const token = jwt.sign(
  { scope: ['natlsysadmin', 'demo'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:config-user'
  }
)

const fetch = fetchMock as fetchMock.FetchMock

const birthMockFormDraft = {
  status: 'DRAFT',
  _id: '623f30a18aef60124a72df14',
  event: 'death',
  comment: 'Modified previous death question',
  version: 2,
  createdAt: 1648308385612,
  updatedAt: 1648308396432,
  history: [
    {
      status: 'DRAFT',
      _id: '623f30ac8aef60124a72df1c',
      version: 1,
      comment: 'Added new death question',
      updatedAt: 1648308385612
    }
  ],
  __v: 0
}

const birthUpdatedMockFormDraft = {
  status: 'DRAFT',
  _id: '623f30a18aef60124a72df14',
  event: 'death',
  comment: 'Modified previous death question',
  version: 2,
  createdAt: 1648308385612,
  updatedAt: 1648308396432,
  history: [
    {
      status: 'IN_PREVIEW',
      _id: '623f30ac8aef60124a72df1c',
      version: 1,
      comment: 'Added new death question',
      updatedAt: 1648308385612
    }
  ],
  __v: 0
}

const deathMockFormDraft = {
  status: 'DRAFT',
  _id: '623f30c18aef60124a72df28',
  event: 'death',
  comment: 'Added new birth question',
  version: 1,
  createdAt: 1648308417889,
  updatedAt: 1648308457121,
  history: [],
  __v: 0
}

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

describe('modifyDraftStatusHandler test', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
    fetch.resetMocks()
    fetch.mockReject(new Error())
  })

  it('should update form draft status using mongoose', async () => {
    mockingoose(FormDraft).toReturn(birthMockFormDraft, 'findOne')
    mockingoose(FormDraft).toReturn(birthUpdatedMockFormDraft, 'updateOne')

    const res = await server.server.inject({
      method: 'PUT',
      url: '/formDraftStatus',
      payload: {
        event: 'birth',
        status: 'IN_PREVIEW'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(201)
  })

  it('should return error if wrong operation requested using mongoose', async () => {
    mockingoose(FormDraft).toReturn(birthMockFormDraft, 'findOne')
    mockingoose(FormDraft).toReturn(birthMockFormDraft, 'updateOne')

    const res = await server.server.inject({
      method: 'PUT',
      url: '/formDraftStatus',
      payload: {
        event: 'birth',
        status: 'PUBLISHED'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(400)
  })

  it('should return error if any error occured on update draft', async () => {
    mockingoose(FormDraft).toReturn(deathMockFormDraft, 'findOne')
    mockingoose(FormDraft).toReturn(new Error('boom'), 'updateOne')
    const res = await server.server.inject({
      method: 'PUT',
      url: '/formDraftStatus',
      payload: {
        event: 'death',
        status: 'IN_PREVIEW'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(400)
  })

  it('should delete all elastic and influx and fhir data', async () => {
    const birthMockForDeletedOperation = {
      ...birthUpdatedMockFormDraft,
      status: 'IN_PREVIEW'
    }
    const birthMockFormDraft = {
      ...birthUpdatedMockFormDraft,
      status: 'IN_PREVIEW'
    }
    mockingoose(FormDraft).toReturn(birthMockForDeletedOperation, 'findOne')
    mockingoose(FormDraft).toReturn(birthMockFormDraft, 'updateOne')
    fetch.mockResponse(
      JSON.stringify([
        {
          status: 'ok'
        },

        {
          status: 'ok'
        }
      ])
    )
    // @ts-ignore
    jest.spyOn(fhirService, 'fetchFHIR').mockReturnValue(taskBundleMock)
    // @ts-ignore
    jest.spyOn(fhirService, 'deleteFHIR').mockReturnValue({ status: 'ok' })

    const res = await server.server.inject({
      method: 'PUT',
      url: '/formDraftStatus',
      payload: {
        event: 'death',
        status: 'DRAFT'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(201)
  })

  it('should return error if any task has no configuration extension while update FormDraft to DELETE ', async () => {
    const birthMockFormDraft = {
      ...birthUpdatedMockFormDraft,
      status: 'DELETED'
    }
    mockingoose(FormDraft).toReturn(birthUpdatedMockFormDraft, 'findOne')
    mockingoose(FormDraft).toReturn(birthMockFormDraft, 'updateOne')
    fetch.mockResponse(
      JSON.stringify([
        {
          status: 'ok'
        },

        {
          status: 'ok'
        }
      ])
    )
    delete taskBundleMock.entry[0].resource.extension[1]
    // @ts-ignore
    jest.spyOn(fhirService, 'fetchFHIR').mockReturnValue(taskBundleMock)
    // @ts-ignore
    jest.spyOn(fhirService, 'deleteFHIR').mockReturnValue({ status: 'ok' })

    const res = await server.server.inject({
      method: 'PUT',
      url: '/formDraftStatus',
      payload: {
        event: 'death',
        status: 'DELETED'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(400)
  })
})
