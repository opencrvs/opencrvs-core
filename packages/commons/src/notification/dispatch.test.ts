/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import { logger } from '../logger'
import { triggerUserEventNotification } from './dispatch'
import { TriggerEvent } from './UserNotifications'

const recipient = {
  name: { firstname: 'John', surname: 'Doe' },
  email: 'john.doe@example.com',
  mobile: '+15551234567'
}

describe('triggerUserEventNotification', () => {
  let fetchMock: jest.Mock
  let errorSpy: jest.SpyInstance

  beforeEach(() => {
    fetchMock = jest.fn()
    global.fetch = fetchMock as unknown as typeof fetch
    errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    errorSpy.mockRestore()
  })

  it('does not log when the dispatch succeeds', async () => {
    const jsonMock = jest.fn()
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: jsonMock })

    const response = await triggerUserEventNotification({
      event: TriggerEvent.PASSWORD_RESET_LINK,
      payload: { recipient, token: 'a-token' },
      countryConfigUrl: 'http://countryconfig',
      authHeader: { Authorization: 'Bearer x' }
    })

    expect(response.ok).toBe(true)
    expect(errorSpy).not.toHaveBeenCalled()
    // the body must be left untouched for the caller to read
    expect(jsonMock).not.toHaveBeenCalled()
  })

  it('logs the event and status, but not the recipient, when the dispatch fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      json: jest.fn()
    })

    const response = await triggerUserEventNotification({
      event: TriggerEvent.USERNAME_REMINDER_LINK,
      payload: { recipient, token: 'a-token' },
      countryConfigUrl: 'http://countryconfig',
      authHeader: { Authorization: 'Bearer x' }
    })

    expect(response.ok).toBe(false)
    expect(errorSpy).toHaveBeenCalledTimes(1)

    const loggedMessage = errorSpy.mock.calls[0][0] as string

    expect(loggedMessage).toMatchInlineSnapshot(
      `"triggerUserEventNotification: dispatch failed for event "username-reminder-link" with status 404"`
    )

    // Kept alongside the snapshot on purpose. An updated snapshot is easy to
    // accept without reading; these two say outright that the recipient must
    // never reach the log, since this runs on an unauthenticated path.
    expect(loggedMessage).not.toContain(recipient.email)
    expect(loggedMessage).not.toContain(recipient.mobile)
  })

  it('leaves a failed response body unread so callers can still inspect it', async () => {
    const jsonMock = jest.fn().mockResolvedValue({ message: 'nope' })
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: jsonMock })

    const response = await triggerUserEventNotification({
      event: TriggerEvent.ALL_USER_NOTIFICATION,
      payload: { recipient, subject: 'subj', body: 'body' },
      countryConfigUrl: 'http://countryconfig',
      authHeader: { Authorization: 'Bearer x' }
    })

    expect(errorSpy).toHaveBeenCalledTimes(1)
    // The shared function must not have consumed the body itself.
    expect(jsonMock).not.toHaveBeenCalled()
    // ...and the caller can still read it afterwards.
    await expect(response.json()).resolves.toEqual({ message: 'nope' })
  })
})
