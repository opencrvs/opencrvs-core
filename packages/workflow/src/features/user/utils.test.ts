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
import {
  getLoggedInPractitionerResource,
  getUser,
  getLoggedInPractitionerPrimaryLocation,
  getPrimaryLocationFromLocationList,
  getPractitionerRef
} from '@workflow/features/user/utils'
import {
  userMock,
  fieldAgentPractitionerMock,
  fieldAgentPractitionerRoleMock,
  districtMock,
  upazilaMock,
  unionMock,
  officeMock
} from '@workflow/test/utils'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'

import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

describe('Verify getLoggedInPractitionerResource', () => {
  it('Returns Location properly', async () => {
    fetch.mockResponses(
      [
        JSON.stringify({
          practitionerId: 'e0daf66b-509e-4f45-86f3-f922b74f3dbf'
        }),
        { status: 200 }
      ],
      [
        JSON.stringify({
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
        }),
        { status: 200 }
      ]
    )
    const token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('../auth/test/cert.key'),
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
      readFileSync('../auth/test/cert.key'),
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
    fetch.mockImplementationOnce(() => ({ ok: false, status: 401 }))
    await expect(
      getUser('XXX', { Authorization: 'bearer acd ' })
    ).rejects.toThrowError(
      'Unable to retrieve user mobile number. Error: 401 status received'
    )
  })
})
describe('Verify getLoggedInPractitionerPrimaryLocation', () => {
  it('returns the primary location', async () => {
    const token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('../auth/test/cert.key'),
      {
        subject: '5bdc55ece42c82de9a529c36',
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )
    fetch.mockResponses(
      [userMock, { status: 200 }],
      [fieldAgentPractitionerMock, { status: 200 }],
      [fieldAgentPractitionerRoleMock, { status: 200 }],
      [districtMock, { status: 200 }],
      [upazilaMock, { status: 200 }],
      [unionMock, { status: 200 }],
      [officeMock, { status: 200 }]
    )
    const primaryLocation = await getLoggedInPractitionerPrimaryLocation(token)

    expect(primaryLocation).toBeDefined()
    expect(primaryLocation).toEqual(JSON.parse(unionMock))
  })
  it('throws errof if valid practioner is not found', async () => {
    const token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('../auth/test/cert.key'),
      {
        subject: '5bdc55ece42c82de9a529c36',
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )
    fetch.mockResponses(
      [
        JSON.stringify({
          mobile: '+880711111111'
        }),
        { status: 200 }
      ],
      [
        JSON.stringify({
          resourceType: 'Bundle',
          id: 'eacae600-a501-42d6-9d59-b8b94f3e50c1',
          meta: { lastUpdated: '2018-11-27T17:13:20.662+00:00' },
          type: 'searchset',
          total: 1,
          link: [
            {
              relation: 'self',
              url: 'http://localhost:3447/fhir/Practitioner?telecom=phone%7C01711111111'
            }
          ],
          entry: [
            {
              fullUrl:
                'http://localhost:3447/fhir/Practitioner/b1f46aba-075d-431e-8aeb-ebc57a4a0ad0',
              resource: {}
            }
          ]
        }),
        { status: 200 }
      ]
    )
    expect(getLoggedInPractitionerPrimaryLocation(token)).rejects.toThrowError()
  })
  it('throws errof if practioner does not have any valid role entry', async () => {
    const token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('../auth/test/cert.key'),
      {
        subject: '5bdc55ece42c82de9a529c36',
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:workflow-user'
      }
    )
    fetch.mockResponses(
      [
        JSON.stringify({
          mobile: '+880711111111'
        }),
        { status: 200 }
      ],
      [
        JSON.stringify({
          resourceType: 'Bundle',
          id: 'eacae600-a501-42d6-9d59-b8b94f3e50c1',
          meta: { lastUpdated: '2018-11-27T17:13:20.662+00:00' },
          type: 'searchset',
          total: 1,
          link: [
            {
              relation: 'self',
              url: 'http://localhost:3447/fhir/Practitioner?telecom=phone%7C01711111111'
            }
          ],
          entry: [
            {
              fullUrl:
                'http://localhost:3447/fhir/Practitioner/b1f46aba-075d-431e-8aeb-ebc57a4a0ad0',
              resource: {
                resourceType: 'Practitioner',
                identifier: [
                  { use: 'official', system: 'mobile', value: '01711111111' }
                ],
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
            }
          ]
        }),
        { status: 200 }
      ],
      [
        JSON.stringify({
          resourceType: 'Bundle',
          id: 'eacae600-a501-42d6-9d59-b8b94f3e50c1',
          meta: { lastUpdated: '2018-11-27T17:13:20.662+00:00' },
          type: 'searchset',
          total: 1,
          link: [
            {
              relation: 'self',
              url: 'http://localhost:3447/fhir/Practitioner?telecom=phone%7C01711111111'
            }
          ],
          entry: [
            {
              fullUrl:
                'http://localhost:3447/fhir/Practitioner/b1f46aba-075d-431e-8aeb-ebc57a4a0ad0',
              resource: {}
            }
          ]
        }),
        { status: 200 }
      ]
    )
    expect(getLoggedInPractitionerPrimaryLocation(token)).rejects.toThrowError(
      'PractitionerRole has no locations associated'
    )
  })
})
describe('Verify getPrimaryLocationFromLocationList', () => {
  it('returns the primary location properly', () => {
    const locations = [
      JSON.parse(districtMock),
      JSON.parse(upazilaMock),
      JSON.parse(unionMock),
      JSON.parse(officeMock)
    ]
    const primaryLocation = getPrimaryLocationFromLocationList(
      locations as [fhir.Location]
    )
    expect(primaryLocation).toBeDefined()
    expect(primaryLocation).toEqual(JSON.parse(unionMock))
  })
  it('throws error if no CRVS office is found', () => {
    const locations = [
      {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/geo-id',
            value: '165'
          },
          { system: 'http://opencrvs.org/specs/id/bbs-code', value: '34' },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'UPAZILA'
          }
        ]
      },
      {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/geo-id',
            value: '165'
          },
          { system: 'http://opencrvs.org/specs/id/bbs-code', value: '21' },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'UNION'
          }
        ]
      }
    ]
    expect(() =>
      getPrimaryLocationFromLocationList(locations as [fhir.Location])
    ).toThrowError('No CRVS office found')
  })
  it('throws error if no primary location for crvs office found', () => {
    const locations = [
      {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/geo-id',
            value: '165'
          },
          { system: 'http://opencrvs.org/specs/id/bbs-code', value: '21' },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'UNION'
          }
        ]
      },
      {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/geo-id',
            value: '165'
          },
          { system: 'http://opencrvs.org/specs/id/bbs-code', value: '10' },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'CRVS_OFFICE'
          }
        ],
        type: {
          coding: [{ code: 'CRVS_OFFICE' }]
        },
        physicalType: {
          coding: [
            {
              code: 'bu',
              display: 'Building'
            }
          ]
        }
      }
    ]
    expect(() =>
      getPrimaryLocationFromLocationList(locations as [fhir.Location])
    ).toThrowError('No primary location found')
  })
  it('throws error if crvs office has a invalid location id', () => {
    const locations = [
      {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/geo-id',
            value: '165'
          },
          { system: 'http://opencrvs.org/specs/id/bbs-code', value: '10' },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'CRVS_OFFICE'
          }
        ],
        partOf: {
          reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacdy48y'
        },
        type: {
          coding: [{ code: 'CRVS_OFFICE' }]
        },
        physicalType: {
          coding: [
            {
              code: 'bu',
              display: 'Building'
            }
          ]
        }
      }
    ]
    expect(() =>
      getPrimaryLocationFromLocationList(locations as [fhir.Location])
    ).toThrowError(
      'No primary location not found for office: d33e4cb2-670e-4564-a8ed-c72baacdy48y'
    )
  })
})
describe('Verify getPractitionerRef', () => {
  it('returns practinioner ref properly', () => {
    const practitioner = {
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
    }
    expect(() => getPractitionerRef(practitioner)).toThrowError(
      'Invalid practitioner data found'
    )
  })
})
