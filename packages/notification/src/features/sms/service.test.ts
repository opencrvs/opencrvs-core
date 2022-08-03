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
import { notifyCountryConfig } from '@notification/features/sms/service'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

describe('.sendSMS()', () => {
  it('should throw when the fetch throws', async () => {
    const logSpy = jest.spyOn(logger, 'info')
    fetch.once('Success')
    await expect(notifyCountryConfig('+27845555555', 'test', 'Bearer token...'))
    expect(logSpy).toBeCalledTimes(2)
  })

  it('should throw when the fetch throws', async () => {
    const logSpy = jest.spyOn(logger, 'error')
    fetch.mockRejectOnce(new Error('something broke :('))
    await expect(
      notifyCountryConfig('+27845555555', 'test', 'Bearer token...')
    ).rejects.toThrow()
    expect(logSpy).toHaveBeenLastCalledWith(new Error('something broke :('))
  })
})
