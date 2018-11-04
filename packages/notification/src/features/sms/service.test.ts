import * as fetch from 'jest-fetch-mock'
import { logger } from '../../logger'
import { sendSMS } from './service'

describe('.sendSMS()', () => {
  it('should send SMS request to clickatell and log success', async () => {
    const logSpy = jest.spyOn(logger, 'info')
    fetch.once('Success')
    await sendSMS('+27845555555', 'test')
    expect(logSpy).toHaveBeenLastCalledWith(
      'Received success response from Clickatell: Success'
    )
  })

  it('should throw when an ERR is returned in the body', async () => {
    const logSpy = jest.spyOn(logger, 'error')
    fetch.once('ERR: something broke :(')
    await expect(sendSMS('+27845555555', 'test')).rejects.toThrow()
    expect(logSpy).toHaveBeenLastCalledWith('ERR: something broke :(')
  })

  it('should throw when the fetch throws', async () => {
    const logSpy = jest.spyOn(logger, 'error')
    fetch.mockRejectOnce(new Error('something broke :('))
    await expect(sendSMS('+27845555555', 'test')).rejects.toThrow()
    expect(logSpy).toHaveBeenLastCalledWith(new Error('something broke :('))
  })
})
