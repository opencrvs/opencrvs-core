import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import * as utils from '@notification/features/sms/utils'
import { createServer } from '@notification/index'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any
describe('Verify birth handlers', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it('sendBirthDeclarationConfirmation returns OK the sms gets sent', async () => {
    const spy = fetch.once('')

    const token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:notification-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/birthDeclarationSMS',
      payload: {
        msisdn: '447789778823',
        name: 'অনিক',
        trackingid: 'B123456'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(200)
  })
  it('sendBirthDeclarationConfirmation returns 400 if called with invalid trackingid', async () => {
    const spy = fetch.once('')

    const token = jwt.sign(
      { scope: ['declare'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:notification-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/birthDeclarationSMS',
      payload: {
        msisdn: '447789778823',
        name: 'childName',
        trackingid: 'aeUxkeoseSd-afsdasdf-safasfasf'
      },
      headers: {
        Authorization: `Bearer ${token}`,
        language: 'en' // default is bn
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(400)
  })
  it('sendBirthDeclarationConfirmation returns 500 the sms is not sent', async () => {
    const spy = jest
      .spyOn(utils, 'buildAndSendSMS')
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

    const res = await server.server.inject({
      method: 'POST',
      url: '/birthDeclarationSMS',
      payload: {
        msisdn: '447789778823',
        name: 'অনিক',
        trackingid: 'B123456'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(500)
  })
  it('sendBirthRegistrationConfirmation returns OK the sms gets sent', async () => {
    const spy = fetch.once('')

    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:notification-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/birthRegistrationSMS',
      payload: {
        msisdn: '447789778823',
        name: 'অনিক'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(200)
  })
  it('sendBirthRegistrationConfirmation returns 400 if called with no name', async () => {
    const spy = fetch.once('')

    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:notification-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/birthRegistrationSMS',
      payload: {
        msisdn: '447789778823'
      },
      headers: {
        Authorization: `Bearer ${token}`,
        language: 'en' // default is bn
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(400)
  })
  it('sendBirthRegistrationConfirmation returns 500 the sms is not sent', async () => {
    const spy = jest
      .spyOn(utils, 'buildAndSendSMS')
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

    const res = await server.server.inject({
      method: 'POST',
      url: '/birthRegistrationSMS',
      payload: {
        msisdn: '447789778823',
        name: 'অনিক'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(500)
  })
  it('sendBirthRejectionConfirmation returns OK the sms gets sent', async () => {
    const spy = fetch.once('')

    const token = jwt.sign(
      { scope: ['validate'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:notification-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/birthRejectionSMS',
      payload: {
        msisdn: '447789778823',
        name: 'অনিক',
        trackingid: 'B123456'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(200)
  })
  it('sendBirthRejectionConfirmation returns 400 if called with invalid trackingid', async () => {
    const spy = fetch.once('')

    const token = jwt.sign(
      { scope: ['register'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:notification-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/birthRejectionSMS',
      payload: {
        msisdn: '447789778823',
        name: 'childName',
        trackingid: 'aeUxkeoseSd-afsdasdf-safasfasf'
      },
      headers: {
        Authorization: `Bearer ${token}`,
        language: 'en' // default is bn
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(400)
  })
  it('sendBirthRejectionConfirmation returns 500 the sms is not sent', async () => {
    const spy = jest
      .spyOn(utils, 'buildAndSendSMS')
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

    const res = await server.server.inject({
      method: 'POST',
      url: '/birthRejectionSMS',
      payload: {
        msisdn: '447789778823',
        name: 'অনিক',
        trackingid: 'B123456'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(500)
  })
})
