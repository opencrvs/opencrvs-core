import {
  getLoggedInPractitionerResource,
  getUserMobile,
  getLoggedInPractitionerPrimaryLocation,
  getPrimaryLocationFromLocationList,
  getPractitionerRef
} from '@workflow/features/user/utils'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { logger } from '@workflow/logger'

import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

describe('Verify getLoggedInPractitionerResource', () => {
  it('Returns Location properly', async () => {
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
              url:
                'http://localhost:3447/fhir/Practitioner?telecom=phone%7C01711111111'
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
                  { use: 'en', family: ['Al Hasan'], given: ['Shakib'] },
                  { use: 'bn', family: [''], given: [''] }
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
      [
        JSON.stringify({
          data: 'ivalid'
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
    expect(getLoggedInPractitionerResource(token)).rejects.toThrowError()
  })
})
describe('Verify getUserMobile', () => {
  it('get user mobile logs an error in case of invalid token', async () => {
    const logSpy = jest.spyOn(logger, 'error')
    fetch.mockImplementationOnce(() => {
      throw new Error('Mock Error')
    })
    getUserMobile('XXX', { Authorization: 'bearer acd ' })
    expect(logSpy).toHaveBeenLastCalledWith(
      'Unable to retrieve mobile for error : Error: Mock Error'
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
              url:
                'http://localhost:3447/fhir/Practitioner?telecom=phone%7C01711111111'
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
          entry: [
            {
              fullUrl:
                'http://localhost:3447/fhir/PractitionerRole/9c8b8ac2-9044-4b66-8d31-07c5a4b4348d',
              resource: {
                resourceType: 'PractitionerRole',
                practitioner: {
                  reference: 'Practitioner/e0daf66b-509e-4f45-86f3-f922b74f3dbf'
                },
                code: [
                  {
                    coding: [
                      {
                        system: 'http://opencrvs.org/specs/roles',
                        code: 'FIELD_AGENT'
                      }
                    ]
                  }
                ],
                location: [
                  {
                    reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacd9173'
                  },
                  {
                    reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacdxxx'
                  },
                  {
                    reference: 'Location/d33e4cb2-670e-4564-a8ed-c72baacdyyyy'
                  }
                ],
                meta: {
                  lastUpdated: '2018-11-25T17:31:08.096+00:00',
                  versionId: '2f79ee2d-3b78-4c90-91d8-278e4a28caf7'
                },
                id: '9c8b8ac2-9044-4b66-8d31-07c5a4b4348d'
              }
            }
          ]
        }),
        { status: 200 }
      ],
      [
        JSON.stringify({
          resourceType: 'Location',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
              value: '165'
            },
            { system: 'http://opencrvs.org/specs/id/bbs-code', value: '34' },
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'UPAZILA'
            }
          ]
        }),
        { status: 200 }
      ],
      [
        JSON.stringify({
          resourceType: 'Location',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
              value: '165'
            },
            { system: 'http://opencrvs.org/specs/id/bbs-code', value: '21' },
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'UNION'
            }
          ],
          physicalType: {
            coding: [
              {
                code: 'bu',
                display: 'Building'
              }
            ]
          }
        }),
        { status: 200 }
      ],
      [
        JSON.stringify({
          resourceType: 'Location',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
              value: '165'
            },
            { system: 'http://opencrvs.org/specs/id/bbs-code', value: '10' },
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'DISTRICT'
            }
          ]
        }),
        { status: 200 }
      ]
    )
    const primaryOffice = await getLoggedInPractitionerPrimaryLocation(token)

    expect(primaryOffice).toBeDefined()
    expect(primaryOffice).toEqual({
      resourceType: 'Location',
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/a2i-internal-id',
          value: '165'
        },
        { system: 'http://opencrvs.org/specs/id/bbs-code', value: '21' },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'UNION'
        }
      ],
      physicalType: {
        coding: [
          {
            code: 'bu',
            display: 'Building'
          }
        ]
      }
    })
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
              url:
                'http://localhost:3447/fhir/Practitioner?telecom=phone%7C01711111111'
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
      'Invalid practioner found'
    )
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
              url:
                'http://localhost:3447/fhir/Practitioner?telecom=phone%7C01711111111'
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
              url:
                'http://localhost:3447/fhir/Practitioner?telecom=phone%7C01711111111'
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
      {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/a2i-internal-id',
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
            system: 'http://opencrvs.org/specs/id/a2i-internal-id',
            value: '165'
          },
          { system: 'http://opencrvs.org/specs/id/bbs-code', value: '21' },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'UNION'
          }
        ],
        physicalType: {
          coding: [
            {
              code: 'bu',
              display: 'Building'
            }
          ]
        }
      },
      {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/a2i-internal-id',
            value: '165'
          },
          { system: 'http://opencrvs.org/specs/id/bbs-code', value: '10' },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ]
      }
    ]
    const primaryOffice = getPrimaryLocationFromLocationList(locations as [
      fhir.Location
    ])
    expect(primaryOffice).toBeDefined()
    expect(primaryOffice).toEqual({
      resourceType: 'Location',
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/a2i-internal-id',
          value: '165'
        },
        { system: 'http://opencrvs.org/specs/id/bbs-code', value: '21' },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'UNION'
        }
      ],
      physicalType: {
        coding: [
          {
            code: 'bu',
            display: 'Building'
          }
        ]
      }
    })
  })
  it('throws error if no primary office is found', () => {
    const locations = [
      {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/a2i-internal-id',
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
            system: 'http://opencrvs.org/specs/id/a2i-internal-id',
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
            system: 'http://opencrvs.org/specs/id/a2i-internal-id',
            value: '165'
          },
          { system: 'http://opencrvs.org/specs/id/bbs-code', value: '10' },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ]
      }
    ]
    expect(() =>
      getPrimaryLocationFromLocationList(locations as [fhir.Location])
    ).toThrowError('No primary office found')
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
