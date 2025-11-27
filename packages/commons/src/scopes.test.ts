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

import {
  findScope,
  parseConfigurableScope,
  parseLiteralScope,
  SCOPES
} from './scopes'
import * as qs from 'qs'
import { decodeScope, encodeScope, v1ScopeToV2Scope } from './scopes-v2'

describe('findScope()', () => {
  const userScopes = [
    SCOPES.USER_CREATE,
    SCOPES.USER_READ,
    'user.create[role=first-role|second-role]',
    'record.notify[event=birth]'
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
      options: { event: ['birth'] }
    })
  })

  it('returns undefined if the scope is not found', () => {
    const result = findScope(userScopes, 'user.edit')
    expect(result).toEqual(undefined)
  })
})

describe('parseLiteralScope()', () => {
  it('should not be able to parse a configurable scope', () => {
    const scope = 'user.create[role=foo|bar]'
    const result = parseLiteralScope(scope)
    expect(result).toEqual(undefined)
  })

  it('should successfully parse a literal scope', () => {
    const result = parseLiteralScope(SCOPES.USER_CREATE)
    expect(result).toEqual({ type: 'user.create:all' })
  })
})

describe('parseConfigurableScope()', () => {
  it('should not be able to parse a literal scope', () => {
    expect(parseConfigurableScope(SCOPES.USER_CREATE)).toEqual(undefined)
  })

  it('should successfully parse a configurable scope', () => {
    const scope = 'user.create[role=foo|bar]'
    const result = parseConfigurableScope(scope)

    expect(result).toEqual({
      type: 'user.create',
      options: { role: ['foo', 'bar'] }
    })
  })

  it('should return undefined for a configurable scope with no options', () => {
    const scope = 'user.create[role=]'
    const result = parseConfigurableScope(scope)
    expect(result).toEqual(undefined)
  })

  it('should return undefined for a configurable scope with missing options bracket', () => {
    const scope = 'user.create'
    const result = parseConfigurableScope(scope)
    expect(result).toEqual(undefined)
  })

  it('should return undefined for a configurable scope with empty options bracket', () => {
    const scope = 'user.create[]'
    const result = parseConfigurableScope(scope)
    expect(result).toEqual(undefined)
  })

  it('should return undefined for an invalid scope with search', () => {
    const scope = 'search[event=]'
    const result = parseConfigurableScope(scope)
    expect(result).toEqual(undefined)
  })

  it('should return scope for a valid scope with search', () => {
    const tennisScope = 'search[event=tennis-club-membership,access=all]'
    const birthScope = 'search[event=birth,access=all]'

    expect(parseConfigurableScope(tennisScope)).toEqual({
      type: 'search',
      options: {
        event: ['tennis-club-membership'],
        access: ['all']
      }
    })

    expect(parseConfigurableScope(birthScope)).toEqual({
      type: 'search',
      options: {
        event: ['birth'],
        access: ['all']
      }
    })

    const mergedScopes = findScope([tennisScope, birthScope], 'search')
    expect(mergedScopes).toEqual({
      type: 'search',
      options: { 'tennis-club-membership': 'all', birth: 'all' }
    })
  })

  it('should return scope for a valid scope with search for different jurisdiction', () => {
    const tennisScope =
      'search[event=tennis-club-membership,access=my-jurisdiction]'
    const birthScope = 'search[event=birth,access=all]'

    expect(parseConfigurableScope(tennisScope)).toEqual({
      type: 'search',
      options: {
        event: ['tennis-club-membership'],
        access: ['my-jurisdiction']
      }
    })

    expect(parseConfigurableScope(birthScope)).toEqual({
      type: 'search',
      options: {
        event: ['birth'],
        access: ['all']
      }
    })
    const mergedScopes = findScope([tennisScope, birthScope], 'search')
    expect(mergedScopes).toEqual({
      type: 'search',
      options: { 'tennis-club-membership': 'my-jurisdiction', birth: 'all' }
    })
  })

  it('should return scope for a valid scope with search for a single event', () => {
    const scope = 'search[event=tennis-club-membership,access=all]'
    expect(parseConfigurableScope(scope)).toEqual({
      type: 'search',
      options: {
        event: ['tennis-club-membership'],
        access: ['all']
      }
    })
    const foundScopes = findScope([scope], 'search')
    expect(foundScopes).toEqual({
      type: 'search',
      options: { 'tennis-club-membership': 'all' }
    })
  })

  it('should return undefined for odd jurisdiction id', () => {
    const scope1 = 'search[event=tennis-club-membership,access=random]'
    expect(parseConfigurableScope(scope1)).toEqual(undefined)

    const scope2 = 'search[event=tennis-club-membership,access=alls]'
    expect(parseConfigurableScope(scope2)).toEqual(undefined)

    const scope3 =
      'search[event=tennis-club-membership,access=my-jurisdictions]'
    expect(parseConfigurableScope(scope3)).toEqual(undefined)

    const mergedScopes = findScope([scope1, scope2, scope3], 'search')
    expect(mergedScopes).toEqual(undefined)
  })
})

