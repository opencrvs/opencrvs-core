import * as fetch from 'jest-fetch-mock'

import { sendSMS } from './service'

describe('.sendSMS()', () => {
  it('should send SMS request to clickatell and log success', async () => {
    const logSpy = jest.fn()
    fetch.once('Success')
    // @ts-ignore
    await sendSMS({ log: logSpy }, { msisdn: '+27845555555', message: 'test' })
    expect(logSpy).toHaveBeenLastCalledWith(
      ['info', 'sms'],
      'Received success response from Clickatell: Success'
    )
  })

  it('should throw when an ERR is returned in the body', async () => {
    const logSpy = jest.fn()
    fetch.once('ERR: something broke :(')
    // @ts-ignore
    expect(
      sendSMS({ log: logSpy }, { msisdn: '+27845555555', message: 'test' })
    ).rejects.toThrow()
  })

  it('should throw when the fetch throws', async () => {
    const logSpy = jest.fn()
    fetch.mockRejectOnce(new Error('something broke :('))
    // @ts-ignore
    expect(
      sendSMS({ log: logSpy }, { msisdn: '+27845555555', message: 'test' })
    ).rejects.toThrow()
  })
})
