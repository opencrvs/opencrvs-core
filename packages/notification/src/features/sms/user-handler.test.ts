import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import * as utils from '@notification/features/sms/utils'
import { createServer } from '@notification/index'
import { createServerWithEnvironment } from '@notification/tests/util'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any
describe('Verify user handlers', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })
  it('userCredentials returns OK if the sms gets sent', async () => {
    server = await createServerWithEnvironment({ SMS_PROVIDER: 'clickatell' })
    const spy = fetch.once('')

    const token = jwt.sign(
      { scope: ['sysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:notification-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/userCredentialsSMS',
      payload: {
        msisdn: '447789778823',
        username: 'anik',
        password: 'B123456'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(200)
  })
  it('userCredentials returns 400 if called with no username', async () => {
    const spy = fetch.once('')

    const token = jwt.sign(
      { scope: ['sysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:notification-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/userCredentialsSMS',
      payload: {
        msisdn: '447789778823',
        password: 'B123456'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(400)
  })
  it('userCredentials returns 500 the sms is not sent', async () => {
    const spy = jest
      .spyOn(utils, 'buildAndSendSMS')
      .mockImplementationOnce(() => Promise.reject(new Error()))

    const token = jwt.sign(
      { scope: ['sysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:notification-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/userCredentialsSMS',
      payload: {
        msisdn: '447789778823',
        username: 'anik',
        password: 'B123456'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(500)
  })
  it('retrieveUserName returns OK if the sms gets sent', async () => {
    const spy = fetch.once('')

    const token = jwt.sign(
      { scope: ['sysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:notification-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/retrieveUserNameSMS',
      payload: {
        msisdn: '447789778823',
        username: 'anik'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(200)
  })
  it('retrieveUserName returns 400 if called with no username', async () => {
    const spy = fetch.once('')

    const token = jwt.sign(
      { scope: ['sysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:notification-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/retrieveUserNameSMS',
      payload: {
        msisdn: '447789778823'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(400)
  })
  it('retrieveUserName returns 500 the sms is not sent', async () => {
    const spy = jest
      .spyOn(utils, 'buildAndSendSMS')
      .mockImplementationOnce(() => Promise.reject(new Error()))

    const token = jwt.sign(
      { scope: ['sysadmin'] },
      readFileSync('../auth/test/cert.key'),
      {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:notification-user'
      }
    )

    const res = await server.server.inject({
      method: 'POST',
      url: '/retrieveUserNameSMS',
      payload: {
        msisdn: '447789778823',
        username: 'anik'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(500)
  })
})
