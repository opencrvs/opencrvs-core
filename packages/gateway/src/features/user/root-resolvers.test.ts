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
        active: true,
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
        active: true,
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
          active: true,
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
})
