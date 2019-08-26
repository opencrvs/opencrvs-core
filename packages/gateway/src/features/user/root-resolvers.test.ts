import { resolvers } from '@gateway/features/user/root-resolvers'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

beforeEach(() => {
  fetch.resetMocks()
})

describe('User root resolvers', () => {
  describe('getUser()', () => {
    it('returns a user object', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
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
          status: 'active',
          practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
          primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
          catchmentAreaIds: [
            'b21ce04e-7ccd-4d65-929f-453bc193a736',
            '95754572-ab6f-407b-b51a-1636cb3d0683',
            '7719942b-16a7-474a-8af1-cd0c94c730d2',
            '43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
          ],
          creationDate: 1559054406433
        })
      )

      const user = await resolvers.Query.getUser(
        {},
        { userId: 'ba7022f0ff4822' }
      )

      expect(user).toBeDefined()
    })
  })
  describe('searchUsers()', () => {
    const dummyUserList = [
      {
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
        status: 'active',
        practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
        primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
        catchmentAreaIds: [
          'b21ce04e-7ccd-4d65-929f-453bc193a736',
          '95754572-ab6f-407b-b51a-1636cb3d0683',
          '7719942b-16a7-474a-8af1-cd0c94c730d2',
          '43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
        ],
        creationDate: 1559054406433
      },
      {
        name: [
          {
            use: 'en',
            given: ['Md. Ariful'],
            family: ['Islam']
          }
        ],
        username: 'mdariful.islam',
        mobile: '+8801740012994',
        email: 'test@test.org',
        passwordHash:
          'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
        salt: '12345',
        role: 'FIELD_AGENT',
        status: 'active',
        practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
        primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
        catchmentAreaIds: [
          'b21ce04e-7ccd-4d65-929f-453bc193a736',
          '95754572-ab6f-407b-b51a-1636cb3d0683',
          '7719942b-16a7-474a-8af1-cd0c94c730d2',
          '43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
        ],
        creationDate: 1559054406444
      },
      {
        name: [
          {
            use: 'en',
            given: ['Mohammad'],
            family: ['Ashraful']
          }
        ],
        username: 'mohammad.ashraful',
        mobile: '+8801733333333',
        email: 'test@test.org',
        passwordHash:
          'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
        salt: '12345',
        role: 'LOCAL_REGISTRAR',
        status: 'active',
        practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
        primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
        catchmentAreaIds: [
          'b21ce04e-7ccd-4d65-929f-453bc193a736',
          '95754572-ab6f-407b-b51a-1636cb3d0683',
          '7719942b-16a7-474a-8af1-cd0c94c730d2',
          '43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
        ],
        creationDate: 1559054406555
      }
    ]
    it('returns full user list', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          totalItems: dummyUserList.length,
          results: dummyUserList
        })
      )

      const response = await resolvers.Query.searchUsers({}, {})

      expect(response.totalItems).toBe(3)
      expect(response.results).toEqual(dummyUserList)
    })
    it('returns filtered user list', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          totalItems: 1,
          results: [dummyUserList[2]]
        })
      )

      const response = await resolvers.Query.searchUsers(
        {},
        {
          username: 'mohammad.ashraful',
          mobile: '+8801733333333',
          email: 'test@test.org',
          role: 'LOCAL_REGISTRAR',
          status: 'active',
          primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
          locationId: '43ac3486-7df1-4bd9-9b5e-728054ccd6ba',
          count: 10,
          skip: 0,
          sort: 'desc'
        }
      )

      expect(response.totalItems).toBe(1)
      expect(response.results).toEqual([dummyUserList[2]])
    })
  })

  describe('getSiganture()', () => {
    const signatureData = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAo`
    const roleBundle = {
      resourceType: 'Bundle',
      id: 'e9b83485-0418-47a0-b62b-c9d80a89691b',
      meta: {
        lastUpdated: '2019-08-26T10:17:43.540+00:00'
      },
      total: 2,
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
              },
              {
                reference: 'Location/98fc6e35-7290-45b8-ac50-78f8075fcac5'
              },
              {
                reference: 'Location/b3e9c030-fce7-4b10-8179-9b9951e9d7fc'
              },
              {
                reference: 'Location/4422415a-f1b0-47c5-8332-7062294670ca'
              }
            ],
            meta: {
              lastUpdated: '2019-08-22T08:43:43.464+00:00',
              versionId: '667285e1-5df7-4158-a708-fc9fb983debf'
            },
            id: '7c246f38-90c7-4f80-8266-f884c6e7b491'
          },
          request: {
            method: 'POST',
            url: 'PractitionerRole'
          }
        }
      ]
    }
    const practitioner = {
      resourceType: 'Practitioner',
      identifier: [
        {
          use: 'official',
          system: 'mobile',
          value: '01733333333'
        }
      ],
      telecom: [
        {
          system: 'phone',
          value: '01733333333'
        }
      ],
      name: [
        {
          use: 'en',
          family: ['Ashraful'],
          given: ['Mohammad']
        },
        {
          use: 'bn',
          family: [''],
          given: ['']
        }
      ],
      gender: 'male',
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
      meta: {
        lastUpdated: '2019-08-22T08:43:43.462+00:00',
        versionId: 'e7f7d206-d124-4c20-82ce-277f1b066587'
      },
      id: 'dd78cad3-26dc-469a-bddb-0b45ae489491'
    }

    it('returns user signature', async () => {
      fetch.mockResponses(
        [JSON.stringify(roleBundle), { status: 200 }],
        [JSON.stringify(practitioner), { status: 200 }]
      )

      const response = await resolvers.Query.getSignature(
        {},
        { locationId: '54538456-fcf6-4276-86ac-122a7eb47703' }
      )

      expect(response).toEqual({
        type: 'image/png',
        data: signatureData
      })
    })
  })

  describe('activateUser mutation', () => {
    it('activates the pending user', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({
            userId: 'ba7022f0ff4822'
          }),
          { status: 201 }
        ],
        [JSON.stringify({})]
      )

      const response = await resolvers.Mutation.activateUser(
        {},
        {
          userId: 'ba7022f0ff4822',
          password: 'test',
          securityQNAs: [{ questionKey: 'HOME_TOWN', answer: 'test' }]
        }
      )

      expect(response).toEqual({
        userId: 'ba7022f0ff4822'
      })
    })
    it('throws error if /activateUser sends anything but 201', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          statusCode: '401'
        })
      )

      expect(
        resolvers.Mutation.activateUser(
          {},
          {
            userId: 'ba7022f0ff4822',
            password: 'test',
            securityQNAs: [{ questionKey: 'HOME_TOWN', answer: 'test' }]
          }
        )
      ).rejects.toThrowError(
        "Something went wrong on user-mgnt service. Couldn't activate given user"
      )
    })
  })

  describe('createUser mutation', () => {
    const user = {
      name: [{ use: 'en', given: ['Mohammad'], family: 'Ashraful' }],
      identifiers: [{ system: 'NATIONAL_ID', value: '1014881922' }],
      username: 'mohammad.ashraful',
      mobile: '+8801733333333',
      email: 'test@test.org',
      role: 'LOCAL_REGISTRAR',
      type: 'HOSPITAL',
      status: 'active',
      primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a'
    }

    it('creates user', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          username: 'someUser123'
        }),
        { status: 201 }
      )

      const response = await resolvers.Mutation.createUser({}, { user })

      expect(response).toEqual({
        username: 'someUser123'
      })
    })

    it('should throw error when /createUser sends anything but 201', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          statusCode: '201'
        }),
        { status: 400 }
      )

      expect(resolvers.Mutation.createUser({}, { user })).rejects.toThrowError(
        "Something went wrong on user-mgnt service. Couldn't create user"
      )
    })
  })
})
