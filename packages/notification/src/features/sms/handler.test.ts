import * as service from './service'
import { createServer } from '../..'

describe('smsHandler', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it('returns OK if the sms gets sent', async () => {
    const spy = jest.spyOn(service, 'sendSMS').mockResolvedValueOnce(null)

    const res = await server.server.inject({
      method: 'POST',
      url: '/sms',
      payload: { msisdn: '447789778823', message: 'foo' }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(200)
  })
  it("returns 500 if the sms isn't sent", async () => {
    const spy = jest
      .spyOn(service, 'sendSMS')
      .mockImplementation(() => Promise.reject(new Error()))

    const res = await server.server.inject({
      method: 'POST',
      url: '/sms',
      payload: { msisdn: '447789778823', message: 'foo' }
    })

    expect(spy).toHaveBeenCalled()
    expect(res.statusCode).toBe(500)
  })
})
