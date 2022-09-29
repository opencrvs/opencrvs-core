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
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { resolvers } from '@gateway/features/correction/root-resolvers'
import { mockTaskBundle } from '@gateway/utils/testUtils'
import * as fetchAny from 'jest-fetch-mock'
const mockUserDetails = {
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
  practitionerId: '2d11389d-f58e-4d47-a562-b934f1b85936',
  primaryOfficeId: '79776844-b606-40e9-8358-7d82147f702a',
  catchmentAreaIds: [
    'b21ce04e-7ccd-4d65-929f-453bc193a736',
    '95754572-ab6f-407b-b51a-1636cb3d0683',
    '7719942b-16a7-474a-8af1-cd0c94c730d2',
    '43ac3486-7df1-4bd9-9b5e-728054ccd6ba'
  ],
  creationDate: 1559054406433
}

describe('Correction root resolvers', () => {
  let registerCertifyToken: string
  let declareToken: string
  let authHeaderDeclare: { Authorization: string }
  let authHeaderRegCert: { Authorization: string }
  let fetch: any
  let birthDetails: any
  let deathDetails: any

  beforeEach(() => {
    registerCertifyToken = jwt.sign(
      { scope: ['register', 'certify'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:gateway-user'
      }
    )
    declareToken = jwt.sign(
      { scope: ['declare'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:gateway-user'
      }
    )

    birthDetails = {
      child: {
        name: [{ use: 'en', firstNames: 'Khaby', familyName: 'Lame Corrected' }]
      },
      mother: {
        name: [{ use: 'en', firstNames: 'Mother', familyName: 'Family Name' }],
        telecom: [{ system: 'phone', value: '+8801622688231' }]
      },
      registration: {
        contact: 'MOTHER',
        correction: {
          location: {
            _fhirID: '63ee3076-4568-4cce-aa94-ad904b8ebfc8'
          },
          hasShowedVerifiedDocument: true,
          attestedAndCopied: true,
          requester: 'MOTHER',
          reason: 'CLERICAL_ERROR',
          note: 'Spelling mistakes',
          values: [
            {
              section: 'child',
              fieldName: 'name',
              oldValue: 'Khaby Lame',
              newValue: 'Khaby Lame Corrected'
            },
            {
              section: 'mother',
              fieldName: 'name',
              oldValue: 'First Name Last Name',
              newValue: 'Mother Family Name'
            }
          ]
        }
      }
    }

    deathDetails = {
      deceased: {
        name: [{ use: 'en', firstNames: 'Khaby', familyName: 'Lame Corrected' }]
      },
      informant: {
        individual: {
          name: [
            { use: 'en', firstNames: 'Mother', familyName: 'Family Name' }
          ],
          telecom: [{ system: 'phone', value: '+8801622688231' }]
        }
      },
      registration: {
        contact: 'MOTHER',
        correction: {
          location: {
            _fhirID: '63ee3076-4568-4cce-aa94-ad904b8ebfc8'
          },
          hasShowedVerifiedDocument: true,
          attestedAndCopied: true,
          requester: 'MOTHER',
          reason: 'CLERICAL_ERROR',
          note: 'Spelling mistakes',
          values: [
            {
              section: 'deceased',
              fieldName: 'name',
              oldValue: 'Khaby Lame',
              newValue: 'Khaby Lame Corrected'
            },
            {
              section: 'informant',
              fieldName: 'name',
              oldValue: 'First Name Last Name',
              newValue: 'Mother Family Name'
            }
          ]
        }
      }
    }

    authHeaderRegCert = {
      Authorization: `Bearer ${registerCertifyToken}`
    }

    authHeaderDeclare = {
      Authorization: `Bearer ${declareToken}`
    }

    fetch = fetchAny
  })

  describe('requestBirthRegistrationCorrection', () => {
    it('throws authentication error when user does not have register scope', async () => {
      try {
        await resolvers.Mutation.requestBirthRegistrationCorrection(
          {},
          { id: '80b90ac3-1032-4f98-af64-627d2b7443f3', details: birthDetails },
          authHeaderDeclare
        )
      } catch (e) {
        expect(e.message).toBe('User does not have a register scope')
      }
    })

    it('posts a fhir bundle', async () => {
      fetch.mockResponses(
        [JSON.stringify(mockTaskBundle)],
        [JSON.stringify(mockUserDetails)]
      )

      fetch.mockResponseOnce(
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            {
              response: {
                location:
                  'Task/12423/_history/80b90ac3-1032-4f98-af64-627d2b7443f3'
              }
            }
          ]
        })
      )

      const result =
        await resolvers.Mutation.requestBirthRegistrationCorrection(
          {},
          { id: '80b90ac3-1032-4f98-af64-627d2b7443f3', details: birthDetails },
          authHeaderRegCert
        )

      expect(result).toBeDefined()
      expect(result).toEqual('80b90ac3-1032-4f98-af64-627d2b7443f3')
    })
  })

  describe('requestDeathRegistrationCorrection', () => {
    it('throws authentication error when user does not have register scope', async () => {
      try {
        await resolvers.Mutation.requestDeathRegistrationCorrection(
          {},
          { id: '80b90ac3-1032-4f98-af64-627d2b7443f3', details: deathDetails },
          authHeaderDeclare
        )
      } catch (e) {
        expect(e.message).toBe('User does not have a register scope')
      }
    })

    it('posts a fhir bundle', async () => {
      fetch.mockResponses(
        [JSON.stringify(mockTaskBundle)],
        [JSON.stringify(mockUserDetails)]
      )
      fetch.mockResponseOnce(
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            {
              response: {
                location:
                  'Task/12423/_history/80b90ac3-1032-4f98-af64-627d2b7443f3'
              }
            }
          ]
        })
      )
      fetch.mockResponseOnce(
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            {
              response: {
                location:
                  'Task/12423/_history/80b90ac3-1032-4f98-af64-627d2b7443f3'
              }
            }
          ]
        })
      )

      const result =
        await resolvers.Mutation.requestDeathRegistrationCorrection(
          {},
          { id: '80b90ac3-1032-4f98-af64-627d2b7443f3', details: deathDetails },
          authHeaderRegCert
        )

      expect(result).toBeDefined()
      expect(result).toEqual('80b90ac3-1032-4f98-af64-627d2b7443f3')
    })
  })
})
