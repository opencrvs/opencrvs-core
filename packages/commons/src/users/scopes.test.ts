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
  Scope,
  ScopesWithDeclaredOptions,
  ScopesWithFullOptions,
  ScopesWithPlaceEventOptions
} from './scopes'

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
      'declaredBy'
    )

    expect(result).toEqual(undefined)
  })

  it('should return "all" for registeredIn when not set', () => {
    const result = getScopeOptionValue(
      { type: 'record.search', options: {} },
      'registeredIn'
    )

    expect(result).toEqual(JurisdictionFilter.enum.all)
  })

  it('should return "all" for declaredIn when not set', () => {
    const result = getScopeOptionValue(
      { type: 'record.edit', options: {} },
      'declaredIn'
    )

    expect(result).toEqual(JurisdictionFilter.enum.all)
  })

  it('should return set value for registeredIn over default', () => {
    const result = getScopeOptionValue(
      {
        type: 'record.search',
        options: { registeredIn: JurisdictionFilter.enum.administrativeArea }
      },
      'registeredIn'
    )

    expect(result).toEqual(JurisdictionFilter.enum.administrativeArea)
  })

  it('should return set value for declaredIn over default', () => {
    const result = getScopeOptionValue(
      {
        type: 'record.edit',
        options: { declaredIn: JurisdictionFilter.enum.location }
      },
      'declaredIn'
    )

    expect(result).toEqual(JurisdictionFilter.enum.location)
  })
  it('should return undefined for createdBy when not set', () => {
    const result = getScopeOptionValue(
      { type: 'record.create', options: {} },
      'createdBy'
    )

    expect(result).toBeUndefined()
  })

  it('should return set value for createdBy', () => {
    const result = getScopeOptionValue(
      {
        type: 'record.create',
        options: { createdBy: 'user' as const }
      },
      'createdBy'
    )

    expect(result).toEqual('user')
  })

  it('should return "all" for notifiedIn when not set', () => {
    const result = getScopeOptionValue(
      { type: 'record.edit', options: {} },
      'notifiedIn'
    )

    expect(result).toEqual(JurisdictionFilter.enum.all)
  })

  it('should return undefined for notifiedBy when not set', () => {
    const result = getScopeOptionValue(
      { type: 'record.edit', options: {} },
      'notifiedBy'
    )

    expect(result).toBeUndefined()
  })

  it('should return set value for notifiedIn over default', () => {
    const result = getScopeOptionValue(
      {
        type: 'record.edit',
        options: { notifiedIn: JurisdictionFilter.enum.location }
      },
      'notifiedIn'
    )

    expect(result).toEqual(JurisdictionFilter.enum.location)
  })

  it('should return set value for notifiedBy', () => {
    const result = getScopeOptionValue(
      {
        type: 'record.search',
        options: { notifiedBy: 'user' as const }
      },
      'notifiedBy'
    )

    expect(result).toEqual('user')
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
          notifiedBy: 'user' as const,
          notifiedIn: 'administrativeArea' as const,
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
          notifiedBy: 'user' as const,
          notifiedIn: 'administrativeArea' as const,
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
          notifiedIn: 'administrativeArea',
          notifiedBy: 'user',
          declaredIn: 'administrativeArea',
          declaredBy: 'user'
        }
      },
      {
        type: 'record.reject',
        options: {
          event: ['birth', 'death'],
          placeOfEvent: 'location',
          notifiedIn: 'administrativeArea',
          notifiedBy: 'user',
          declaredIn: 'administrativeArea',
          declaredBy: 'user'
        }
      },
      {
        type: 'record.archive',
        options: {
          event: ['birth', 'death'],
          placeOfEvent: 'location',
          notifiedIn: 'administrativeArea',
          notifiedBy: 'user',
          declaredIn: 'administrativeArea',
          declaredBy: 'user'
        }
      },
      {
        type: 'record.unarchive',
        options: {
          event: ['birth', 'death'],
          placeOfEvent: 'location',
          notifiedIn: 'administrativeArea',
          notifiedBy: 'user',
          declaredIn: 'administrativeArea',
          declaredBy: 'user'
        }
      },
      {
        type: 'record.register',
        options: {
          event: ['birth', 'death'],
          placeOfEvent: 'location',
          notifiedIn: 'administrativeArea',
          notifiedBy: 'user',
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
          notifiedBy: 'user' as const,
          notifiedIn: 'administrativeArea' as const,
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
          notifiedIn: 'administrativeArea',
          notifiedBy: 'user',
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
          notifiedIn: 'administrativeArea',
          notifiedBy: 'user',
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
          notifiedIn: 'administrativeArea',
          notifiedBy: 'user',
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
          notifiedIn: 'administrativeArea',
          notifiedBy: 'user',
          declaredIn: 'administrativeArea',
          declaredBy: 'user',
          registeredIn: 'administrativeArea',
          registeredBy: 'user'
        }
      },
      {
        type: 'record.revoke-registration',
        options: {
          event: ['birth', 'death'],
          placeOfEvent: 'location',
          notifiedIn: 'administrativeArea',
          notifiedBy: 'user',
          declaredIn: 'administrativeArea',
          declaredBy: 'user',
          registeredIn: 'administrativeArea',
          registeredBy: 'user'
        }
      },
      {
        type: 'record.reinstate-registration',
        options: {
          event: ['birth', 'death'],
          placeOfEvent: 'location',
          notifiedIn: 'administrativeArea',
          notifiedBy: 'user',
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
          notifiedIn: 'administrativeArea',
          notifiedBy: 'user',
          declaredIn: 'administrativeArea',
          declaredBy: 'user',
          registeredIn: 'administrativeArea',
          registeredBy: 'user'
        }
      },
      {
        type: 'record.review-duplicates',
        options: {
          event: ['birth', 'death'],
          placeOfEvent: 'location',
          notifiedIn: 'administrativeArea',
          notifiedBy: 'user',
          declaredIn: 'administrativeArea',
          declaredBy: 'user',
          registeredIn: 'administrativeArea',
          registeredBy: 'user'
        }
      }
    ])
  })

  it('Keeps the createdBy option for every record scope category', () => {
    // createdBy is a base option (scopeOptionsPlaceEvent), so unlike declaredBy
    // /notifiedBy it must be retained for placeEvent scope types too, not just
    // the declared/full ones.
    const oneScopePerCategory = [
      ScopesWithPlaceEventOptions.options[0], // record.create
      ScopesWithDeclaredOptions.options[0], // record.edit
      ScopesWithFullOptions.options[0] // record.search
    ]

    const encoded = oneScopePerCategory.map((type) =>
      encodeScope({
        type,
        options: { event: ['birth'], createdBy: 'user' as const }
      })
    )

    expect(encoded.map(decodeScope)).toEqual([
      {
        type: 'record.create',
        options: { event: ['birth'], createdBy: 'user' }
      },
      {
        type: 'record.edit',
        options: { event: ['birth'], createdBy: 'user' }
      },
      {
        type: 'record.search',
        options: { event: ['birth'], createdBy: 'user' }
      }
    ])
  })

  it('Keeps the createdIn option for every record scope category', () => {
    const oneScopePerCategory = [
      ScopesWithPlaceEventOptions.options[0], // record.create
      ScopesWithDeclaredOptions.options[0], // record.edit
      ScopesWithFullOptions.options[0] // record.search
    ]

    const encoded = oneScopePerCategory.map((type) =>
      encodeScope({
        type,
        options: { event: ['birth'], createdIn: 'location' as const }
      })
    )

    expect(encoded.map(decodeScope)).toEqual([
      {
        type: 'record.create',
        options: { event: ['birth'], createdIn: 'location' }
      },
      {
        type: 'record.edit',
        options: { event: ['birth'], createdIn: 'location' }
      },
      {
        type: 'record.search',
        options: { event: ['birth'], createdIn: 'location' }
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

  it('Supports status option for record.edit', () => {
    const scopeWithStatus = encodeScope({
      type: 'record.edit',
      options: {
        event: ['birth'],
        status: ['DECLARED']
      }
    })

    expect(decodeScope(scopeWithStatus)).toEqual({
      type: 'record.edit',
      options: {
        event: ['birth'],
        status: ['DECLARED']
      }
    })
  })

  it('Encodes and decodes the plain location.edit scope', () => {
    const encoded = encodeScope({ type: 'location.edit' })

    expect(encoded).toBe('type=location.edit')
    expect(decodeScope(encoded)).toEqual({ type: 'location.edit' })
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

describe('action confirmation scopes', () => {
  test('parses with or without the usual record-scope options', () => {
    expect(Scope.safeParse({ type: 'record.action.accept' }).success).toBe(true)
    expect(
      Scope.safeParse({
        type: 'record.action.reject',
        options: { event: ['birth'] }
      }).success
    ).toBe(true)
  })

  test('survives the encode/decode round trip used in tokens', () => {
    const encoded = encodeScope({
      type: 'record.action.accept',
      options: { event: ['birth'] }
    })

    expect(encoded).toBe('type=record.action.accept&event[]=birth')
    expect(decodeScope(encoded)).toEqual({
      type: 'record.action.accept',
      options: { event: ['birth'] }
    })
  })
})
