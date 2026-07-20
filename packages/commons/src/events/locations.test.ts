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

import { createPrng, generateUuid, TestUserRole } from './test.utils'
import { SystemContext, UserContext } from '../users/User'
import {
  AdministrativeArea,
  canAccessEventWithScope,
  canAccessOtherUserWithScopes,
  EventIndexWithAdministrativeHierarchy,
  getLocationHierarchy,
  Location,
  LocationVersion,
  resolvePath,
  resolveVersion,
  toClientAdministrativeArea,
  toClientLocation,
  UserWithResolvedHierarchy
} from './locations'
import { RecordScopeV2, UserScopeV2 } from 'src/scopes'
import { UUID } from 'src/uuid'

describe('canAccessEventWithScope()', () => {
  const rng = createPrng(83429)

  // Arbitrary UUIDs. The actual values don't matter as long as they are consistent across the test.
  const provinceUuid = generateUuid(rng)
  const districtUuid = generateUuid(rng)
  const officeUuid = generateUuid(rng)
  const createdById = generateUuid(rng)

  const notifiedEvent: Partial<EventIndexWithAdministrativeHierarchy> = {
    type: 'birth',
    placeOfEvent: [provinceUuid, districtUuid, officeUuid],
    legalStatuses: {
      NOTIFIED: {
        acceptedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: createdById,
        createdAtLocation: [provinceUuid, districtUuid, officeUuid]
      },
      DECLARED: undefined,
      REGISTERED: undefined
    }
  }

  const declaredEvent: Partial<EventIndexWithAdministrativeHierarchy> = {
    type: 'birth',
    placeOfEvent: [provinceUuid, districtUuid, officeUuid],
    legalStatuses: {
      NOTIFIED: undefined,
      DECLARED: {
        acceptedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: createdById,
        createdAtLocation: [provinceUuid, districtUuid, officeUuid]
      },
      REGISTERED: undefined
    }
  }

  const registeredEvent: Partial<EventIndexWithAdministrativeHierarchy> = {
    ...declaredEvent,
    legalStatuses: {
      NOTIFIED: undefined,
      DECLARED: {
        acceptedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: createdById,
        createdAtLocation: [provinceUuid, districtUuid, officeUuid]
      },
      REGISTERED: {
        acceptedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        registrationNumber: '12345',
        createdBy: createdById,
        createdAtLocation: [provinceUuid, districtUuid, officeUuid]
      }
    }
  }

  const systemContext = {
    type: 'system',
    id: createdById
  } satisfies SystemContext

  const userContext = {
    type: 'user',
    id: createdById,
    primaryOfficeId: officeUuid,
    administrativeAreaId: districtUuid,
    role: TestUserRole.enum.FIELD_AGENT
  } satisfies UserContext

  const locationOptions = [
    { placeOfEvent: 'location' },
    { declaredIn: 'location' },
    { registeredIn: 'location' }
  ] satisfies RecordScopeV2['options'][]

  const userOptions = [
    { declaredBy: 'user' },
    { registeredBy: 'user' }
  ] satisfies RecordScopeV2['options'][]

  const registeredOnlyOptions = [
    { registeredIn: 'location' },
    { registeredBy: 'user' }
  ] satisfies RecordScopeV2['options'][]

  const notifiedOnlyOptions = [
    { notifiedIn: 'location' },
    { notifiedBy: 'user' }
  ] satisfies RecordScopeV2['options'][]

  const eventOptions = [
    { event: ['birth'] },
    { event: undefined },
    { event: ['birth', 'death'] }
  ] satisfies RecordScopeV2['options'][]

  describe('System user', () => {
    /**
     * System users are not bound to any location, so giving them a scope that requires access to a specific location should not grant them access.
     */
    test.each(locationOptions)(
      'should not access event with location-based scope %j',
      (options) => {
        expect(
          canAccessEventWithScope(
            registeredEvent,
            { type: 'record.print-certified-copies', options },
            systemContext
          )
        ).toBe(false)
      }
    )

    test.each(userOptions)(
      /**
       * From business rules perspective system users can only perform create and notify actions. On the unit test level, we want to illustrate that 'canAccessEventWithScope' is agnostic of the action type, and matches the context with scope options.
       */
      'should access a event with user-based scope %j',
      (options) => {
        expect(
          canAccessEventWithScope(
            registeredEvent,
            { type: 'record.print-certified-copies', options },
            systemContext
          )
        ).toBe(true)
      }
    )

    test.each(registeredOnlyOptions)(
      'should not access an unregistered event with registered scope %j',
      (options) => {
        expect(
          canAccessEventWithScope(
            declaredEvent,
            { type: 'record.print-certified-copies', options },
            systemContext
          )
        ).toBe(false)
      }
    )

    test('should access notified event with notifiedBy:user scope', () => {
      expect(
        canAccessEventWithScope(
          notifiedEvent,
          { type: 'record.edit', options: { notifiedBy: 'user' } },
          systemContext
        )
      ).toBe(true)
    })

    test.each(notifiedOnlyOptions)(
      'should not access an unnotified event with notified scope %j',
      (options) => {
        expect(
          canAccessEventWithScope(
            declaredEvent,
            { type: 'record.edit', options },
            systemContext
          )
        ).toBe(false)
      }
    )

    test.each(eventOptions)(
      'should access event with event type-based scope %j',
      (options) => {
        expect(
          canAccessEventWithScope(
            registeredEvent,
            { type: 'record.print-certified-copies', options },
            systemContext
          )
        ).toBe(true)
      }
    )
  })

  describe('Human user', () => {
    test.each(locationOptions)(
      'should access event with correct location scope %j',
      (options) => {
        expect(
          canAccessEventWithScope(
            registeredEvent,
            { type: 'record.print-certified-copies', options },
            userContext
          )
        ).toBe(true)
      }
    )

    test.each(userOptions)(
      'should access event with user-based scope %j',
      (options) => {
        expect(
          canAccessEventWithScope(
            registeredEvent,
            { type: 'record.print-certified-copies', options },
            userContext
          )
        ).toBe(true)
      }
    )

    test.each(registeredOnlyOptions)(
      'should not access an unregistered event with registered scope %j',
      (options) => {
        expect(
          canAccessEventWithScope(
            declaredEvent,
            { type: 'record.print-certified-copies', options },
            userContext
          )
        ).toBe(false)
      }
    )

    test.each(notifiedOnlyOptions)(
      'should access notified event with notified scope %j',
      (options) => {
        expect(
          canAccessEventWithScope(
            notifiedEvent,
            { type: 'record.edit', options },
            userContext
          )
        ).toBe(true)
      }
    )

    test.each(notifiedOnlyOptions)(
      'should not access an unnotified event with notified scope %j',
      (options) => {
        expect(
          canAccessEventWithScope(
            declaredEvent,
            { type: 'record.edit', options },
            userContext
          )
        ).toBe(false)
      }
    )

    test.each(eventOptions)(
      'should access event with event type-based scope %j',
      (options) => {
        expect(
          canAccessEventWithScope(
            registeredEvent,
            { type: 'record.print-certified-copies', options },
            userContext
          )
        ).toBe(true)
      }
    )
  })

  test('should not access event if user does not meet any of the scope options', () => {
    // Negative test cases to ensure we don't accidentally remove checks.
    const userFromAnotherOfficeContext = {
      type: 'user',
      id: generateUuid(), // Different user
      primaryOfficeId: generateUuid(rng), // Different office
      administrativeAreaId: generateUuid(rng), // Different administrative area
      role: TestUserRole.enum.FIELD_AGENT
    } satisfies UserContext

    const singleOptions = [
      { placeOfEvent: 'location' },
      { placeOfEvent: 'administrativeArea' },
      { notifiedIn: 'location' },
      { notifiedIn: 'administrativeArea' },
      { notifiedBy: 'user' },
      { declaredIn: 'location' },
      { declaredIn: 'administrativeArea' },
      { registeredIn: 'location' },
      { registeredIn: 'administrativeArea' },
      { declaredBy: 'user' },
      { registeredBy: 'user' }
    ] satisfies RecordScopeV2['options'][]

    singleOptions.forEach((options) => {
      expect(
        canAccessEventWithScope(
          registeredEvent,
          {
            type: 'record.print-certified-copies',
            options
          },
          userFromAnotherOfficeContext
        )
      ).toBe(false)
    })
  })

  describe('User without an administrative area', () => {
    // The event is in a different administrative area than the user's office,
    // so access can only be granted by the "no administrative area" branch.
    const eventInAnotherArea: Partial<EventIndexWithAdministrativeHierarchy> = {
      ...registeredEvent,
      placeOfEvent: [generateUuid(rng)],
      legalStatuses: {
        NOTIFIED: {
          acceptedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          createdBy: generateUuid(rng),
          createdAtLocation: [generateUuid(rng)]
        },
        DECLARED: {
          acceptedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          createdBy: generateUuid(rng),
          createdAtLocation: [generateUuid(rng)]
        },
        REGISTERED: {
          acceptedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          registrationNumber: '12345',
          createdBy: generateUuid(rng),
          createdAtLocation: [generateUuid(rng)]
        }
      }
    }

    const adminAreaOptions = [
      { placeOfEvent: 'administrativeArea' },
      { notifiedIn: 'administrativeArea' },
      { declaredIn: 'administrativeArea' },
      { registeredIn: 'administrativeArea' }
    ] satisfies RecordScopeV2['options'][]

    const userWithNullArea = {
      type: 'user',
      id: createdById,
      primaryOfficeId: officeUuid,
      administrativeAreaId: null,
      role: TestUserRole.enum.FIELD_AGENT
    } satisfies UserContext

    const userWithUndefinedArea = {
      type: 'user',
      id: createdById,
      primaryOfficeId: officeUuid,
      administrativeAreaId: undefined,
      role: TestUserRole.enum.FIELD_AGENT
    } satisfies UserContext

    test.each(adminAreaOptions)(
      'grants access when administrativeAreaId is null with scope %j',
      (options) => {
        expect(
          canAccessEventWithScope(
            eventInAnotherArea,
            { type: 'record.print-certified-copies', options },
            userWithNullArea
          )
        ).toBe(true)
      }
    )

    test.each(adminAreaOptions)(
      'grants access when administrativeAreaId is undefined with scope %j',
      (options) => {
        expect(
          canAccessEventWithScope(
            eventInAnotherArea,
            { type: 'record.print-certified-copies', options },
            userWithUndefinedArea
          )
        ).toBe(true)
      }
    )
  })
})