describe('2.0 scopes', () => {
  it('encodeScope()', () => {
    const encodedScope = encodeScope({
      type: 'record.create',
      options: {
        event: ['birth', 'death'],
        declaredBy: 'user',
        declaredIn: 'administrativeArea'
      }
    })

    expect(encodedScope).toBe(
      'type=record.create&event=birth,death&declaredBy=user&declaredIn=administrativeArea'
    )
  })

  it('decodeScope()', () => {
    const decodedScope =
      'type=record.create&event=birth,death&declaredBy=user&declaredIn=administrativeArea'

    expect(decodeScope(decodedScope)).toEqual({
      type: 'record.create',
      options: {
        event: ['birth', 'death'],
        declaredBy: 'user',
        declaredIn: 'administrativeArea'
      }
    })
  })
})

it('transform v1 scope to v2', () => {
  const scopes = {
    /**
     * scopes are same as countryconfig/src/data-seeding/roles/roles.ts
     * except for workque scope that has an extra workqueue: all-events
     */
    localRegistrar: [
      SCOPES.RECORD_DECLARATION_EDIT,
      SCOPES.RECORD_REVIEW_DUPLICATES,
      SCOPES.RECORD_DECLARATION_REINSTATE,
      SCOPES.RECORD_CONFIRM_REGISTRATION,
      SCOPES.RECORD_REJECT_REGISTRATION,
      SCOPES.PERFORMANCE_READ,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      SCOPES.PROFILE_ELECTRONIC_SIGNATURE,
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
      SCOPES.SEARCH_BIRTH,
      SCOPES.SEARCH_DEATH,
      SCOPES.SEARCH_MARRIAGE,
      'workqueue[id=all-events|assigned-to-you|recent|requires-completion|requires-updates|in-review-all|in-external-validation|ready-to-print|ready-to-issue]',
      'search[event=birth,access=all]',
      'search[event=death,access=all]',
      'search[event=tennis-club-membership,access=all]',
      'search[event=FOOTBALL_CLUB_MEMBERSHIP,access=all]',
      SCOPES.USER_READ_ONLY_MY_AUDIT,
      'record.create[event=birth|death|tennis-club-membership]',
      'record.read[event=birth|death|tennis-club-membership]',
      'record.declare[event=birth|death|tennis-club-membership]',
      'record.declared.reject[event=birth|death|tennis-club-membership]',
      'record.declared.archive[event=birth|death|tennis-club-membership]',
      'record.register[event=birth|death|tennis-club-membership]',
      'record.registered.print-certified-copies[event=birth|death|tennis-club-membership]',
      'record.registered.correct[event=birth|death|tennis-club-membership]',
      'record.unassign-others[event=birth|death|tennis-club-membership]',
      'record.declared.review-duplicates[event=birth|death|tennis-club-membership]'
    ],
    registrationAgent: [
      SCOPES.RECORD_DECLARATION_EDIT,
      SCOPES.RECORD_DECLARATION_REINSTATE,
      SCOPES.PERFORMANCE_READ,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
      SCOPES.USER_READ_ONLY_MY_AUDIT,
      SCOPES.SEARCH_BIRTH,
      SCOPES.SEARCH_DEATH,
      SCOPES.SEARCH_MARRIAGE,
      'workqueue[id=all-events|assigned-to-you|recent|requires-completion|requires-updates|in-review|sent-for-approval|in-external-validation|ready-to-print|ready-to-issue]',
      'search[event=birth,access=all]',
      'search[event=death,access=all]',
      'search[event=tennis-club-membership,access=all]',
      'search[event=FOOTBALL_CLUB_MEMBERSHIP,access=all]',
      'record.create[event=birth|death|tennis-club-membership]',
      'record.read[event=birth|death|tennis-club-membership]',
      'record.declare[event=birth|death|tennis-club-membership]',
      'record.declared.validate[event=birth|death|tennis-club-membership]',
      'record.declared.reject[event=birth|death|tennis-club-membership]',
      'record.declared.archive[event=birth|death|tennis-club-membership]',
      'record.registered.print-certified-copies[event=birth|death|tennis-club-membership]',
      'record.registered.request-correction[event=birth|death|tennis-club-membership]'
    ],
    fieldAgent: [
      SCOPES.RECORD_SUBMIT_FOR_REVIEW,
      SCOPES.SEARCH_BIRTH,
      SCOPES.SEARCH_DEATH,
      SCOPES.SEARCH_MARRIAGE,
      'workqueue[id=all-events|assigned-to-you|recent|requires-updates|sent-for-review]',
      'search[event=birth,access=all]',
      'search[event=death,access=all]',
      'search[event=tennis-club-membership,access=all]',
      'search[event=FOOTBALL_CLUB_MEMBERSHIP,access=all]',
      'record.create[event=birth|death|tennis-club-membership]',
      'record.declare[event=birth|death|tennis-club-membership]',
      'record.notify[event=birth|death|tennis-club-membership]'
    ],
    localSystemAdmin: [
      SCOPES.USER_READ_MY_OFFICE,
      SCOPES.USER_READ_MY_JURISDICTION,
      SCOPES.USER_UPDATE_MY_JURISDICTION,
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION,
      SCOPES.PERFORMANCE_READ,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS,
      SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
      'user.create[role=FIELD_AGENT|POLICE_OFFICER|SOCIAL_WORKER|HEALTHCARE_WORKER|LOCAL_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR]',
      'user.edit[role=FIELD_AGENT|POLICE_OFFICER|SOCIAL_WORKER|HEALTHCARE_WORKER|LOCAL_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR]'
    ],
    nationalSystemAdmin: [
      SCOPES.CONFIG_UPDATE_ALL,
      SCOPES.ORGANISATION_READ_LOCATIONS,
      SCOPES.USER_CREATE,
      SCOPES.USER_UPDATE,
      SCOPES.USER_READ,
      SCOPES.PERFORMANCE_READ,
      SCOPES.PERFORMANCE_READ_DASHBOARDS,
      SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS,
      SCOPES.RECORD_REINDEX,
      'user.create[role=FIELD_AGENT|HOSPITAL_CLERK|COMMUNITY_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR|NATIONAL_REGISTRAR|LOCAL_SYSTEM_ADMIN|NATIONAL_SYSTEM_ADMIN|PERFORMANCE_MANAGER]',
      'user.edit[role=FIELD_AGENT|HOSPITAL_CLERK|COMMUNITY_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR|NATIONAL_REGISTRAR|LOCAL_SYSTEM_ADMIN|NATIONAL_SYSTEM_ADMIN|PERFORMANCE_MANAGER]'
    ]
  }

  const scopeMapping = Object.fromEntries(
    Object.entries(scopes).map(([role, roleScopes]) => {
      return [
        role,
        roleScopes.map((s) => ({ v2: v1ScopeToV2Scope(s as string), v1: s }))
      ] as const
    })
  )

  expect(scopeMapping).toMatchSnapshot()
})
