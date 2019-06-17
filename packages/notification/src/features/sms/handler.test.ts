import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import * as service from '@notification/features/sms/service'
import { createServer } from '@notification/index'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any
describe('Verify handlers', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it('smsHandler returns OK if the sms gets sent', async () => {
    const spy = fetch.once('')

    const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:notification-user'
    })

    const res = await server.server.inject({
      method: 'POST',
      url: '/sms',
      payload: { msisdn: '447789778823', message: 'foo' },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(200)
  })
  it("smsHandler returns 500 if the sms isn't sent", async () => {
    const spy = jest
      .spyOn(service, 'sendSMS')
      .mockImplementationOnce(() => Promise.reject(new Error()))

    const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:notification-user'
    })

    const res = await server.server.inject({
      method: 'POST',
      url: '/sms',
      payload: { msisdn: '447789778823', message: 'foo' },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(spy).toHaveBeenCalled()
    expect(res.statusCode).toBe(500)
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
      .spyOn(service, 'sendSMS')
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
      .spyOn(service, 'sendSMS')
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
      .spyOn(service, 'sendSMS')
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
      .spyOn(service, 'sendSMS')
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
})
