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
import { describe, expect, it } from 'vitest'
import { getLanguages } from './service'

function messagesFor(languages: Awaited<ReturnType<typeof getLanguages>>) {
  const english = languages.find(({ lang }) => lang === 'en')
  expect(english).toBeDefined()
  return english!.messages
}

describe('getLanguages', () => {
  it('serves client copy and country config copy as one bundle', async () => {
    const messages = messagesFor(await getLanguages('client'))

    // Declared by core's client package, synced by `opencrvs upgrade`.
    expect(messages['action.action']).toBe('Action')
    // Declared by this country config, never touched by an upgrade.
    expect(messages['birth.search.criteria.label.prefix.child']).toBe("Child's")
  })

  it('leaves applications without a merge list reading a single file', async () => {
    const messages = messagesFor(await getLanguages('login'))

    expect(messages['birth.search.criteria.label.prefix.child']).toBeUndefined()
    expect(Object.keys(messages).length).toBeGreaterThan(0)
  })

  it('ignores a translation file that does not exist', async () => {
    // Country configs that predate the client.csv/countryconfig.csv split have
    // no countryconfig.csv, and all of their copy still lives in client.csv.
    await expect(getLanguages('does-not-exist')).resolves.toEqual([])
  })
})
