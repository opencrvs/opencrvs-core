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
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchEventConfigs } from './endpoints'

function serveEventConfigs(body: unknown) {
  vi.stubGlobal('fetch', async () => Response.json(body))
}

describe('fetchEventConfigs', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reads the actions of every version of an event', async () => {
    serveEventConfigs([
      {
        id: 'birth',
        label: {},
        versions: [
          { id: 'v1', actions: [{ type: 'DECLARE' }, { type: 'REGISTER' }] },
          { id: 'v2', actions: [{ type: 'DECLARE' }, { type: 'CUSTOM' }] }
        ]
      }
    ])

    expect(await fetchEventConfigs('https://example.org')).toEqual([
      { id: 'birth', actions: ['DECLARE', 'REGISTER', 'CUSTOM'] }
    ])
  })

  it('reads the actions of an event served without versions', async () => {
    serveEventConfigs([
      { id: 'death', label: {}, actions: [{ type: 'DECLARE' }] }
    ])

    expect(await fetchEventConfigs('https://example.org')).toEqual([
      { id: 'death', actions: ['DECLARE'] }
    ])
  })

  it('returns null when an event is not the expected shape', async () => {
    serveEventConfigs([
      { id: 'birth', versions: [{ actions: [{ type: 'DECLARE' }] }] },
      { id: 'death', versions: [{ actions: 'DECLARE' }] }
    ])

    expect(await fetchEventConfigs('https://example.org')).toBeNull()
  })
})
