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
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
// eslint-disable-next-line import/no-relative-parent-imports
import { createServer } from '@workflow/server'
import {
  motherMock,
  officeMock,
  relatedPersonMock,
  testFhirBundleWithIds,
  testFhirBundleWithIdsForDeath
} from '@workflow/test/utils'
import * as fetchAny from 'jest-fetch-mock'
import { cloneDeep } from 'lodash'
import { BIRTH_BUNDLE, DEATH_BUNDLE } from '@opencrvs/commons/fixtures'
import { server as mswServer } from '@test/setupServer'
import { rest } from 'msw'
import { TransactionResponse } from '@workflow/records/fhir'
import { URLReference } from '@opencrvs/commons/types'
const fetch = fetchAny as any

const mockInput = [
  {
    valueCode: 'child',
    valueId: 'name',
    type: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/action-type',
          code: 'update'
        }
      ]
    },
    valueString: 'Khaby Lame'
  },
  {
    valueCode: 'mother',
    valueId: 'name',
    type: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/action-type',
          code: 'update'
        }
      ]
    },
    valueString: 'First Name Last Name'
  }
]

const mockOutput = [
  {
    valueCode: 'child',
    valueId: 'name',
    type: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/action-type',
          code: 'update'
        }
      ]
    },
    valueString: 'Khaby Lame Corrected'
  },
  {
    valueCode: 'mother',
    valueId: 'name',
    type: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/action-type',
          code: 'update'
        }
      ]
    },
    valueString: 'Mother Family Name'
  }
]
const bundleWithInputOutput: any = cloneDeep(testFhirBundleWithIds)
const bundleWithInputOutputDeath: any = cloneDeep(testFhirBundleWithIdsForDeath)

bundleWithInputOutput.entry[1].resource.input = mockInput
bundleWithInputOutputDeath.entry[1].resource.input = mockInput

bundleWithInputOutput.entry[1].resource.output = mockOutput
bundleWithInputOutputDeath.entry[1].resource.output = mockOutput

describe('markEventAsRegisteredCallbackHandler', () => {
  let server: any
  let token: any
  beforeEach(async () => {
    token = jwt.sign({ scope: ['register'] }, readFileSync('./test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:workflow-user'
    })
    fetch.resetMocks()
    server = await createServer()

    jest
      .spyOn(require('./fhir/fhir-utils'), 'getInformantName')
      .mockReturnValue('informant name')
  })

  it('returns error', async () => {
    fetch.mockResponses(
      [officeMock, { status: 200 }],
      [relatedPersonMock, { status: 200 }],
      [motherMock, { status: 200 }]
    )
    const res = await server.server.inject({
      method: 'POST',
      url: '/confirm/registration',
      payload: {
        error: "Couldn't generate registration number"
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(500)
  })

  it('returns OK with birth registration', async () => {
    mswServer.use(
      rest.get('http://localhost:9090/records/123', (_, res, ctx) =>
        res(ctx.json(BIRTH_BUNDLE))
      ),
      rest.post('http://localhost:3447/fhir', (_, res, ctx) => {
        const responseBundle: TransactionResponse = {
          resourceType: 'Bundle',
          type: 'batch-response',
          entry: [
            {
              response: {
                status: '200',
                location:
                  '/fhir/Task/f00e742a-0900-488b-b7c1-9625d7b7e456/_history/dc39332f-a5d7-4422-ba7b-bc99a958e8cb' as URLReference
              }
            },
            {
              response: {
                status: '200',
                location:
                  '/fhir/Patient/8cb74e54-1c02-41a7-86a3-415c4031c9ba/_history/dc39332f-a5d7-4422-ba7b-bc99a958e8cb' as URLReference
              }
            }
          ]
        }
        return res(ctx.json(responseBundle))
      }),
      rest.post(
        'http://localhost:2525/events/birth/mark-registered',
        (_, res, ctx) => res(ctx.status(200))
      )
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/confirm/registration',
      payload: {
        registrationNumber: '12345678',
        compositionId: '123'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('returns OK with death registration', async () => {
    mswServer.use(
      rest.get('http://localhost:9090/records/123', (_, res, ctx) =>
        res(ctx.json(DEATH_BUNDLE))
      ),
      rest.get('http://localhost:2021/integrationConfig', (_, res, ctx) =>
        res(ctx.json({}))
      ),
      rest.post(
        'http://localhost:1050/events/death/registered',
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.post('http://localhost:3447/fhir', (_, res, ctx) => {
        const responseBundle: TransactionResponse = {
          resourceType: 'Bundle',
          type: 'batch-response',
          entry: [
            {
              response: {
                status: '200',
                location:
                  '/fhir/Task/f00e742a-0900-488b-b7c1-9625d7b7e456/_history/dc39332f-a5d7-4422-ba7b-bc99a958e8cb' as URLReference
              }
            },
            {
              response: {
                status: '200',
                location:
                  '/fhir/Patient/8cb74e54-1c02-41a7-86a3-415c4031c9ba/_history/dc39332f-a5d7-4422-ba7b-bc99a958e8cb' as URLReference
              }
            }
          ]
        }
        return res(ctx.json(responseBundle))
      }),
      rest.post(
        'http://localhost:2525/events/death/mark-registered',
        (_, res, ctx) => res(ctx.status(200))
      )
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/confirm/registration',
      payload: {
        registrationNumber: '12345678',
        compositionId: '123'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
})
