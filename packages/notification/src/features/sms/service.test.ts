/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { logger } from '@notification/logger'
import { sendSMS } from '@notification/features/sms/service'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

describe('.sendSMS()', () => {
  it('should send SMS request to clickatell and log success', async () => {
    const logSpy = jest.spyOn(logger, 'info')
    fetch.once('Success')
    await sendSMS('+27845555555', 'test')
    expect(logSpy).toHaveBeenLastCalledWith('Response from Infobip: "Success"')
  })

  it('should throw when an ERR is returned in the body', async () => {
    const logSpy = jest.spyOn(logger, 'error')
    fetch.mockResponse(JSON.stringify({}), { status: 400 })
    await expect(sendSMS('+27845555555', 'test')).rejects.toThrow()
    expect(logSpy).toHaveBeenLastCalledWith(
      'Failed to send sms to +27845555555'
    )
  })

  it('should throw when the fetch throws', async () => {
    const logSpy = jest.spyOn(logger, 'error')
    fetch.mockRejectOnce(new Error('something broke :('))
    await expect(sendSMS('+27845555555', 'test')).rejects.toThrow()
    expect(logSpy).toHaveBeenLastCalledWith(new Error('something broke :('))
  })
})
