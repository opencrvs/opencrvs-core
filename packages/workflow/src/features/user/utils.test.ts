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
import {
  getLoggedInPractitionerResource,
  getUser,
  getPractitionerRef
} from '@workflow/features/user/utils'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'

import * as fetchAny from 'jest-fetch-mock'
import { Practitioner } from '@opencrvs/commons/types'
import { rest } from 'msw'
import { server as mswServer } from '@test/setupServer'
import { USER_MANAGEMENT_URL } from '@workflow/__mocks__/constants'

const fetch = fetchAny as any

describe('Verify getLoggedInPractitionerResource', () => {
  it('Returns Location properly', async () => {
    mswServer.use(
      rest.post('http://localhost:3030/getUser', (_, res, ctx) =>
        res(
          ctx.json({
            practitionerId: '1234'
          })
        )
      )
    )

    mswServer.use(
      rest.get(`http://localhost:3447/fhir/Practitioner/1234`, (_, res, ctx) =>
        res(
          ctx.json({
            resourceType: 'Practitioner',
            identifier: [
              { use: 'official', system: 'mobile', value: '01711111111' }
            ],
            telecom: [{ system: 'phone', value: '01711111111' }],
            name: [
              { use: 'en', family: ['Al Hasan'], given: ['Shakib'] },
              { use: 'bn', family: [''], given: [''] }
            ],
            gender: 'male',
            meta: {
              lastUpdated: '2018-11-25T17:31:08.062+00:00',
              versionId: '7b21f3ac-2d92-46fc-9b87-c692aa81c858'
            },
            id: 'e0daf66b-509e-4f45-86f3-f922b74f3dbf'
          })
        )
      )
    )

    const token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('./test/cert.key'),
      {
        subject: '5bdc55ece42c82de9a529c36',
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )
    const location = await getLoggedInPractitionerResource(token)
    expect(location).toEqual({
      resourceType: 'Practitioner',
      identifier: [{ use: 'official', system: 'mobile', value: '01711111111' }],
      telecom: [{ system: 'phone', value: '01711111111' }],
      name: [
        { use: 'en', family: ['Al Hasan'], given: ['Shakib'] },
        { use: 'bn', family: [''], given: [''] }
      ],
      gender: 'male',
      meta: {
        lastUpdated: '2018-11-25T17:31:08.062+00:00',
        versionId: '7b21f3ac-2d92-46fc-9b87-c692aa81c858'
      },
      id: 'e0daf66b-509e-4f45-86f3-f922b74f3dbf'
    })
  })
  it('Throws error when partitioner resource is not there', async () => {
    fetch.mockResponses(
      [
        JSON.stringify({
          mobile: '+880711111111'
        }),
        { status: 200 }
      ],
      [{}, { status: 401 }]
    )
    const token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('./test/cert.key'),
      {
        subject: '5bdc55ece42c82de9a529c36',
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )
    expect(getLoggedInPractitionerResource(token)).rejects.toThrowError()
  })
})
describe('Verify getUser', () => {
  it('get user mobile throw an error in case of an bad response', async () => {
    mswServer.use(
      rest.post(`${USER_MANAGEMENT_URL}getUser`, (_, res, ctx) =>
        res(ctx.status(401))
      )
    )

    await expect(
      getUser('XXX', { Authorization: 'bearer acd ' })
    ).rejects.toThrowError(
      'Unable to retrieve user in workflow. Error: 401 status received'
    )
  })
})

describe('Verify getPractitionerRef', () => {
  it('returns practinioner ref properly', () => {
    const practitioner: Practitioner = {
      resourceType: 'Practitioner',
      identifier: [{ use: 'official', system: 'mobile', value: '01711111111' }],
      telecom: [{ system: 'phone', value: '01711111111' }],
      name: [
        { use: 'en', family: 'Al Hasan', given: ['Shakib'] },
        { use: 'bn', family: '', given: [''] }
      ],
      gender: 'male',
      meta: {
        lastUpdated: '2018-11-25T17:31:08.062+00:00',
        versionId: '7b21f3ac-2d92-46fc-9b87-c692aa81c858'
      },
      id: 'e0daf66b-509e-4f45-86f3-f922b74f3dbf'
    }
    expect(getPractitionerRef(practitioner)).toEqual(
      'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
    )
  })
  it('throws error if invalid practioner data is provided', () => {
    const practitioner = {
      resourceType: 'Practitioner',
      gender: 'male',
      meta: {
        lastUpdated: '2018-11-25T17:31:08.062+00:00',
        versionId: '7b21f3ac-2d92-46fc-9b87-c692aa81c858'
      }
    } as Practitioner
    expect(() => getPractitionerRef(practitioner)).toThrowError(
      'Invalid practitioner data found'
    )
  })
})
