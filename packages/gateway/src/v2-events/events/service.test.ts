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
import { api } from './service'

const as = (authorization: string) => ({
  context: { headers: { authorization } }
})

describe('events client', () => {
  it('sends each call with its own authorization header', async () => {
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(
        async () =>
          new Response(JSON.stringify({ result: { data: { json: [] } } }))
      )

    await Promise.all([
      api.config.certificates.query(undefined, as('Bearer USER_A')),
      api.config.certificates.query(undefined, as('Bearer USER_B')),
      api.config.publicApplication.query()
    ])

    const authorizations = fetchSpy.mock.calls.map(([, init]) =>
      new Headers(init?.headers).get('authorization')
    )
    expect(authorizations.sort()).toEqual([
      'Bearer USER_A',
      'Bearer USER_B',
      null
    ])
    fetchSpy.mockRestore()
  })
})
