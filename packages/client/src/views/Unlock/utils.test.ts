import { storage } from '@client/storage'
import { pinLoader } from './utils'

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
import { vi } from 'vitest'

describe('Unlock page loads Properly', () => {
  const expectedPin =
    '$2a$10$xQBLcbPgGQNu9p6zVchWuu6pmCrQIjcb6k2W1PIVUxVTE/PumWM82'
  beforeEach(async () => {
    // mock indexeddb
    const indexedDB = {
      USER_DETAILS: JSON.stringify({ userMgntUserID: 'shakib75' }),
      USER_DATA: JSON.stringify([
        {
          userID: 'shakib75',
          userPIN: expectedPin,
          drafts: []
        }
      ])
    }

    storage.getItem = vi.fn(async (key: string) =>
      // @ts-ignore
      Promise.resolve(indexedDB[key])
    )

    storage.setItem = vi.fn(
      // @ts-ignore
      async (key: string, value: string) => (indexedDB[key] = value)
    )
  })

  it('Should retrieve user pin from index db', async () => {
    const receivedPin = await pinLoader.loadUserPin()
    expect(receivedPin).toEqual(expectedPin)
  })
})
