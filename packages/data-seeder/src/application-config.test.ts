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
import {
  ApplicationConfigRead,
  parseApplicationConfig,
  getPhoneNumberPattern
} from './application-config'

function read(
  payload: unknown
): Extract<ApplicationConfigRead, { readable: true }> {
  const read = parseApplicationConfig(payload)

  if (!read.readable) {
    throw new Error('expected the configuration to be readable')
  }

  return read
}

describe('a configuration that did not parse', () => {
  it('is one problem about the configuration, and offers no pattern', () => {
    const parsed = parseApplicationConfig({})

    expect(parsed.readable).toBe(false)
    expect(parsed.readable === false && parsed.problem.kind).toBe(
      'applicationConfigUnparsed'
    )
    expect(getPhoneNumberPattern(parsed)).toBeUndefined()
  })
})

describe('a phone number pattern that is not a regular expression', () => {
  const PHONE_NUMBER_PATTERN = '^0(7|9)[0-9{8}$'

  it('is a problem of the configuration rather than of any initial user', () => {
    expect(
      read({ PHONE_NUMBER_PATTERN }).problems
    ).toEqual([{ kind: 'invalidPhoneNumberPattern', pattern: PHONE_NUMBER_PATTERN }])
  })

  it('offers no pattern, which is what stands the mobile number check down', () => {
    expect(
      getPhoneNumberPattern(parseApplicationConfig({ PHONE_NUMBER_PATTERN }))
    ).toBeUndefined()
  })
})

describe('a phone number pattern that is a regular expression', () => {
  const PHONE_NUMBER_PATTERN = '^0(7|9)[0-9]{8}$'

  it('is no problem', () => {
    expect(read({ PHONE_NUMBER_PATTERN }).problems).toEqual([])
  })

  it('is offered alongside the text it was written as, which a report names', () => {
    const pattern = getPhoneNumberPattern(
      parseApplicationConfig({ PHONE_NUMBER_PATTERN })
    )

    expect(pattern?.source).toBe(PHONE_NUMBER_PATTERN)
    expect(pattern?.expression.test('0733333333')).toBe(true)
    expect(pattern?.expression.test('+260733333333')).toBe(false)
  })
})
