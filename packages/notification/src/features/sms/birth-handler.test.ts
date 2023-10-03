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
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import * as utils from '@notification/features/sms/utils'
import { createServer } from '@notification/server'
import * as fetchAny from 'jest-fetch-mock'
import { translationsMock } from '@notification/tests/util'

const fetch = fetchAny as any
describe('Verify birth handlers', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })
  describe('sendBirthInProgressConfirmation', () => {
    it('returns OK the sms gets sent', async () => {
      const token = jwt.sign(
        { scope: ['declare'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:notification-user'
        }
      )
      fetch.mockResponse(JSON.stringify(translationsMock))

      const res = await server.server.inject({
        method: 'POST',
        url: '/birthInProgressSMS',
        payload: {
          recipient: {
            sms: '447789778823',
            email: 'email@email.com'
          },
          crvsOffice: 'আলকবালী ইউনিয়ন পরিষদ',
          trackingId: 'B123456'
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(res.statusCode).toBe(200)
    })
    it('returns 400 if called with invalid trackingId', async () => {
      const token = jwt.sign(
        { scope: ['declare'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:notification-user'
        }
      )
      fetch.mockResponse(JSON.stringify(translationsMock))

      const res = await server.server.inject({
        method: 'POST',
        url: '/birthInProgressSMS',
        payload: {
          recipient: {
            sms: '447789778823',
            email: 'email@email.com'
          },
          crvsOffice: 'আলকবালী ইউনিয়ন পরিষদ',
          trackingId: 'aeUxkeoseSd-afsdasdf-safasfasf'
        },
        headers: {
          Authorization: `Bearer ${token}`,
          language: 'en' // default is bn
        }
      })

      expect(res.statusCode).toBe(400)
    })
    it('returns 500 the sms is not sent', async () => {
      const spy = jest
        .spyOn(utils, 'sendNotification')
        .mockImplementationOnce(() => Promise.reject(new Error()))

      const token = jwt.sign(
        { scope: ['declare'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:notification-user'
        }
      )

      fetch.mockResponse(JSON.stringify(translationsMock))
      const res = await server.server.inject({
        method: 'POST',
        url: '/birthInProgressSMS',
        payload: {
          recipient: {
            sms: '447789778823',
            email: 'email@email.com'
          },
          crvsOffice: 'আলকবালী ইউনিয়ন পরিষদ',
          trackingId: 'B123456'
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(spy).toHaveBeenCalled()

      expect(res.statusCode).toBe(500)
    })
  })
  describe('sendBirthDeclarationConfirmation', () => {
    it('returns OK the sms gets sent', async () => {
      const token = jwt.sign(
        { scope: ['declare'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:notification-user'
        }
      )

      fetch.mockResponse(JSON.stringify(translationsMock))
      const res = await server.server.inject({
        method: 'POST',
        url: '/birthDeclarationSMS',
        payload: {
          recipient: {
            sms: '447789778823',
            email: 'email@email.com'
          },
          name: 'অনিক',
          trackingId: 'B123456',
          crvsOffice: 'ALASKA',
          informantName: 'Sadman Anik'
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(res.statusCode).toBe(200)
    })
    it('returns 400 if called with invalid trackingId', async () => {
      const token = jwt.sign(
        { scope: ['declare'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:notification-user'
        }
      )

      fetch.mockResponse(JSON.stringify(translationsMock))
      const res = await server.server.inject({
        method: 'POST',
        url: '/birthDeclarationSMS',
        payload: {
          recipient: {
            sms: '447789778823',
            email: 'email@email.com'
          },
          name: 'childName',
          trackingId: 'aeUxkeoseSd-afsdasdf-safasfasf',
          crvsOffice: 'ALASKA',
          informantName: 'Sadman Anik'
        },
        headers: {
          Authorization: `Bearer ${token}`,
          language: 'en' // default is bn
        }
      })

      expect(res.statusCode).toBe(400)
    })
    it('returns 500 the sms is not sent', async () => {
      const spy = jest
        .spyOn(utils, 'sendNotification')
        .mockImplementationOnce(() => Promise.reject(new Error()))

      const token = jwt.sign(
        { scope: ['declare'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:notification-user'
        }
      )

      fetch.mockResponse(JSON.stringify(translationsMock))
      const res = await server.server.inject({
        method: 'POST',
        url: '/birthDeclarationSMS',
        payload: {
          recipient: {
            sms: '447789778823',
            email: 'email@email.com'
          },
          name: 'অনিক',
          trackingId: 'B123456',
          crvsOffice: 'ALASKA',
          informantName: 'Sadman Anik'
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(spy).toHaveBeenCalled()

      expect(res.statusCode).toBe(500)
    })
  })
  describe('sendBirthRegistrationConfirmation', () => {
    it('returns OK the sms gets sent', async () => {
      const token = jwt.sign(
        { scope: ['register'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:notification-user'
        }
      )

      fetch.mockResponse(JSON.stringify(translationsMock))
      const res = await server.server.inject({
        method: 'POST',
        url: '/birthRegistrationSMS',
        payload: {
          recipient: {
            sms: '447789778823',
            email: 'email@email.com'
          },
          name: 'অনিক',
          trackingId: 'B123456',
          registrationNumber: '20196816020000129',
          crvsOffice: 'ALASKA',
          informantName: 'Sadman Anik'
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(res.statusCode).toBe(200)
    })
    it('returns 400 if called with invalid data', async () => {
      const token = jwt.sign(
        { scope: ['register'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:notification-user'
        }
      )

      fetch.mockResponse(JSON.stringify(translationsMock))
      const res = await server.server.inject({
        method: 'POST',
        url: '/birthRegistrationSMS',
        payload: {
          recipient: {
            sms: '447789778823',
            email: 'email@email.com'
          }
        },
        headers: {
          Authorization: `Bearer ${token}`,
          language: 'en' // default is bn
        }
      })

      expect(res.statusCode).toBe(400)
    })
    it('returns 500 the sms is not sent', async () => {
      const spy = jest
        .spyOn(utils, 'sendNotification')
        .mockImplementationOnce(() => Promise.reject(new Error()))

      const token = jwt.sign(
        { scope: ['register'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:notification-user'
        }
      )

      fetch.mockResponse(JSON.stringify(translationsMock))
      const res = await server.server.inject({
        method: 'POST',
        url: '/birthRegistrationSMS',
        payload: {
          recipient: {
            sms: '447789778823',
            email: 'email@email.com'
          },
          name: 'অনিক',
          trackingId: 'B123456',
          registrationNumber: '20196816020000129',
          crvsOffice: 'ALASKA',
          informantName: 'Sadman Anik'
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(spy).toHaveBeenCalled()

      expect(res.statusCode).toBe(500)
    })
  })
  describe('sendBirthRejectionConfirmation', () => {
    it('returns OK the sms gets sent', async () => {
      const token = jwt.sign(
        { scope: ['validate'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:notification-user'
        }
      )
      fetch.mockResponse(JSON.stringify(translationsMock))

      const res = await server.server.inject({
        method: 'POST',
        url: '/birthRejectionSMS',
        payload: {
          recipient: {
            sms: '447789778823',
            email: 'email@email.com'
          },
          name: 'অনিক',
          trackingId: 'B123456',
          crvsOffice: 'ALASKA',
          informantName: 'Sadman Anik'
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(res.statusCode).toBe(200)
    })
    it('returns 400 if called with invalid trackingId', async () => {
      const token = jwt.sign(
        { scope: ['register'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:notification-user'
        }
      )
      fetch.mockResponse(JSON.stringify(translationsMock))

      const res = await server.server.inject({
        method: 'POST',
        url: '/birthRejectionSMS',
        payload: {
          recipient: {
            sms: '447789778823',
            email: 'email@email.com'
          },
          name: 'childName',
          trackingId: 'aeUxkeoseSd-afsdasdf-safasfasf',
          crvsOffice: 'ALASKA',
          informantName: 'Sadman Anik'
        },
        headers: {
          Authorization: `Bearer ${token}`,
          language: 'en' // default is bn
        }
      })

      expect(res.statusCode).toBe(400)
    })
    it('returns 500 the sms is not sent', async () => {
      const spy = jest
        .spyOn(utils, 'sendNotification')
        .mockImplementationOnce(() => Promise.reject(new Error()))

      const token = jwt.sign(
        { scope: ['validate'] },
        readFileSync('../auth/test/cert.key'),
        {
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:notification-user'
        }
      )

      fetch.mockResponse(JSON.stringify(translationsMock))
      const res = await server.server.inject({
        method: 'POST',
        url: '/birthRejectionSMS',
        payload: {
          recipient: {
            sms: '447789778823',
            email: 'email@email.com'
          },
          name: 'অনিক',
          trackingId: 'B123456',
          crvsOffice: 'ALASKA',
          informantName: 'Sadman Anik'
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      expect(spy).toHaveBeenCalled()

      expect(res.statusCode).toBe(500)
    })
  })
})
