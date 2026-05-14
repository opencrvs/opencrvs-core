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
  EncodedScope,
  encodeScope,
  getScopeOptionValue,
  JurisdictionFilter,
  ScopesWithDeclaredOptions,
  ScopesWithFullOptions,
  ScopesWithPlaceEventOptions
} from './scopes'

import {
  migrateLegacyScopesToV2,
  migrateLegacyScopesArrayToV2Scopes,
  legacyScopeToV2Scope
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

  it('should successfully return empty array', () => {
    const result = getScopeOptionValue(
      {
        type: 'workqueue',
        options: {
          ids: []
        }
      },
      'ids'
    )

    expect(result).toEqual([])
  })

  it('should successfully return undefined if scope option is not set and no default is available', () => {
    const result = getScopeOptionValue(
      {
        type: 'record.search',
        options: {}
      },
      'declaredIn'
    )

    expect(result).toEqual(undefined)
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

    expect(legacyScopeToV2Scope(v1Scope)).toEqual(
      'type=record.print-certified-copies&event=birth,death&templates=cert-1,cert-2'
    )
  })

  it('Should decode scope with single event & template', () => {
    const scope =
      'type=record.print-certified-copies&event=tennis-club-membership&templates=v2.tennis-club-membership-certificate-alpha' as EncodedScope

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

it('transform legacy scope to v2', () => {
  const scopes = {
    /**
     * scopes are same as countryconfig/src/data-seeding/roles/roles.ts
     * except for workque scope that has an extra workqueue: all-events
     */
    localRegistrar: [
      'performance.read',
      'performance.read-dashboards',
      'profile.electronic-signature',
      'organisation.read-locations:my-office',
      'workqueue[id=all-events|assigned-to-you|recent|requires-completion|requires-updates|in-review-all|in-external-validation|ready-to-print|ready-to-issue]',
      'search[event=birth,access=all]',
      'search[event=death,access=all]',
      'search[event=tennis-club-membership,access=all]',
      'search[event=FOOTBALL_CLUB_MEMBERSHIP,access=all]',
      'user.read:only-my-audit',
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
      'performance.read',
      'performance.read-dashboards',
      'organisation.read-locations:my-office',
      'user.read:only-my-audit',
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
      'user.read:my-office',
      'user.read:my-jurisdiction',
      'user.update:my-jurisdiction',
      'organisation.read-locations:my-jurisdiction',
      'performance.read',
      'performance.read-dashboards',
      'performance.vital-statistics-export',
      'organisation.read-locations:my-office',
      'user.create[role=FIELD_AGENT|POLICE_OFFICER|SOCIAL_WORKER|HEALTHCARE_WORKER|LOCAL_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR]',
      'user.edit[role=FIELD_AGENT|POLICE_OFFICER|SOCIAL_WORKER|HEALTHCARE_WORKER|LOCAL_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR]'
    ],
    nationalSystemAdmin: [
      'config.update-all',
      'organisation.read-locations',
      'user.create:all',
      'user.update:all',
      'user.read:all',
      'performance.read',
      'performance.read-dashboards',
      'performance.vital-statistics-export',
      'record.reindex',
      'user.create[role=FIELD_AGENT|HOSPITAL_CLERK|COMMUNITY_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR|NATIONAL_REGISTRAR|LOCAL_SYSTEM_ADMIN|NATIONAL_SYSTEM_ADMIN|PERFORMANCE_MANAGER]',
      'user.edit[role=FIELD_AGENT|HOSPITAL_CLERK|COMMUNITY_LEADER|REGISTRATION_AGENT|LOCAL_REGISTRAR|NATIONAL_REGISTRAR|LOCAL_SYSTEM_ADMIN|NATIONAL_SYSTEM_ADMIN|PERFORMANCE_MANAGER]'
    ]
  }

  const scopeMapping = Object.fromEntries(
    Object.entries(scopes).map(([role, roleScopes]) => {
      return [
        role,
        roleScopes.map((s) => ({
          v2: legacyScopeToV2Scope(s as string),
          v1: s
        }))
      ] as const
    })
  )

  expect(scopeMapping).toMatchSnapshot()
})

it('migrate legacy scopes to v2', () => {
  // Mix of legacy v1.8 literal scopes and v1.9 config scopes
  const v1Scopes = [
    'performance.read',
    'performance.read-dashboards',
    'user.read:my-office',
    'user.read:my-jurisdiction',
    'user.update:my-jurisdiction',
    'organisation.read-locations:my-jurisdiction',
    'user.read:only-my-audit',
    'organisation.read-locations:my-office',
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

  const v2Scopes = migrateLegacyScopesToV2(v1Scopes)
  expect(v2Scopes).toHaveLength(24)

  expect(v2Scopes).toEqual([
    'type=performance.read',
    'type=performance.read-dashboards',
    'type=user.read&accessLevel=location',
    'type=user.read&accessLevel=administrativeArea',
    'type=user.edit&accessLevel=administrativeArea',
    'type=organisation.read-locations&accessLevel=administrativeArea',
    'type=user.read-only-my-audit',
    'type=organisation.read-locations&accessLevel=location',
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

describe('migrateLegacyScopesArrayToV2Scopes() — AND-pair merge', () => {
  // Regression: issue #12489. v1.9 expressed "in my jurisdiction AND only
  // these roles" as two scope strings on the same role. v2.0 scope arrays
  // use OR semantics, so the pair must collapse to a single v2 scope object
  // to avoid privilege escalation.

  it('merges user.create + my-jurisdiction + role list into one scope', () => {
    const result = migrateLegacyScopesArrayToV2Scopes([
      'user.create:my-jurisdiction',
      'user.create[role=FIELD_AGENT|HOSPITAL_CLERK]'
    ])

    expect(result).toEqual([
      {
        type: 'user.create',
        options: {
          accessLevel: 'administrativeArea',
          role: ['FIELD_AGENT', 'HOSPITAL_CLERK']
        }
      }
    ])
  })

  it('merges user.create:all + role list into a role-only scope', () => {
    // `user.create:all` decodes to `{ type: 'user.create' }` with no options.
    // Merging with `[role=X|Y]` should yield only the role restriction.
    const result = migrateLegacyScopesArrayToV2Scopes([
      'user.create:all',
      'user.create[role=FIELD_AGENT|REGISTRATION_AGENT]'
    ])

    expect(result).toEqual([
      {
        type: 'user.create',
        options: { role: ['FIELD_AGENT', 'REGISTRATION_AGENT'] }
      }
    ])
  })

  it('merges v1 user.update:my-jurisdiction with v1 user.edit[role=...]', () => {
    // `user.update:*` maps to v2 `user.edit`. Grouping must happen by
    // post-conversion v2 type, not the v1 string.
    const result = migrateLegacyScopesArrayToV2Scopes([
      'user.update:my-jurisdiction',
      'user.edit[role=FIELD_AGENT|LOCAL_REGISTRAR]'
    ])

    expect(result).toEqual([
      {
        type: 'user.edit',
        options: {
          accessLevel: 'administrativeArea',
          role: ['FIELD_AGENT', 'LOCAL_REGISTRAR']
        }
      }
    ])
  })

  it('throws when two scopes of the same type both define role', () => {
    // The realistic v1.9 conflict shape: two distinct `[role=...]` strings
    // for the same v2 type. We refuse to silently choose union (re-introduces
    // the privilege-escalation bug) or intersection (silently restrictive),
    // and let the operator resolve manually.
    expect(() =>
      migrateLegacyScopesArrayToV2Scopes([
        'user.create[role=A|B]',
        'user.create[role=C|D]'
      ])
    ).toThrow(
      /Cannot auto-merge two 'user.create' scopes that both define 'role'/
    )
  })

  it('dedups identical entries before deciding whether to merge', () => {
    // Same logical scope listed twice — no merge needed, dedup to one.
    const result = migrateLegacyScopesArrayToV2Scopes([
      'user.create:my-jurisdiction',
      'user.create:my-jurisdiction'
    ])

    expect(result).toEqual([
      {
        type: 'user.create',
        options: { accessLevel: 'administrativeArea' }
      }
    ])
  })

  it('does not merge non-mergeable types appearing more than once', () => {
    // record.declare has no AND-paired v1.9 pattern. Two distinct
    // record.declare scopes should pass through unchanged.
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const result = migrateLegacyScopesArrayToV2Scopes([
        'record.declare[event=birth]',
        'record.declare[event=death]'
      ])

      expect(result).toHaveLength(2)
      expect(result).toEqual([
        { type: 'record.declare', options: { event: ['birth'] } },
        { type: 'record.declare', options: { event: ['death'] } }
      ])
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          "Multiple non-mergeable 'record.declare' scopes detected"
        )
      )
    } finally {
      warn.mockRestore()
    }
  })

  it('is order-independent: scope strings can appear in either order', () => {
    const a = migrateLegacyScopesArrayToV2Scopes([
      'user.create:my-jurisdiction',
      'user.create[role=FIELD_AGENT]'
    ])
    const b = migrateLegacyScopesArrayToV2Scopes([
      'user.create[role=FIELD_AGENT]',
      'user.create:my-jurisdiction'
    ])

    expect(a).toEqual(b)
  })

  it('preserves unrelated scopes alongside merged pairs', () => {
    // Mixed input: a user.create pair to merge, plus unrelated scopes.
    const result = migrateLegacyScopesArrayToV2Scopes([
      'performance.read',
      'user.create:my-jurisdiction',
      'record.declare[event=birth]',
      'user.create[role=FIELD_AGENT]'
    ])

    // 4 inputs → 3 outputs (one merge happened).
    expect(result).toHaveLength(3)
    expect(result).toContainEqual({ type: 'performance.read' })
    expect(result).toContainEqual({
      type: 'record.declare',
      options: { event: ['birth'] }
    })
    expect(result).toContainEqual({
      type: 'user.create',
      options: {
        accessLevel: 'administrativeArea',
        role: ['FIELD_AGENT']
      }
    })
  })
})