describe('canAccessOtherUserWithScopes()', () => {
  const rng = createPrng(11111)
  const adminAreaUuid = generateUuid(rng)
  const officeUuid = generateUuid(rng)
  const otherOfficeUuid = generateUuid(rng)

  // The user being viewed lives in a different administrative area
  const targetUser: UserWithResolvedHierarchy = {
    role: TestUserRole.enum.FIELD_AGENT,
    administrativeHierarchy: [adminAreaUuid, otherOfficeUuid],
    primaryOfficeId: otherOfficeUuid
  }

  const scopeWithAdminAreaAccess: UserScopeV2 = {
    type: 'user.read',
    options: { accessLevel: 'administrativeArea' }
  }

  it('grants access when calling user has administrativeAreaId: null (root jurisdiction)', () => {
    const callingUser: UserContext = {
      type: 'user',
      id: generateUuid(rng),
      primaryOfficeId: officeUuid,
      administrativeAreaId: null,
      role: TestUserRole.enum.LOCAL_SYSTEM_ADMIN
    }

    expect(
      canAccessOtherUserWithScopes({
        scopes: [scopeWithAdminAreaAccess],
        userToAccess: targetUser,
        user: callingUser
      })
    ).toBe(true)
  })

  it('grants access when calling user has administrativeAreaId: undefined (root jurisdiction)', () => {
    const callingUser: UserContext = {
      type: 'user',
      id: generateUuid(rng),
      primaryOfficeId: officeUuid,
      administrativeAreaId: undefined,
      role: TestUserRole.enum.LOCAL_SYSTEM_ADMIN
    }

    expect(
      canAccessOtherUserWithScopes({
        scopes: [scopeWithAdminAreaAccess],
        userToAccess: targetUser,
        user: callingUser
      })
    ).toBe(true)
  })

  it('denies access when calling user has an administrativeAreaId not in the target hierarchy', () => {
    const unrelatedAreaId = generateUuid(rng)
    const callingUser: UserContext = {
      type: 'user',
      id: generateUuid(rng),
      primaryOfficeId: officeUuid,
      administrativeAreaId: unrelatedAreaId,
      role: TestUserRole.enum.LOCAL_SYSTEM_ADMIN
    }

    expect(
      canAccessOtherUserWithScopes({
        scopes: [scopeWithAdminAreaAccess],
        userToAccess: targetUser,
        user: callingUser
      })
    ).toBe(false)
  })
})

