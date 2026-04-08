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
  decodeScope,
  encodeScope,
  v1ScopeToV2Scope,
  getScopeOptionValue,
  JurisdictionFilter,
  ScopesWithDeclaredOptions,
  ScopesWithFullOptions,
  ScopesWithPlaceEventOptions,
  migrateV1ScopesToV2,
  MIGRATED_LEGACY_SCOPES
} from './scopes'
import {
  findScope,
  parseConfigurableScope
} from './scopes.deprecated.do-not-use'

describe('getScopeOptionValue()', () => {
  it('should return the default value if the scope option is not set', () => {
    const scope = {
      type: 'record.create'
    } as const

    const result = getScopeOptionValue(scope, 'placeOfEvent')
    expect(result).toEqual('all')
  })

  it('should return the value if the scope option is set', () => {
    const scope = {
      type: 'record.create',
      options: {
        placeOfEvent: JurisdictionFilter.enum.administrativeArea
      }
    } as const

    const result = getScopeOptionValue(scope, 'placeOfEvent')
    expect(result).toEqual(JurisdictionFilter.enum.administrativeArea)
  })
})

describe('findScope()', () => {
  const userScopes = [
    'foobar',
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
    const result = findScope(userScopes, 'user.create')
    expect(result).toEqual({
      type: 'user.create',
      options: { role: ['first-role', 'second-role'] }
    })
  })

  it('returns undefined if the scope is not found', () => {
    const result = findScope(userScopes, 'user.edit')
    expect(result).toEqual(undefined)
  })
})

