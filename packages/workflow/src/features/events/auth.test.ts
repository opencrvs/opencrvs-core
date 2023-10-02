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
import { isUserAuthorized } from '@workflow/features/events/auth'
import { Events } from '@workflow/features/events/utils'

describe('isUserAuthorized()', () => {
  it('returns true when token scopes match event', () => {
    expect(isUserAuthorized(['xyz', 'register'], Events.BIRTH_MARK_REG)).toBe(
      true
    )
  })

  it('returns true when multiple token scopes match event', () => {
    expect(
      isUserAuthorized(['declare', 'register'], Events.BIRTH_MARK_VOID)
    ).toBe(true)
  })

  it('returns false when token scopes DO NOT match event', () => {
    expect(isUserAuthorized(['xyz', 'abc'], Events.BIRTH_MARK_REG)).toBe(false)
  })

  it('returns false when token scopes are not defined', () => {
    expect(
      // @ts-ignore
      isUserAuthorized(undefined, Events.BIRTH_MARK_REG)
    ).toBe(false)
  })

  it('returns false when event is not known', () => {
    expect(
      // @ts-ignore
      isUserAuthorized(['xyz', 'register'], '???')
    ).toBe(false)
  })
})
