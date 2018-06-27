import smsHandler from './handler'

import * as service from './service'

describe('smsHandler', () => {
  it('should return OK if the sms gets sent', async () => {
    jest.spyOn(service, 'sendSMS').mockResolvedValueOnce(null)
    // @ts-ignore
    const res = await smsHandler({}, {})
    expect(res).toBe('OK')
  })
})
