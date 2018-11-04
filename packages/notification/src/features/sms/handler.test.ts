import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import * as fetch from 'jest-fetch-mock'
import * as service from './service'
import { createServer } from '../..'

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
        Authorization: `Bearer ${token}`,
        locale: 'bn' // default is 'en'
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
        Authorization: `Bearer ${token}`
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
        Authorization: `Bearer ${token}`,
        locale: 'bn' // default is 'en'
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(500)
  })
})
