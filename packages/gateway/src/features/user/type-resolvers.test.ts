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
  IUserModelData,
  userTypeResolvers
} from '@gateway/features/user/type-resolvers'
import * as fetch from 'jest-fetch-mock'
import LocationsAPI from '@gateway/features/fhir/locationsAPI'

const mockGet = jest.fn()
jest.mock('apollo-datasource-rest', () => {
  class MockRESTDataSource {
    get = mockGet
  }
  return {
    RESTDataSource: MockRESTDataSource
  }
})

beforeEach(() => {
  fetch.resetMocks()
})

describe('User type resolvers', () => {
  afterEach(() => {
    mockGet.mockReset()
  })

  const mockResponse: IUserModelData = {
    _id: 'ba7022f0ff4822',
    name: [
      {
        use: 'en',
        given: ['Tamim'],
        family: 'Iqbal'
      }
    ],
    username: 'tamim.iqlbal',
    mobile: '+8801711111111',
    email: 'test@test.org',
    identifiers: [{ system: 'NATIONAL_ID', value: '1010101010' }],
    systemRole: 'REGISTRATION_AGENT',
    scope: ['certify'],
    status: 'active',
    practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
    primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
    catchmentAreaIds: [
      'b21ce04e-7ccd-4d65-929f-453bc193a736',
      '95754572-ab6f-407b-b51a-1636cb3d0683',
      '7719942b-16a7-474a-8af1-cd0c94c730d2',
      '43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
    ],
    creationDate: '1559054406433',
    role: {
      labels: [
        {
          lang: 'en',
          label: 'MAYOR'
        }
      ]
    },
    device: ''
  }
  it('return id type', () => {
    const res = userTypeResolvers.User.id(mockResponse)
    expect(res).toEqual('ba7022f0ff4822')
  })
  it('return userMgntUserID type', () => {
    const res = userTypeResolvers.User.userMgntUserID(mockResponse)
    expect(res).toEqual('ba7022f0ff4822')
  })
  it('return suspicious user flag', () => {
    const underInvestigationUserMockResponse = mockResponse
    underInvestigationUserMockResponse.status = 'deactivated'
    underInvestigationUserMockResponse.auditHistory = [
      {
        auditedBy: 'DUMMY_AUDITOR_ID',
        auditedOn: 1234897987,
        action: 'DEACTIVATE',
        reason: 'SUSPICIOUS'
      }
    ]
    const res = userTypeResolvers.User.underInvestigation(mockResponse)
    expect(res).toBeTruthy()
  })
  it('return user identifier', () => {
    const res = userTypeResolvers.User.identifier(mockResponse)
    expect(res).toEqual({
      system: mockResponse.identifiers[0].system,
      value: mockResponse.identifiers[0].value
    })
  })
  it('return primaryOffice type', async () => {
    const mockOffice = {
      resourceType: 'Location',
      name: 'Moktarpur Union Parishad',
      alias: ['মোক্তারপুর ইউনিয়ন পরিষদ'],
      status: 'active',
      partOf: {
        reference: 'Location/43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
      },
      type: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/location-type',
            code: 'CRVS_OFFICE'
          }
        ]
      },
      physicalType: {
        coding: [
          {
            code: 'bu',
            display: 'Building'
          }
        ]
      },
      address: {
        line: ['Moktarpur', 'Kaliganj'],
        district: 'Gazipur',
        state: 'Dhaka'
      },
      id: '79776844-b606-40e9-8358-7d82147f702a'
    }
    mockGet.mockResolvedValueOnce(mockOffice)
    const res = await userTypeResolvers.User.primaryOffice(
      mockResponse,
      undefined,
      { dataSources: { locationsAPI: new LocationsAPI() } }
    )
    expect(res).toEqual(mockOffice)
  })
  it('return catchmentArea type', async () => {
    const mockLocations = [
      {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/geo-id',
            value: '3'
          },
          {
            system: 'http://opencrvs.org/specs/id/bbs-code',
            value: '30'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DIVISION'
          }
        ],
        name: 'Dhaka',
        alias: ['ঢাকা'],
        description: 'division=3',
        status: 'active',
        partOf: {
          reference: 'Location/0'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        id: 'b21ce04e-7ccd-4d65-929f-453bc193a736'
      },
      {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/geo-id',
            value: '20'
          },
          {
            system: 'http://opencrvs.org/specs/id/bbs-code',
            value: '33'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Gazipur',
        alias: ['গাজীপুর '],
        description: 'division=3&district=20',
        status: 'active',
        partOf: {
          reference: 'Location/b21ce04e-7ccd-4d65-929f-453bc193a736'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        id: '95754572-ab6f-407b-b51a-1636cb3d0683'
      },
      {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/geo-id',
            value: '165'
          },
          {
            system: 'http://opencrvs.org/specs/id/bbs-code',
            value: '34'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'UPAZILA'
          }
        ],
        name: 'Kaliganj',
        alias: ['কালীগঞ্জ'],
        description: 'division=3&district=20&upazila=165',
        status: 'active',
        partOf: {
          reference: 'Location/95754572-ab6f-407b-b51a-1636cb3d0683'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        id: '7719942b-16a7-474a-8af1-cd0c94c730d2'
      },
      {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/geo-id',
            value: '3476'
          },
          {
            system: 'http://opencrvs.org/specs/id/bbs-code',
            value: '94'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'UNION'
          }
        ],
        name: 'Moktarpur',
        alias: ['মোক্তারপুর'],
        description: 'division=3&district=20&upazila=165&union=3476',
        status: 'active',
        partOf: {
          reference: 'Location/7719942b-16a7-474a-8af1-cd0c94c730d2'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        id: '43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
      }
    ]
    mockGet
      .mockResolvedValueOnce(mockLocations[0])
      .mockResolvedValueOnce(mockLocations[1])
      .mockResolvedValueOnce(mockLocations[2])
      .mockResolvedValueOnce(mockLocations[3])

    const res = await userTypeResolvers.User.catchmentArea(
      mockResponse,
      undefined,
      {
        dataSources: { locationsAPI: new LocationsAPI() }
      }
    )
    expect(res).toEqual(mockLocations)
  })

  it('return user signature as registration agent', async () => {
    const signatureData = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAo`
    const roleBundle = {
      resourceType: 'Bundle',
      id: 'e9b83485-0418-47a0-b62b-c9d80a89691b',
      total: 1,
      entry: [
        {
          resource: {
            resourceType: 'PractitionerRole',
            practitioner: {
              reference: 'Practitioner/dd78cad3-26dc-469a-bddb-0b45ae489491'
            },
            code: [
              {
                coding: [
                  {
                    system: 'http://opencrvs.org/specs/roles',
                    code: 'LOCAL_REGISTRAR'
                  }
                ]
              }
            ],
            location: [
              {
                reference: 'Location/54538456-fcf6-4276-86ac-122a7eb47703'
              },
              {
                reference: 'Location/319b0d8f-e330-45b8-8bd5-863a234d4cc5'
              }
            ],
            id: '7c246f38-90c7-4f80-8266-f884c6e7b491'
          }
        }
      ]
    }
    const practitioner = {
      resourceType: 'Practitioner',
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/employee-signature',
          valueSignature: {
            type: [
              {
                system: 'urn:iso-astm:E1762-95:2013',
                code: '1.2.840.10065.1.12.1.13',
                display: 'Review Signature'
              }
            ],
            when: '2019-08-22T08:43:43.461Z',
            contentType: 'image/png',
            blob: signatureData
          }
        }
      ],
      id: 'dd78cad3-26dc-469a-bddb-0b45ae489491'
    }

    fetch.mockResponses(
      [JSON.stringify(roleBundle), { status: 200 }],
      [JSON.stringify(practitioner), { status: 200 }]
    )

    const response = await userTypeResolvers.User.localRegistrar(
      mockResponse,
      undefined,
      { headers: undefined }
    )

    expect(response).toEqual({
      role: 'LOCAL_REGISTRAR',
      name: undefined,
      signature: { type: 'image/png', data: signatureData }
    })
  })

  it('return user signature as registrar', async () => {
    const signatureData = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAo`

    const practitioner = {
      resourceType: 'Practitioner',
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/employee-signature',
          valueSignature: {
            type: [
              {
                system: 'urn:iso-astm:E1762-95:2013',
                code: '1.2.840.10065.1.12.1.13',
                display: 'Review Signature'
              }
            ],
            when: '2019-08-22T08:43:43.461Z',
            contentType: 'image/png',
            blob: signatureData
          }
        }
      ],
      id: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de'
    }

    fetch.mockResponseOnce(JSON.stringify(practitioner), { status: 200 })

    const userResponse = mockResponse
    userResponse.scope.push('register')

    const response = await userTypeResolvers.User.localRegistrar(
      userResponse,
      undefined,
      { headers: undefined }
    )

    expect(response).toEqual({
      role: 'REGISTRATION_AGENT',
      signature: {
        type: 'image/png',
        data: signatureData
      }
    })
  })
})