describe('parseConfigurableScope()', () => {
  it('should not be able to parse a literal scope', () => {
    expect(parseConfigurableScope('user.create')).toEqual(undefined)
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

  it('should return scope for a valid scope with print-certified-copies', () => {
    const scope1 =
      'record.registered.print-certified-copies[event=tennis-club-membership,templates=v2.tennis-club-membership-certificate-alpha]' // valid scope with templateIds option
    expect(parseConfigurableScope(scope1)).toEqual({
      type: 'record.registered.print-certified-copies',
      options: {
        event: ['tennis-club-membership'],
        templates: ['v2.tennis-club-membership-certificate-alpha']
      }
    })

    const scope2 =
      'record.registered.print-certified-copies[event=tennis-club-membership]' // valid because templates is optional

    expect(parseConfigurableScope(scope2)).toEqual({
      type: 'record.registered.print-certified-copies',
      options: { event: ['tennis-club-membership'] }
    })

    const scope3 =
      'record.registered.print-certified-copies[event=tennis-club-membership,templates=]' // invalid because templates is empty

    expect(parseConfigurableScope(scope3)).toEqual(undefined)

    const scope4 =
      'record.registered.print-certified-copies[event=tennis-club-membership,templates=v2.tennis-club-membership-certificate-alpha|v2.birth]' // valid scope with multiple templateIds option

    expect(parseConfigurableScope(scope4)).toEqual({
      type: 'record.registered.print-certified-copies',
      options: {
        event: ['tennis-club-membership'],
        templates: ['v2.tennis-club-membership-certificate-alpha', 'v2.birth']
      }
    })
  })
})

describe('2.0 scopes', () => {
  it('Strips out scope options unavailable for the "placeEvent" scope types', () => {
    const placeEventScopes = ScopesWithPlaceEventOptions.options.map((type) =>
      encodeScope({
        type,
        options: {
          event: ['birth', 'death'],
          placeOfEvent: 'location',
          // @ts-expect-error - intentionally include irrelevant options to test that they are stripped out
          declaredBy: 'user' as const,
          declaredIn: 'administrativeArea' as const,
          registeredBy: 'user' as const,
          registeredIn: 'administrativeArea' as const
        }
      })
    )

    expect(placeEventScopes.map(decodeScope)).toEqual([
      {
        options: { event: ['birth', 'death'], placeOfEvent: 'location' },
        type: 'record.create'
      },
      {
        options: { event: ['birth', 'death'], placeOfEvent: 'location' },
        type: 'record.declare'
      },
      {
        options: { event: ['birth', 'death'], placeOfEvent: 'location' },
        type: 'record.notify'
      }
    ])
  })

  it('Strips out scope options unavailable for the "declared" scope types', () => {
    const declaredEventOptions = ScopesWithDeclaredOptions.options.map((type) =>
      encodeScope({
        type,
        options: {
          event: ['birth', 'death'],
          placeOfEvent: 'location' as const,
          declaredBy: 'user' as const,
          declaredIn: 'administrativeArea' as const,
          // @ts-expect-error - intentionally include irrelevant options to test that they are stripped out
          registeredBy: 'user' as const,
          registeredIn: 'administrativeArea' as const
        }
      })
    )

    expect(declaredEventOptions.map(decodeScope)).toEqual([
      {
        type: 'record.edit',
        options: {
          event: ['birth', 'death'],
          placeOfEvent: 'location',
          declaredIn: 'administrativeArea',
          declaredBy: 'user'
        }
      },
      {
        type: 'record.reject',
        options: {
          event: ['birth', 'death'],
          placeOfEvent: 'location',
          declaredIn: 'administrativeArea',
          declaredBy: 'user'
        }
      },
      {
        type: 'record.archive',
        options: {
          event: ['birth', 'death'],
          placeOfEvent: 'location',
          declaredIn: 'administrativeArea',
          declaredBy: 'user'
        }
      },
      {
        type: 'record.review-duplicates',
        options: {
          event: ['birth', 'death'],
          placeOfEvent: 'location',
          declaredIn: 'administrativeArea',
          declaredBy: 'user'
        }
      },
      {
        type: 'record.register',
        options: {
          event: ['birth', 'death'],
          placeOfEvent: 'location',
          declaredIn: 'administrativeArea',
          declaredBy: 'user'
        }
      }
    ])
  })

  it('Keeps all scope options for the "full" scope types', () => {
    const fullEventOptions = ScopesWithFullOptions.options.map((type) =>
      encodeScope({
        type,
        options: {
          event: ['birth', 'death'],
          placeOfEvent: 'location' as const,
          declaredBy: 'user' as const,
          declaredIn: 'administrativeArea' as const,
          registeredBy: 'user' as const,
          registeredIn: 'administrativeArea' as const
        }
      })
    )

    expect(fullEventOptions.map(decodeScope)).toEqual([
      {
        type: 'record.search',
        options: {
          event: ['birth', 'death'],
          placeOfEvent: 'location',
          declaredIn: 'administrativeArea',
          declaredBy: 'user',
          registeredIn: 'administrativeArea',
          registeredBy: 'user'
        }
      },
      {
        type: 'record.read',
        options: {
          event: ['birth', 'death'],
          placeOfEvent: 'location',
          declaredIn: 'administrativeArea',
          declaredBy: 'user',
          registeredIn: 'administrativeArea',
          registeredBy: 'user'
        }
      },
      {
        type: 'record.request-correction',
        options: {
          event: ['birth', 'death'],
          placeOfEvent: 'location',
          declaredIn: 'administrativeArea',
          declaredBy: 'user',
          registeredIn: 'administrativeArea',
          registeredBy: 'user'
        }
      },
      {
        type: 'record.correct',
        options: {
          event: ['birth', 'death'],
          placeOfEvent: 'location',
          declaredIn: 'administrativeArea',
          declaredBy: 'user',
          registeredIn: 'administrativeArea',
          registeredBy: 'user'
        }
      },
      {
        type: 'record.unassign-others',
        options: {
          event: ['birth', 'death'],
          placeOfEvent: 'location',
          declaredIn: 'administrativeArea',
          declaredBy: 'user',
          registeredIn: 'administrativeArea',
          registeredBy: 'user'
        }
      }
    ])
  })

  it('Supports templates option for record.print-certified-copies', () => {
    const scopeWithTemplates = encodeScope({
      type: 'record.print-certified-copies',
      options: {
        event: ['birth', 'death'],
        placeOfEvent: 'location' as const,
        declaredBy: 'user' as const,
        declaredIn: 'administrativeArea' as const,
        registeredBy: 'user' as const,
        registeredIn: 'administrativeArea' as const,
        templates: ['cert-1', 'cert-2']
      }
    })

    expect(decodeScope(scopeWithTemplates)).toEqual({
      type: 'record.print-certified-copies',
      options: {
        event: ['birth', 'death'],
        placeOfEvent: 'location',
        declaredIn: 'administrativeArea',
        declaredBy: 'user',
        registeredIn: 'administrativeArea',
        registeredBy: 'user',
        templates: ['cert-1', 'cert-2']
      }
    })
  })

  it('V1 record.registered.print-certified-copies with templates migrates to V2 with templates preserved', () => {
    const v1Scope =
      'record.registered.print-certified-copies[event=birth|death,templates=cert-1|cert-2]'

    expect(v1ScopeToV2Scope(v1Scope)).toEqual(
      'type=record.print-certified-copies&event=birth,death&templates=cert-1,cert-2'
    )
  })

  it('Should decode scope with single event & template', () => {
    const scope =
      'type=record.print-certified-copies&event=tennis-club-membership&templates=v2.tennis-club-membership-certificate-alpha'
    const decodedScope = decodeScope(scope)
    expect(decodedScope).toEqual({
      type: 'record.print-certified-copies',
      options: {
        event: ['tennis-club-membership'],
        templates: ['v2.tennis-club-membership-certificate-alpha']
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
      MIGRATED_LEGACY_SCOPES.PERFORMANCE_READ,
      MIGRATED_LEGACY_SCOPES.PERFORMANCE_READ_DASHBOARDS,
      MIGRATED_LEGACY_SCOPES.PROFILE_ELECTRONIC_SIGNATURE,
      MIGRATED_LEGACY_SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
      'workqueue[id=all-events|assigned-to-you|recent|requires-completion|requires-updates|in-review-all|in-external-validation|ready-to-print|ready-to-issue]',
      'search[event=birth,access=all]',
      'search[event=death,access=all]',
      'search[event=tennis-club-membership,access=all]',
      'search[event=FOOTBALL_CLUB_MEMBERSHIP,access=all]',
      MIGRATED_LEGACY_SCOPES.USER_READ_ONLY_MY_AUDIT,
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
      MIGRATED_LEGACY_SCOPES.PERFORMANCE_READ,
      MIGRATED_LEGACY_SCOPES.PERFORMANCE_READ_DASHBOARDS,
      MIGRATED_LEGACY_SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
      MIGRATED_LEGACY_SCOPES.USER_READ_ONLY_MY_AUDIT,
      'workqueue[id=all-events|assigned-to-you|recent|requires-completion|requires-updates|in-review|sent-for-approval|in-external-validation|ready-to-print|ready-to-issue]',
      'search[event=birth,access=all]',
      'search[event=death,access=all]',
      'search[event=tennis-club-membership,access=all]',
      'search[event=FOOTBALL_CLUB_MEMBERSHIP,access=all]',
      'record.create[event=birth|death|tennis-club-membership]',
      'record.read[event=birth|death|tennis-club-membership]',
      'record.declare[event=birth|death|tennis-club-membership]',
      'record.declared.reject[event=birth|death|tennis-club-membership]',
      'record.declared.archive[event=birth|death|tennis-club-membership]',
      'record.registered.print-certified-copies[event=birth|death|tennis-club-membership]',
      'record.registered.request-correction[event=birth|death|tennis-club-membership]'
    ],
    fieldAgent: [
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
      MIGRATED_LEGACY_SCOPES.USER_READ_MY_OFFICE,
      MIGRATED_LEGACY_SCOPES.USER_READ_MY_JURISDICTION,
      MIGRATED_LEGACY_SCOPES.USER_UPDATE_MY_JURISDICTION,
      MIGRATED_LEGACY_SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION,
      MIGRATED_LEGACY_SCOPES.PERFORMANCE_READ,
      MIGRATED_LEGACY_SCOPES.PERFORMANCE_READ_DASHBOARDS,
      MIGRATED_LEGACY_SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS,
      MIGRATED_LEGACY_SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
      'user.create[role=FIELD_AGENT|POLICE_OFFICER|SOCIAL_WORKER|HEALTHCARE_WORKER|LOCAL_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR]',
      'user.edit[role=FIELD_AGENT|POLICE_OFFICER|SOCIAL_WORKER|HEALTHCARE_WORKER|LOCAL_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR]'
    ],
    nationalSystemAdmin: [
      MIGRATED_LEGACY_SCOPES.CONFIG_UPDATE_ALL,
      MIGRATED_LEGACY_SCOPES.ORGANISATION_READ_LOCATIONS,
      MIGRATED_LEGACY_SCOPES.USER_CREATE,
      MIGRATED_LEGACY_SCOPES.USER_UPDATE,
      MIGRATED_LEGACY_SCOPES.USER_READ,
      MIGRATED_LEGACY_SCOPES.PERFORMANCE_READ,
      MIGRATED_LEGACY_SCOPES.PERFORMANCE_READ_DASHBOARDS,
      MIGRATED_LEGACY_SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS,
      MIGRATED_LEGACY_SCOPES.RECORD_REINDEX,
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

it('migrate v1 scopes to v2', () => {
  // Mix of deprecated, upgraded and unchanged scopes
  const v1Scopes = [
    MIGRATED_LEGACY_SCOPES.PERFORMANCE_READ,
    MIGRATED_LEGACY_SCOPES.PERFORMANCE_READ_DASHBOARDS,
    MIGRATED_LEGACY_SCOPES.USER_READ_MY_OFFICE,
    MIGRATED_LEGACY_SCOPES.USER_READ_MY_JURISDICTION,
    MIGRATED_LEGACY_SCOPES.USER_UPDATE_MY_JURISDICTION,
    MIGRATED_LEGACY_SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION,
    MIGRATED_LEGACY_SCOPES.USER_READ_ONLY_MY_AUDIT,
    MIGRATED_LEGACY_SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
    'workqueue[id=all-events|assigned-to-you|recent|requires-completion|requires-updates|in-review-all|in-external-validation|ready-to-print|ready-to-issue]',
    'search[event=birth,access=all]',
    'search[event=death,access=all]',
    'search[event=tennis-club-membership,access=all]',
    'search[event=FOOTBALL_CLUB_MEMBERSHIP,access=all]',
    'record.create[event=birth|death|tennis-club-membership]',
    'record.read[event=birth|death|tennis-club-membership]',
    'record.declare[event=birth|death|tennis-club-membership]',
    'record.declared.reject[event=birth|death|tennis-club-membership]',
    'record.declared.archive[event=birth|death|tennis-club-membership]',
    'record.declared.validate[event=birth|death|tennis-club-membership]',
    'record.register[event=birth|death|tennis-club-membership]',
    'record.registered.print-certified-copies[event=birth|death|tennis-club-membership]',
    'record.registered.correct[event=birth|death|tennis-club-membership]',
    'record.unassign-others[event=birth|death|tennis-club-membership]',
    'record.declared.review-duplicates[event=birth|death|tennis-club-membership]'
  ]

  expect(v1Scopes).toHaveLength(24)

  const v2Scopes = migrateV1ScopesToV2(v1Scopes)
  expect(v2Scopes).toHaveLength(24)

  expect(v2Scopes).toEqual([
    'performance.read',
    'performance.read-dashboards',
    'user.read:my-office',
    'user.read:my-jurisdiction',
    'user.update:my-jurisdiction',
    'organisation.read-locations:my-jurisdiction',
    'user.read:only-my-audit',
    'organisation.read-locations:my-office',
    'type=workqueue&ids=all-events,assigned-to-you,recent,requires-completion,requires-updates,in-review-all,in-external-validation,ready-to-print,ready-to-issue',
    'type=record.search&event=birth&placeOfEvent=all',
    'type=record.search&event=death&placeOfEvent=all',
    'type=record.search&event=tennis-club-membership&placeOfEvent=all',
    'type=record.search&event=FOOTBALL_CLUB_MEMBERSHIP&placeOfEvent=all',
    'type=record.create&event=birth,death,tennis-club-membership',
    'type=record.read&event=birth,death,tennis-club-membership',
    'type=record.declare&event=birth,death,tennis-club-membership',
    'type=record.reject&event=birth,death,tennis-club-membership',
    'type=record.archive&event=birth,death,tennis-club-membership',
    'type=record.custom-action&event=birth,death,tennis-club-membership&customActionTypes=VALIDATE_DECLARATION',
    'type=record.register&event=birth,death,tennis-club-membership',
    'type=record.print-certified-copies&event=birth,death,tennis-club-membership',
    'type=record.correct&event=birth,death,tennis-club-membership',
    'type=record.unassign-others&event=birth,death,tennis-club-membership',
    'type=record.review-duplicates&event=birth,death,tennis-club-membership'
  ])
})
