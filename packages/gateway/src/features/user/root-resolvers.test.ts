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
import { resolvers } from '@gateway/features/user/root-resolvers'
import { generateVerificationCode } from '@gateway/routes/verifyCode/handler'
import * as fetchAny from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'

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
    let authHeaderSysAdmin: { Authorization: string }
    let authHeaderFieldAgent: { Authorization: string }
    beforeEach(() => {
      fetch.resetMocks()
      const sysAdminToken = jwt.sign(
        { scope: ['sysadmin'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: 'ba7022f0ff4822',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authHeaderSysAdmin = {
        Authorization: `Bearer ${sysAdminToken}`
      }
      const declareToken = jwt.sign(
        { scope: ['declare'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: 'ba7022f0ff4822',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authHeaderFieldAgent = {
        Authorization: `Bearer ${declareToken}`
      }
    })
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
    it('should returns full user list for sysadmin', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          totalItems: dummyUserList.length,
          results: dummyUserList
        })
      )

      const response = await resolvers.Query.searchUsers(
        {},
        {},
        authHeaderSysAdmin
      )

      expect(response.totalItems).toBe(3)
      expect(response.results).toEqual(dummyUserList)
    })
    it('should return error for register', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          totalItems: dummyUserList.length,
          results: dummyUserList
        })
      )

      expect(
        resolvers.Query.searchUsers({}, {}, authHeaderFieldAgent)
      ).rejects.toThrow(
        'Search user is only allowed for sysadmin or registrar or registration agent'
      )
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
        },
        authHeaderSysAdmin
      )

      expect(response.totalItems).toBe(1)
      expect(response.results).toEqual([dummyUserList[2]])
    })
  })

  describe('searchFieldAgents()', () => {
    let authHeaderSysAdmin: { Authorization: string }
    let authHeaderFieldAgent: { Authorization: string }
    beforeEach(() => {
      fetch.resetMocks()
      const sysAdminToken = jwt.sign(
        { scope: ['sysadmin'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: 'ba7022f0ff4822',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authHeaderSysAdmin = {
        Authorization: `Bearer ${sysAdminToken}`
      }
      const declareToken = jwt.sign(
        { scope: ['declare'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: 'ba7022f0ff4822',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authHeaderFieldAgent = {
        Authorization: `Bearer ${declareToken}`
      }
    })
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
        type: 'HA',
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
        type: 'HA',
        passwordHash:
          'b8be6cae5215c93784b1b9e2c06384910f754b1d66c077f1f8fdc98fbd92e6c17a0fdc790b30225986cadb9553e87a47b1d2eb7bd986f96f0da7873e1b2ddf9c',
        salt: '12345',
        role: 'FIELD_AGENT',
        status: 'pending',
        practitionerId: 'sseq1203-f0ff-4822-b5d9-cb90d0e7biwuw',
        primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
        catchmentAreaIds: [
          'b21ce04e-7ccd-4d65-929f-453bc193a736',
          '95754572-ab6f-407b-b51a-1636cb3d0683',
          '7719942b-16a7-474a-8af1-cd0c94c730d2',
          '43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
        ],
        creationDate: 1559054406444
      }
    ]
    it('Returns field agent list with metrics data for an office', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          totalItems: dummyUserList.length,
          results: dummyUserList
        })
      )
      fetch.mockResponseOnce(
        JSON.stringify([
          {
            practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
            totalNumberOfApplicationStarted: 12,
            totalNumberOfInProgressAppStarted: 5,
            totalNumberOfRejectedApplications: 2,
            averageTimeForDeclaredApplications: 360
          }
        ])
      )

      const response = await resolvers.Query.searchFieldAgents(
        {},
        {
          primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
          timeStart: '2019-03-31T18:00:00.000Z',
          timeEnd: '2020-06-30T17:59:59.999Z'
        },
        authHeaderSysAdmin
      )

      expect(response.totalItems).toBe(2)
      expect(response.results).toEqual([
        {
          practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
          fullName: 'Sakib Al Hasan',
          type: 'HA',
          status: 'active',
          primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
          creationDate: 1559054406433,
          totalNumberOfApplicationStarted: 12,
          totalNumberOfInProgressAppStarted: 5,
          totalNumberOfRejectedApplications: 2,
          averageTimeForDeclaredApplications: 360
        },
        {
          practitionerId: 'sseq1203-f0ff-4822-b5d9-cb90d0e7biwuw',
          fullName: 'Md. Ariful Islam',
          type: 'HA',
          status: 'pending',
          primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
          creationDate: 1559054406444,
          totalNumberOfApplicationStarted: 0,
          totalNumberOfInProgressAppStarted: 0,
          totalNumberOfRejectedApplications: 0,
          averageTimeForDeclaredApplications: 0
        }
      ])
    })
    it('Returns field agent list with metrics data for sysadmin', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          totalItems: dummyUserList.length,
          results: dummyUserList
        })
      )
      fetch.mockResponseOnce(
        JSON.stringify([
          {
            practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
            totalNumberOfApplicationStarted: 12,
            totalNumberOfInProgressAppStarted: 5,
            totalNumberOfRejectedApplications: 2,
            averageTimeForDeclaredApplications: 360
          }
        ])
      )

      const response = await resolvers.Query.searchFieldAgents(
        {},
        {
          locationId: 'b21ce04e-7ccd-4d65-929f-453bc193a736',
          timeStart: '2019-03-31T18:00:00.000Z',
          timeEnd: '2020-06-30T17:59:59.999Z'
        },
        authHeaderSysAdmin
      )

      expect(response.totalItems).toBe(2)
      expect(response.results).toEqual([
        {
          practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
          fullName: 'Sakib Al Hasan',
          type: 'HA',
          status: 'active',
          primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
          creationDate: 1559054406433,
          totalNumberOfApplicationStarted: 12,
          totalNumberOfInProgressAppStarted: 5,
          totalNumberOfRejectedApplications: 2,
          averageTimeForDeclaredApplications: 360
        },
        {
          practitionerId: 'sseq1203-f0ff-4822-b5d9-cb90d0e7biwuw',
          fullName: 'Md. Ariful Islam',
          type: 'HA',
          status: 'pending',
          primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
          creationDate: 1559054406444,
          totalNumberOfApplicationStarted: 0,
          totalNumberOfInProgressAppStarted: 0,
          totalNumberOfRejectedApplications: 0,
          averageTimeForDeclaredApplications: 0
        }
      ])
    })
    it('should return error for register', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          totalItems: dummyUserList.length,
          results: dummyUserList
        })
      )

      expect(
        resolvers.Query.searchFieldAgents(
          {},
          {
            locationId: 'b21ce04e-7ccd-4d65-929f-453bc193a736',
            timeStart: '2019-03-31T18:00:00.000Z',
            timeEnd: '2020-06-30T17:59:59.999Z'
          },
          authHeaderFieldAgent
        )
      ).rejects.toThrow(
        'Search field agents is only allowed for sysadmin or registrar or registration agent'
      )
    })
    it('returns field agent list with active status only', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          totalItems: 1,
          results: [dummyUserList[0]]
        })
      )
      fetch.mockResponseOnce(
        JSON.stringify([
          {
            practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
            totalNumberOfApplicationStarted: 12,
            totalNumberOfInProgressAppStarted: 5,
            totalNumberOfRejectedApplications: 2,
            averageTimeForDeclaredApplications: 360
          }
        ])
      )

      const response = await resolvers.Query.searchFieldAgents(
        {},
        {
          locationId: 'b21ce04e-7ccd-4d65-929f-453bc193a736',
          timeStart: '2019-03-31T18:00:00.000Z',
          timeEnd: '2020-06-30T17:59:59.999Z',
          status: 'active'
        },
        authHeaderSysAdmin
      )

      expect(response.totalItems).toBe(1)
      expect(response.results).toEqual([
        {
          practitionerId: 'dcba7022-f0ff-4822-b5d9-cb90d0e7b8de',
          fullName: 'Sakib Al Hasan',
          type: 'HA',
          status: 'active',
          primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
          creationDate: 1559054406433,
          totalNumberOfApplicationStarted: 12,
          totalNumberOfInProgressAppStarted: 5,
          totalNumberOfRejectedApplications: 2,
          averageTimeForDeclaredApplications: 360
        }
      ])
    })
    it('returns empty results if invalid data received from user-mgnt endpoint', () => {
      fetch.mockResponseOnce(JSON.stringify({}))

      return expect(
        resolvers.Query.searchFieldAgents(
          {},
          {
            locationId: 'b21ce04e-7ccd-4d65-929f-453bc193a736',
            timeStart: '2019-03-31T18:00:00.000Z',
            timeEnd: '2020-06-30T17:59:59.999Z'
          },
          authHeaderSysAdmin
        )
      ).resolves.toStrictEqual({
        totalItems: 0,
        results: []
      })
    })
    it('returns empty results if no locationId or primaryOfficeId is provided', () => {
      fetch.mockResponseOnce(JSON.stringify({}))

      return expect(
        resolvers.Query.searchFieldAgents(
          {},
          {
            timeStart: '2019-03-31T18:00:00.000Z',
            timeEnd: '2020-06-30T17:59:59.999Z'
          },
          authHeaderSysAdmin
        )
      ).resolves.toStrictEqual({
        totalItems: 0,
        results: []
      })
    })
  })

  describe('verifyPasswordById()', () => {
    let authHeaderUser: { Authorization: string }
    beforeEach(() => {
      fetch.resetMocks()
      const declareToken = jwt.sign(
        { scope: ['declare'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: 'ba7022f0ff4822',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authHeaderUser = {
        Authorization: `Bearer ${declareToken}`
      }
    })

    it('returns user data if the user is verified', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          username: 'sakibal.hasan',
          id: '123',
          scope: ['declare'],
          status: 'active'
        })
      )

      const res = await resolvers.Query.verifyPasswordById(
        {},
        { id: '123', password: 'test' },
        authHeaderUser
      )

      expect(res.username).toBe('sakibal.hasan')
    })

    it('returns error data if the user-mgnt response anything other than status 200', async () => {
      fetch.mockResponses([JSON.stringify({}), { status: 401 }])

      try {
        await resolvers.Query.verifyPasswordById(
          {},
          { id: '123', password: 'test' },
          authHeaderUser
        )
      } catch (e) {
        expect(e.message).toBe('Unauthorized to verify password')
      }
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

      expect(response).toEqual('ba7022f0ff4822')
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

  describe('changePassword mutation', () => {
    let authHeaderValidUser: { Authorization: string }
    let authHeaderInValidUser: { Authorization: string }

    beforeEach(() => {
      fetch.resetMocks()
      const validUserToken = jwt.sign(
        { scope: ['register'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: 'ba7022f0ff4822',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authHeaderValidUser = {
        Authorization: `Bearer ${validUserToken}`
      }
      const inValidUserToken = jwt.sign(
        { scope: ['register'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authHeaderInValidUser = {
        Authorization: `Bearer ${inValidUserToken}`
      }
    })

    it('changes password for loggedin user', async () => {
      fetch.mockResponseOnce(JSON.stringify({}), { status: 200 })

      const response = await resolvers.Mutation.changePassword(
        {},
        {
          userId: 'ba7022f0ff4822',
          existingPassword: 'test',
          password: 'NewPassword'
        },
        authHeaderValidUser
      )

      expect(response).toEqual(true)
    })
    it('throws error if @user-mgnt/changeUserPassword sends anything but 200', async () => {
      fetch.mockResponseOnce(JSON.stringify({}), { status: 401 })

      expect(
        resolvers.Mutation.changePassword(
          {},
          {
            userId: 'ba7022f0ff4822',
            existingPassword: 'test',
            password: 'NewPassword'
          },
          authHeaderValidUser
        )
      ).rejects.toThrowError(
        "Something went wrong on user-mgnt service. Couldn't change user password"
      )
    })
    it("throws error if any user (except sysadmin) tries to update some other user's password", async () => {
      expect(
        resolvers.Mutation.changePassword(
          {},
          {
            userId: 'ba7022f0ff4822',
            existingPassword: 'test',
            password: 'NewPassword'
          },
          authHeaderInValidUser
        )
      ).rejects.toThrowError(
        'Change password is not allowed. ba7022f0ff4822 is not the owner of the token'
      )
    })
  })

  describe('changePhone mutation', () => {
    let authHeaderValidUser: { Authorization: string }
    let authHeaderInValidUser: { Authorization: string }

    beforeEach(() => {
      fetch.resetMocks()
      const validUserToken = jwt.sign(
        { scope: ['register'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: 'ba7022f0ff4822',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authHeaderValidUser = {
        Authorization: `Bearer ${validUserToken}`
      }
      const inValidUserToken = jwt.sign(
        { scope: ['register'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authHeaderInValidUser = {
        Authorization: `Bearer ${inValidUserToken}`
      }
    })

    it('changes phone number for loggedin user', async () => {
      const nonce = '12345'
      const mobile = '0711111111'
      const code = await generateVerificationCode(nonce, mobile)
      fetch.mockResponseOnce(JSON.stringify({}), { status: 200 })

      const response = await resolvers.Mutation.changePhone(
        {},
        {
          userId: 'ba7022f0ff4822',
          phoneNumber: mobile,
          nonce: nonce,
          verifyCode: code
        },
        authHeaderValidUser
      )

      expect(response).toEqual(true)
    })
    it('throws error if @user-mgnt/changeUserPhone sends anything but 201', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          statusCode: '401'
        })
      )

      const nonce = '12345'
      const mobile = '0711111111'
      const code = await generateVerificationCode(nonce, mobile)

      expect(
        resolvers.Mutation.changePhone(
          {},
          {
            userId: 'ba7022f0ff4822',
            phoneNumber: mobile,
            nonce: nonce,
            verifyCode: code
          },
          authHeaderValidUser
        )
      ).rejects.toThrowError(
        "Something went wrong on user-mgnt service. Couldn't change user phone number"
      )
    })
    it("throws error if any user tries to update some other user's phonenumber", async () => {
      const nonce = '12345'
      const mobile = '0711111111'
      const code = await generateVerificationCode(nonce, mobile)

      expect(
        resolvers.Mutation.changePhone(
          {},
          {
            userId: 'ba7022f0ff4822',
            phoneNumber: mobile,
            nonce: nonce,
            verifyCode: code
          },
          authHeaderInValidUser
        )
      ).rejects.toThrowError(
        'Change phone is not allowed. ba7022f0ff4822 is not the owner of the token'
      )
    })
  })

  describe('changeAvatar mutation', () => {
    let authHeaderValidUser: { Authorization: string }
    let authHeaderInValidUser: { Authorization: string }

    beforeEach(() => {
      fetch.resetMocks()
      const validUserToken = jwt.sign(
        { scope: ['register'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: 'ba7022f0ff4822',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authHeaderValidUser = {
        Authorization: `Bearer ${validUserToken}`
      }
      const inValidUserToken = jwt.sign(
        { scope: ['register'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authHeaderInValidUser = {
        Authorization: `Bearer ${inValidUserToken}`
      }
    })

    it('changes avatar for loggedin user', async () => {
      fetch.mockResponseOnce(JSON.stringify({}), { status: 200 })

      const response = await resolvers.Mutation.changeAvatar(
        {},
        {
          userId: 'ba7022f0ff4822',
          avatar: {
            type: 'image/png;base64',
            data: 'aGVsbG8gd29ybGQ='
          }
        },
        authHeaderValidUser
      )

      expect(response).toEqual(true)
    })
    it('throws error if @user-mgnt/changeUserAvatar sends anything but 200', async () => {
      fetch.mockResponseOnce(JSON.stringify({}), { status: 401 })

      expect(
        resolvers.Mutation.changeAvatar(
          {},
          {
            userId: 'ba7022f0ff4822',
            avatar: {
              type: 'image/png;base64',
              data: 'aGVsbG8gd29ybGQ='
            }
          },
          authHeaderValidUser
        )
      ).rejects.toThrowError(
        "Something went wrong on user-mgnt service. Couldn't change user avatar"
      )
    })
    it("throws error if any user tries to update some other user's avatar", async () => {
      expect(
        resolvers.Mutation.changeAvatar(
          {},
          {
            userId: 'ba7022f0ff4822',
            avatar: {
              type: 'image/png;base64',
              data: 'aGVsbG8gd29ybGQ='
            }
          },
          authHeaderInValidUser
        )
      ).rejects.toThrowError(
        'Changing avatar is not allowed. ba7022f0ff4822 is not the owner of the token'
      )
    })
  })

  describe('createOrUpdateUser mutation', () => {
    let authHeaderSysAdmin: { Authorization: string }
    let authHeaderRegister: { Authorization: string }
    beforeEach(() => {
      fetch.resetMocks()
      const sysAdminToken = jwt.sign(
        { scope: ['sysadmin'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: 'ba7022f0ff4822',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authHeaderSysAdmin = {
        Authorization: `Bearer ${sysAdminToken}`
      }
      const regsiterToken = jwt.sign(
        { scope: ['register'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: 'ba7022f0ff4822',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authHeaderRegister = {
        Authorization: `Bearer ${regsiterToken}`
      }
    })
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

    it('creates user for sysadmin', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          username: 'someUser123'
        }),
        { status: 201 }
      )

      const response = await resolvers.Mutation.createOrUpdateUser(
        {},
        { user },
        authHeaderSysAdmin
      )

      expect(response).toEqual({
        username: 'someUser123'
      })
    })

    it('updates an user for sysadmin', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          username: 'someUser123'
        }),
        { status: 201 }
      )
      const response = await resolvers.Mutation.createOrUpdateUser(
        {},
        { user: { id: '123', ...user } },
        authHeaderSysAdmin
      )

      expect(response).toEqual({
        username: 'someUser123'
      })
    })

    it('should throw error for register', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          statusCode: '201'
        }),
        { status: 400 }
      )

      expect(
        resolvers.Mutation.createOrUpdateUser({}, { user }, authHeaderRegister)
      ).rejects.toThrowError('Create user is only allowed for sysadmin')
    })

    it('should throw error when /createUser sends anything but 201', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          statusCode: '201'
        }),
        { status: 400 }
      )

      expect(
        resolvers.Mutation.createOrUpdateUser({}, { user }, authHeaderSysAdmin)
      ).rejects.toThrowError(
        "Something went wrong on user-mgnt service. Couldn't create user"
      )
    })
  })

  describe('userAudit mutation', () => {
    let authHeaderSysAdmin: { Authorization: string }
    let authHeaderRegister: { Authorization: string }
    beforeEach(() => {
      fetch.resetMocks()
      const sysAdminToken = jwt.sign(
        { scope: ['sysadmin'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: 'ba7022f0ff4822',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authHeaderSysAdmin = {
        Authorization: `Bearer ${sysAdminToken}`
      }
      const regsiterToken = jwt.sign(
        { scope: ['register'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: 'ba7022f0ff4822',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authHeaderRegister = {
        Authorization: `Bearer ${regsiterToken}`
      }
    })

    it('audits user for sysadmin', async () => {
      fetch.mockResponseOnce(JSON.stringify(null), { status: 200 })

      const response = await resolvers.Mutation.auditUser(
        {},
        {
          userId: '5bce8ujkf0fuib',
          action: 'DEACTIVATE',
          reason: 'SUSPICIOUS'
        },
        authHeaderSysAdmin
      )

      expect(response).toEqual(true)
    })

    it('throws error for unauthorized user', async () => {
      await expect(
        resolvers.Mutation.auditUser(
          {},
          {
            userId: '5bce8ujkf0fuib',
            action: 'DEACTIVATE',
            reason: 'SUSPICIOUS'
          },
          authHeaderRegister
        )
      ).rejects.toThrowError(
        'User 5bce8ujkf0fuib is not allowed to audit for not having the sys admin scope'
      )
    })

    it('throws error when the service response is not 200', async () => {
      fetch.mockResponseOnce(JSON.stringify(null), { status: 400 })

      await expect(
        resolvers.Mutation.auditUser(
          {},
          {
            userId: '5bce8ujkf0fuib',
            action: 'DEACTIVATE',
            reason: 'SUSPICIOUS'
          },
          authHeaderSysAdmin
        )
      ).rejects.toThrowError(
        "Something went wrong on user-mgnt service. Couldn't audit user 5bce8ujkf0fuib"
      )
    })
  })

  describe('resendSMSInvite mutation', () => {
    let authHeaderSysAdmin: { Authorization: string }
    let authHeaderRegAgent: { Authorization: string }
    beforeEach(() => {
      fetch.resetMocks()
      const sysAdminToken = jwt.sign(
        { scope: ['sysadmin'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: 'ba7022f0ff4822',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authHeaderSysAdmin = {
        Authorization: `Bearer ${sysAdminToken}`
      }
      const validateToken = jwt.sign(
        { scope: ['validate'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: 'ba7022f0ff4822',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authHeaderRegAgent = {
        Authorization: `Bearer ${validateToken}`
      }
    })

    it('throws error for unauthorized user', async () => {
      await expect(
        resolvers.Mutation.resendSMSInvite(
          {},
          {
            userId: '123'
          },
          authHeaderRegAgent
        )
      ).rejects.toThrowError(
        'SMS invite can only be resent by a user with sys admin scope'
      )
    })

    it('throws error when the user-mgnt response is not 200', async () => {
      fetch.mockResponses([JSON.stringify({}), { status: 401 }])

      await expect(
        resolvers.Mutation.resendSMSInvite(
          {},
          {
            userId: '123'
          },
          authHeaderSysAdmin
        )
      ).rejects.toThrowError(
        "Something went wrong on user-mgnt service. Couldn't send sms to 123"
      )
    })

    it('returns true if status from user-mgnt response is 200', async () => {
      fetch.mockResponses([JSON.stringify({}), { status: 200 }])

      const res = await resolvers.Mutation.resendSMSInvite(
        {},
        {
          userId: '123'
        },
        authHeaderSysAdmin
      )

      expect(res).toBe(true)
    })
  })
})
