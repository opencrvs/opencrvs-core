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
import { env } from '@gateway/environment'
import { trpcProxy } from '@gateway/v2-events/event-config/routes'

const [{ handler }] = trpcProxy

const callHandler = (path: string, search = '') => {
  const h = { proxy: jest.fn() }
  try {
    handler.call(
      null,
      { params: { path }, url: { search } } as never,
      h as never
    )
    return { h, error: undefined }
  } catch (error) {
    return { h, error }
  }
}

const proxy = (path: string, search = '') =>
  new URL(callHandler(path, search).h.proxy.mock.calls[0][0].uri)

describe('events proxy', () => {
  it('forwards the path to the events service', () => {
    expect(proxy('event.get', '?batch=1').toString()).toBe(
      `${env.EVENTS_URL}event.get?batch=1`
    )
  })

  // https://github.com/opencrvs/opencrvs-core/issues/13587
  it.each([
    'http:/\\/httpbin.org/headers',
    'http://evil.example/x',
    '//evil.example/x',
    '\\\\evil.example/x',
    'https://user:pass@evil.example/x',
    '../../../x'
  ])('never leaves the events service host: %s', (path) => {
    expect(proxy(path).host).toBe(new URL(env.EVENTS_URL).host)
  })

  it.each([
    'internal/user.get',
    'internal/',
    'internal',
    'event.get/../internal/user.get',
    './internal/locations.get'
  ])(
    'does not forward the internal router of the events service: %s',
    (path) => {
      const { h, error } = callHandler(path)
      expect(error).toMatchObject({ output: { statusCode: 404 } })
      expect(h.proxy).not.toHaveBeenCalled()
    }
  )

  it.each(['internalNotes.get', 'events/search'])(
    'forwards a path that only starts with the same letters: %s',
    (path) => {
      expect(proxy(path).pathname).toBe(`/${path}`)
    }
  )
})
