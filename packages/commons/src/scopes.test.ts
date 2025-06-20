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

import { findScope, parseScope, SCOPES } from './scopes'

describe('findScope()', () => {
  const userScopes = [
    SCOPES.USER_CREATE,
    SCOPES.USER_READ,
    'user.create[role=first-role|second-role]',
    'record.notify[event=v2.birth]'
  ]

  it('successfully finds a configurable scope', () => {
    const result = findScope(userScopes, 'user.create')
    expect(result).toEqual({
      type: 'user.create',
      options: { role: ['first-role', 'second-role'] }
    })
  })

  it('successfully finds a configurable scope, even if config value includes special characters', () => {
    const result = findScope(userScopes, 'record.notify')
    expect(result).toEqual({
      type: 'record.notify',
      options: { event: ['v2.birth'] }
    })
  })

  it('returns undefined if the scope is not found', () => {
    const result = findScope(userScopes, 'user.edit')
    expect(result).toEqual(undefined)
  })
})

describe('parseScope()', () => {
  it('should successfully parse a literal scope', () => {
    const result = parseScope(SCOPES.USER_CREATE)
    expect(result).toEqual({ type: 'user.create:all' })
  })

  it('should successfully parse a configurable scope', () => {
    const scope = 'user.create[role=foo|bar]'
    const result = parseScope(scope)

    expect(result).toEqual({
      type: 'user.create',
      options: { role: ['foo', 'bar'] }
    })
  })

  it('should return undefined for a configurable scope with no options', () => {
    const scope = 'user.create[role=]'
    const result = parseScope(scope)
    expect(result).toEqual(undefined)
  })

  it('should return undefined for a configurable scope with missing options bracket', () => {
    const scope = 'user.create'
    const result = parseScope(scope)
    expect(result).toEqual(undefined)
  })

  it('should return undefined for a configurable scope with empty options bracket', () => {
    const scope = 'user.create[]'
    const result = parseScope(scope)
    expect(result).toEqual(undefined)
  })

  it('should return undefined for an invalid scope with search', () => {
    const scope = 'search[event=]'
    const result = parseScope(scope)
    expect(result).toEqual(undefined)
  })

  it('should return scope for a valid scope with search', () => {
    const scope = 'search[event=tennis-club-membership:all|birth:all]'
    const result = parseScope(scope)
    expect(result).toEqual({
      type: 'search',
      options: {
        birth: 'all',
        'tennis-club-membership': 'all'
      }
    })
  })

  it('should return scope for a valid scope with search for different jurisdiction', () => {
    const scope =
      'search[event=tennis-club-membership:my-jurisdiction|birth:all]'
    const result = parseScope(scope)
    expect(result).toEqual({
      type: 'search',
      options: {
        birth: 'all',
        'tennis-club-membership': 'my-jurisdiction'
      }
    })
  })

  it('should return scope for a valid scope with search for a single event', () => {
    const scope = 'search[event=tennis-club-membership:all]'
    const result = parseScope(scope)
    expect(result).toEqual({
      type: 'search',
      options: {
        'tennis-club-membership': 'all'
      }
    })
  })
})
