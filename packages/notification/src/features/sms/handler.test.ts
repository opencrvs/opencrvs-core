import * as service from './service'
import { createServer } from '../..'

describe('smsHandler', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it('should return OK if the sms gets sent', async () => {
    const spy = jest.spyOn(service, 'sendSMS').mockResolvedValueOnce(null)

    await server.server.inject({
      method: 'POST',
      url: '/sms',
      payload: { msisdn: '447789778823', message: 'foo' }
    })

    expect(spy).toHaveBeenCalled()
  })
})
