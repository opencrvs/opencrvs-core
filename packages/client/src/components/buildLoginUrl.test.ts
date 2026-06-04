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
import { describe, it, expect, beforeEach } from 'vitest'
import { buildLoginUrl } from './VersionMismatchModal'

beforeEach(() => {
  window.config.LOGIN_URL = 'https://login.example.com'
})

describe('buildLoginUrl', () => {
  it('uses LOGIN_URL when available', () => {
    const url = buildLoginUrl('en')
    expect(url).toContain('https://login.example.com')
    expect(url).toContain('lang=en')
  })

  it('falls back to /login when LOGIN_URL is not set', () => {
    window.config.LOGIN_URL = undefined
    const url = buildLoginUrl('en')
    expect(url).toContain(`${window.location.origin}/login`)
  })

  it('includes the provided language', () => {
    const url = buildLoginUrl('fr')
    expect(url).toContain('lang=fr')
  })

  it('falls back to en when lang is null', () => {
    const url = buildLoginUrl(null)
    expect(url).toContain('lang=en')
  })

  it('uses current pathname as redirectTo', () => {
    window.history.pushState({}, '', '/workqueue')
    const url = buildLoginUrl('en')
    expect(url).toContain('redirectTo=%2Fworkqueue')
    window.history.pushState({}, '', '/')
  })
})
