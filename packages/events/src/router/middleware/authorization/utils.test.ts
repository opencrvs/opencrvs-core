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
  createPrng,
  generateUuid,
  RecordScopeV2,
  TestUserRole
} from '@opencrvs/commons'
import { EventIndexWithAdministrativeHierarchy } from '@events/service/indexing/utils'
import { SystemContext, UserContext } from '@events/context'
import { canAccessEventWithScope } from './utils'

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
    const userFromAnotherOfficeContext = {
      type: 'user',
      id: createdById,
      primaryOfficeId: generateUuid(rng), // Different office
      administrativeAreaId: generateUuid(rng), // Different administrative area
      role: TestUserRole.enum.FIELD_AGENT
    } satisfies UserContext

    expect(
      canAccessEventWithScope(
        registeredEvent,
        {
          type: 'record.print-certified-copies',
          options: { registeredIn: 'location' }
        },
        userFromAnotherOfficeContext
      )
    ).toBe(false)

    expect(
      canAccessEventWithScope(
        registeredEvent,
        {
          type: 'record.print-certified-copies',
          options: { registeredIn: 'administrativeArea' }
        },
        userFromAnotherOfficeContext
      )
    ).toBe(false)
  })
})