function mockVersionFields(id: UUID, name: string) {
  return {
    status: 'active' as const,
    versions: [
      {
        versionId: id,
        effectiveFrom: '0001-01-01',
        name,
        externalId: null,
        status: 'active' as const
      }
    ]
  }
}

const province: AdministrativeArea = {
  id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa' as UUID,
  name: 'Province',
  externalId: null,
  parentId: null,
  ...mockVersionFields(
    'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa' as UUID,
    'Province'
  )
}

const district: AdministrativeArea = {
  id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb' as UUID,
  name: 'District',
  externalId: null,
  parentId: province.id,
  ...mockVersionFields(
    'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb' as UUID,
    'District'
  )
}

const office: Location = {
  id: 'cccccccc-cccc-4ccc-cccc-cccccccccccc' as UUID,
  name: 'District Office',
  externalId: null,
  administrativeAreaId: district.id,
  locationType: 'CRVS_OFFICE',
  ...mockVersionFields(
    'cccccccc-cccc-4ccc-cccc-cccccccccccc' as UUID,
    'District Office'
  )
}

const officeWithoutArea: Location = {
  id: 'dddddddd-dddd-4ddd-dddd-dddddddddddd' as UUID,
  name: 'Standalone Office',
  externalId: null,
  administrativeAreaId: null,
  locationType: 'CRVS_OFFICE',
  ...mockVersionFields(
    'dddddddd-dddd-4ddd-dddd-dddddddddddd' as UUID,
    'Standalone Office'
  )
}

