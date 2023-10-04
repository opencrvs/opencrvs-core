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
import { resolvers } from '@gateway/features/correction/root-resolvers'
import { readFileSync } from 'fs'
import * as fetchAny from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'

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
        subject: '121223',
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
        informantType: 'MOTHER',
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
        name: [{ use: 'en', firstNames: 'Mother', familyName: 'Family Name' }],
        telecom: [{ system: 'phone', value: '+8801622688231' }]
      },
      registration: {
        informantType: 'MOTHER',
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

  describe('requestRegistrationCorrection', () => {
    it('throws authentication error when user does not have register scope', async () => {
      try {
        await resolvers.Mutation.requestRegistrationCorrection(
          {},
          { id: '80b90ac3-1032-4f98-af64-627d2b7443f3', details: birthDetails },
          { headers: authHeaderDeclare }
        )
      } catch (e) {
        expect(e.message).toBe(
          'User does not have a register or validate scope'
        )
      }
    })

    it('posts a fhir bundle', async () => {
      fetch.mockResponses([JSON.stringify({ userId: '121223' })])
      fetch.mockResponseOnce('[]')
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

      const result = await resolvers.Mutation.requestRegistrationCorrection(
        {},
        { id: '80b90ac3-1032-4f98-af64-627d2b7443f3', details: birthDetails },
        { headers: authHeaderRegCert }
      )

      expect(result).toBeDefined()
      expect(result).toEqual('80b90ac3-1032-4f98-af64-627d2b7443f3')
    })
  })

  describe('requestRegistrationCorrection', () => {
    it('throws authentication error when user does not have register scope', async () => {
      try {
        await resolvers.Mutation.requestRegistrationCorrection(
          {},
          { id: '80b90ac3-1032-4f98-af64-627d2b7443f3', details: deathDetails },
          { headers: authHeaderDeclare }
        )
      } catch (e) {
        expect(e.message).toBe(
          'User does not have a register or validate scope'
        )
      }
    })
  })
})
