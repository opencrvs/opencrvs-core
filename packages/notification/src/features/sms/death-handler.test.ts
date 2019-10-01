import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import * as utils from '@notification/features/sms/utils'
import { createServer } from '@notification/index'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any
describe('Verify death handlers', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it('sendDeathDeclarationConfirmation returns OK the sms gets sent', async () => {
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
      url: '/deathDeclarationSMS',
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
  it('sendDeathDeclarationConfirmation returns 400 if called with invalid trackingid', async () => {
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
      url: '/deathDeclarationSMS',
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
  it('sendDeathDeclarationConfirmation returns 500 the sms is not sent', async () => {
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
      url: '/deathDeclarationSMS',
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
  it('sendDeathRegistrationConfirmation returns OK the sms gets sent', async () => {
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
      url: '/deathRegistrationSMS',
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
  it('sendDeathRegistrationConfirmation returns 400 if called with no name', async () => {
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
      url: '/deathRegistrationSMS',
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
  it('sendDeathRegistrationConfirmation returns 500 the sms is not sent', async () => {
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
      url: '/deathRegistrationSMS',
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
  it('sendDeathRejectionConfirmation returns OK the sms gets sent', async () => {
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
      url: '/deathRejectionSMS',
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
  it('sendDeathRejectionConfirmation returns 400 if called with invalid trackingid', async () => {
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
      url: '/deathRejectionSMS',
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
  it('sendDeathRejectionConfirmation returns 500 the sms is not sent', async () => {
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
      url: '/deathRejectionSMS',
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