function buildMaps() {
  const administrativeAreas = new Map<UUID, AdministrativeArea>([
    [province.id, province],
    [district.id, district]
  ])
  const locations = new Map<UUID, Location>([
    [office.id, office],
    [officeWithoutArea.id, officeWithoutArea]
  ])
  return { administrativeAreas, locations }
}

function version(
  effectiveFrom: string,
  name: string,
  status: 'active' | 'inactive' = 'active'
): LocationVersion {
  return {
    versionId: generateUuid(),
    effectiveFrom,
    name,
    externalId: null,
    status
  }
}

describe('resolveVersion', () => {
  const versions = [
    version('0001-01-01', 'Alaminos'),
    version('2005-03-28', 'Alaminos City'),
    version('2020-01-01', 'Alaminos City', 'inactive')
  ]

  it('returns the version with the greatest effectiveFrom ≤ anchor', () => {
    expect(resolveVersion(versions, '2010-06-15').name).toBe('Alaminos City')
    expect(resolveVersion(versions, '2010-06-15').status).toBe('active')
  })

  it('treats an anchor equal to effectiveFrom as within that version', () => {
    expect(resolveVersion(versions, '2005-03-28').name).toBe('Alaminos City')
  })

  it('returns the last version for anchors after all versions', () => {
    expect(resolveVersion(versions, '2030-01-01').status).toBe('inactive')
  })

  it('returns the earliest version when the anchor precedes all versions', () => {
    const late = [
      version('1990-01-01', 'Founded Town'),
      version('2000-01-01', 'Renamed Town')
    ]
    expect(resolveVersion(late, '1980-01-01').name).toBe('Founded Town')
  })

  it('resolves a single sentinel-dated version at any anchor', () => {
    const single = [version('0001-01-01', 'Only Name')]
    expect(resolveVersion(single, '1970-01-01').name).toBe('Only Name')
    expect(resolveVersion(single, '2099-12-31').name).toBe('Only Name')
  })
})

