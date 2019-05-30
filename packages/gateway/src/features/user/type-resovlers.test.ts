import { userTypeResolvers } from './type-resovlers'
import * as fetch from 'jest-fetch-mock'

beforeEach(() => {
  fetch.resetMocks()
})

describe('User type resolvers', () => {
  const mockResponse = {
    _id: 'ba7022f0ff4822',
    name: [
      {
        use: 'en',
        given: ['Sakib Al'],
        family: ['Hasan']
      }
    ],
    username: 'sakibal.hasan',
    mobile: '+8801711111111',
    email: 'test@test.org',
    passwordHash:
      'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
    salt: '12345',
    role: 'FIELD_AGENT',
    active: true,
    practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
    primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
    catchmentAreaIds: [
      'b21ce04e-7ccd-4d65-929f-453bc193a736',
      '95754572-ab6f-407b-b51a-1636cb3d0683',
      '7719942b-16a7-474a-8af1-cd0c94c730d2',
      '43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
    ],
    creationDate: 1559054406433
  }
  it('return id type', () => {
    const res = userTypeResolvers.User.id(mockResponse)
    expect(res).toEqual('ba7022f0ff4822')
  })
  it('return userMgntUserID type', () => {
    const res = userTypeResolvers.User.userMgntUserID(mockResponse)
    expect(res).toEqual('ba7022f0ff4822')
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
    fetch.mockResponseOnce(JSON.stringify(mockOffice))
    const res = await userTypeResolvers.User.primaryOffice(mockResponse)
    expect(res).toEqual(mockOffice)
  })
  it('return catchmentArea type', async () => {
    const mockLocations = [
      {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/a2i-internal-id',
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
            system: 'http://opencrvs.org/specs/id/a2i-internal-id',
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
            system: 'http://opencrvs.org/specs/id/a2i-internal-id',
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
            system: 'http://opencrvs.org/specs/id/a2i-internal-id',
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
    fetch.mockResponses(
      [JSON.stringify(mockLocations[0]), { status: 200 }],
      [JSON.stringify(mockLocations[1]), { status: 200 }],
      [JSON.stringify(mockLocations[2]), { status: 200 }],
      [JSON.stringify(mockLocations[3]), { status: 200 }]
    )
    const res = await userTypeResolvers.User.catchmentArea(mockResponse)
    expect(res).toEqual(mockLocations)
  })
})
