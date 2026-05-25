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
  EventIndexWithAdministrativeHierarchy,
  getLocationHierarchy,
  Location
} from './locations'
import { RecordScopeV2 } from 'src/scopes'
import { UUID } from 'src/uuid'

describe('canAccessEventWithScope()', () => {
  const rng = createPrng(83429)

  // Arbitrary UUIDs. The actual values don't matter as long as they are consistent across the test.
  const provinceUuid = generateUuid(rng)
  const districtUuid = generateUuid(rng)
  const officeUuid = generateUuid(rng)
  const createdById = generateUuid(rng)

  const declaredEvent: Partial<EventIndexWithAdministrativeHierarchy> = {
    type: 'birth',
    placeOfEvent: [provinceUuid, districtUuid, officeUuid],
    legalStatuses: {
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
})

const province: AdministrativeArea = {
  id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa' as UUID,
  name: 'Province',
  externalId: null,
  parentId: null,
  validUntil: null
}

const district: AdministrativeArea = {
  id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb' as UUID,
  name: 'District',
  externalId: null,
  parentId: province.id,
  validUntil: null
}

const office: Location = {
  id: 'cccccccc-cccc-4ccc-cccc-cccccccccccc' as UUID,
  name: 'District Office',
  externalId: null,
  administrativeAreaId: district.id,
  validUntil: null,
  locationType: 'CRVS_OFFICE'
}

const officeWithoutArea: Location = {
  id: 'dddddddd-dddd-4ddd-dddd-dddddddddddd' as UUID,
  name: 'Standalone Office',
  externalId: null,
  administrativeAreaId: null,
  validUntil: null,
  locationType: 'CRVS_OFFICE'
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