describe('resolvePath', () => {
  const rng = createPrng(4242)

  const versionedProvince: AdministrativeArea = {
    id: generateUuid(rng),
    name: 'Greater Pangasinan',
    externalId: null,
    parentId: null,
    status: 'active',
    versions: [
      version('0001-01-01', 'Pangasinan'),
      version('2010-01-01', 'Greater Pangasinan')
    ]
  }

  const versionedDistrict: AdministrativeArea = {
    id: generateUuid(rng),
    name: 'Alaminos City',
    externalId: null,
    parentId: versionedProvince.id,
    status: 'inactive',
    versions: [
      version('0001-01-01', 'Alaminos'),
      version('2005-03-28', 'Alaminos City'),
      version('2020-01-01', 'Alaminos City', 'inactive')
    ]
  }

  const versionedOffice: Location = {
    id: generateUuid(rng),
    name: 'Alaminos City Registry Office',
    externalId: null,
    administrativeAreaId: versionedDistrict.id,
    locationType: 'CRVS_OFFICE',
    status: 'active',
    versions: [
      version('0001-01-01', 'Alaminos Registry'),
      version('2008-06-01', 'Alaminos City Registry Office')
    ]
  }

  const standaloneOffice: Location = {
    id: generateUuid(rng),
    name: 'Standalone Office',
    externalId: null,
    administrativeAreaId: null,
    locationType: 'CRVS_OFFICE',
    status: 'active',
    versions: [version('0001-01-01', 'Standalone Office')]
  }

  const context = {
    administrativeAreas: new Map([
      [versionedProvince.id, versionedProvince],
      [versionedDistrict.id, versionedDistrict]
    ]),
    locations: new Map([
      [versionedOffice.id, versionedOffice],
      [standaloneOffice.id, standaloneOffice]
    ])
  }

  it('resolves the whole path, leaf included, at an anchor before any change', () => {
    expect(resolvePath(versionedOffice.id, '1995-05-20', context)).toEqual([
      { id: versionedProvince.id, name: 'Pangasinan', status: 'active' },
      { id: versionedDistrict.id, name: 'Alaminos', status: 'active' },
      { id: versionedOffice.id, name: 'Alaminos Registry', status: 'active' }
    ])
  })

  it('resolves the whole path at an anchor after all changes', () => {
    expect(resolvePath(versionedOffice.id, '2021-06-01', context)).toEqual([
      {
        id: versionedProvince.id,
        name: 'Greater Pangasinan',
        status: 'active'
      },
      { id: versionedDistrict.id, name: 'Alaminos City', status: 'inactive' },
      {
        id: versionedOffice.id,
        name: 'Alaminos City Registry Office',
        status: 'active'
      }
    ])
  })

  it('resolves each ancestor independently at a mid-history anchor', () => {
    expect(
      resolvePath(versionedOffice.id, '2006-01-01', context).map((n) => n.name)
    ).toEqual(['Pangasinan', 'Alaminos City', 'Alaminos Registry'])
  })

  it('keeps an inactivated node resolvable with its status exposed', () => {
    const district = resolvePath(versionedDistrict.id, '2021-01-01', context)
    expect(district).toEqual([
      {
        id: versionedProvince.id,
        name: 'Greater Pangasinan',
        status: 'active'
      },
      { id: versionedDistrict.id, name: 'Alaminos City', status: 'inactive' }
    ])
  })

  it('returns an areas-only path for an administrative area id', () => {
    expect(
      resolvePath(versionedDistrict.id, '1999-01-01', context).map((n) => n.id)
    ).toEqual([versionedProvince.id, versionedDistrict.id])
  })

  it('returns only the leaf for a location without an administrative area', () => {
    expect(resolvePath(standaloneOffice.id, '2020-01-01', context)).toEqual([
      { id: standaloneOffice.id, name: 'Standalone Office', status: 'active' }
    ])
  })

  it('returns an empty path for an unknown id', () => {
    expect(resolvePath(generateUuid(rng), '2020-01-01', context)).toEqual([])
  })

  it('accepts stripped client maps', () => {
    const clientContext = {
      administrativeAreas: new Map(
        [versionedProvince, versionedDistrict].map((a) => [
          a.id,
          toClientAdministrativeArea(a)
        ])
      ),
      locations: new Map(
        [versionedOffice, standaloneOffice].map((l) => [
          l.id,
          toClientLocation(l)
        ])
      )
    }
    expect(
      resolvePath(versionedOffice.id, '1995-05-20', clientContext).map(
        (n) => n.name
      )
    ).toEqual(['Pangasinan', 'Alaminos', 'Alaminos Registry'])
  })
})

describe('toClientLocation / toClientAdministrativeArea', () => {
  it('strips the server-flattened fields from a location', () => {
    const stripped = toClientLocation(office)
    expect(stripped).toEqual({
      id: office.id,
      administrativeAreaId: office.administrativeAreaId,
      locationType: office.locationType,
      versions: office.versions
    })
  })

  it('strips the server-flattened fields from an administrative area', () => {
    const stripped = toClientAdministrativeArea(district)
    expect(stripped).toEqual({
      id: district.id,
      parentId: district.parentId,
      versions: district.versions
    })
  })
})

describe('getLocationHierarchy', () => {
  it('returns root-first hierarchy for a location with an administrative area', () => {
    const result = getLocationHierarchy(office.id, buildMaps())
    expect(result).toEqual([province.id, district.id, office.id])
  })

  it('returns only the location id when it has no administrative area', () => {
    const result = getLocationHierarchy(officeWithoutArea.id, buildMaps())
    expect(result).toEqual([officeWithoutArea.id])
  })

  it('returns root-first hierarchy for an administrative area id', () => {
    const result = getLocationHierarchy(district.id, buildMaps())
    expect(result).toEqual([province.id, district.id])
  })

  it('returns single-element array for a root administrative area', () => {
    const result = getLocationHierarchy(province.id, buildMaps())
    expect(result).toEqual([province.id])
  })
})
