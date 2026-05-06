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
  getAvailableRolesForUserUpdatePayload,
  isActionInScope
} from './scopes'
import { encodeScope, UserScopeV2 } from '../scopes'
import { ActionType } from './ActionType'
import {
  EventIndexWithAdministrativeHierarchy,
  getLocationHierarchy
} from './locations'
import { UserContext } from '../users/User'
import { createPrng, generateUuid, TestUserRole } from './test.utils'
import {
  V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS_MAP,
  V2_DEFAULT_MOCK_LOCATIONS,
  V2_DEFAULT_MOCK_LOCATIONS_MAP
} from './mocks.test.utils'
import { getUUID, UUID } from '../uuid'

const rng = createPrng(1)
const officeUuid = generateUuid(rng)

const testUser: UserContext = {
  type: 'user',
  id: generateUuid(rng),
  primaryOfficeId: officeUuid,
  administrativeAreaId: null,
  role: TestUserRole.enum.FIELD_AGENT
}

/**
 * Minimal event fixture for scope tests. Jurisdiction fields are empty since
 * these tests focus on scope-type and event-type matching, not jurisdiction filtering.
 */
function makeEvent(eventType: string): EventIndexWithAdministrativeHierarchy {
  return {
    type: eventType,
    legalStatuses: { DECLARED: undefined, REGISTERED: undefined }
  } as unknown as EventIndexWithAdministrativeHierarchy
}

describe('isActionInScope()', () => {
  describe('actions with null scope map (always allowed)', () => {
    it('should return true for ASSIGN regardless of scopes', () => {
      expect(
        isActionInScope({
          scopes: [],
          action: ActionType.ASSIGN,
          event: makeEvent('birth'),
          currentUser: testUser
        })
      ).toBe(true)
    })

    it('should return true for UNASSIGN regardless of scopes', () => {
      expect(
        isActionInScope({
          scopes: [],
          action: ActionType.UNASSIGN,
          event: makeEvent('death'),
          currentUser: testUser
        })
      ).toBe(true)
    })
  })

  describe('encoded scopes', () => {
    it('should allow READ when V2 scope includes the event type', () => {
      const encodedScope = encodeScope({
        type: 'record.read',
        options: { event: ['birth', 'death'] }
      })

      expect(
        isActionInScope({
          scopes: [encodedScope],
          action: ActionType.READ,
          event: makeEvent('birth'),
          currentUser: testUser
        })
      ).toBe(true)
    })

    it('should deny READ when V2 scope event option does not include the event type', () => {
      const encodedScope = encodeScope({
        type: 'record.read',
        options: { event: ['birth'] }
      })

      expect(
        isActionInScope({
          scopes: [encodedScope],
          action: ActionType.READ,
          event: makeEvent('death'),
          currentUser: testUser
        })
      ).toBe(false)
    })

    it('should allow action when V2 scope has no event option (unrestricted)', () => {
      const encodedScope = encodeScope({
        type: 'record.read'
      })

      expect(
        isActionInScope({
          scopes: [encodedScope],
          action: ActionType.READ,
          event: makeEvent('tennis-club-membership'),
          currentUser: testUser
        })
      ).toBe(true)
    })

    it('should deny action when V2 scope type does not match the action', () => {
      const encodedScope = encodeScope({
        type: 'record.declare',
        options: { event: ['birth'] }
      })

      expect(
        isActionInScope({
          scopes: [encodedScope],
          action: ActionType.READ,
          event: makeEvent('birth'),
          currentUser: testUser
        })
      ).toBe(false)
    })

    it('should allow REGISTER with V2 scope for matching event', () => {
      const encodedScope = encodeScope({
        type: 'record.register',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      })

      expect(
        isActionInScope({
          scopes: [encodedScope],
          action: ActionType.REGISTER,
          event: makeEvent('tennis-club-membership'),
          currentUser: testUser
        })
      ).toBe(true)
    })

    it('should deny REGISTER when V2 scope event option does not include the event type', () => {
      const encodedScope = encodeScope({
        type: 'record.register',
        options: { event: ['birth', 'death'] }
      })

      expect(
        isActionInScope({
          scopes: [encodedScope],
          action: ActionType.REGISTER,
          event: makeEvent('tennis-club-membership'),
          currentUser: testUser
        })
      ).toBe(false)
    })
  })

  describe('no scopes', () => {
    it('should deny action when user has no scopes', () => {
      expect(
        isActionInScope({
          scopes: [],
          action: ActionType.READ,
          event: makeEvent('birth'),
          currentUser: testUser
        })
      ).toBe(false)
    })

    it('should deny action when user has unrelated scopes', () => {
      const encodedScope = encodeScope({
        type: 'record.declare',
        options: { event: ['birth'] }
      })

      expect(
        isActionInScope({
          scopes: [encodedScope],
          action: ActionType.READ,
          event: makeEvent('birth'),
          currentUser: testUser
        })
      ).toBe(false)
    })
  })
})

describe('getAvailableRolesForUserUpdatePayload()', () => {
  const allRoles = [
    'HOSPITAL_CLERK',
    'COMMUNITY_LEADER',
    'REGISTRATION_AGENT',
    'LOCAL_REGISTRAR',
    'PROVINCIAL_REGISTRAR'
  ]

  const userToEditLocation = V2_DEFAULT_MOCK_LOCATIONS.find(
    (loc) => loc.name === 'Chisamba Rural Health Centre'
  )

  const userRequestingLocation = V2_DEFAULT_MOCK_LOCATIONS.find(
    (loc) => loc.name === 'Chitanda Rural Health Centre'
  )

  if (!userToEditLocation || !userRequestingLocation) {
    throw new Error('Test setup error: could not find required mock locations')
  }

  const userRequesting: UserContext = {
    type: 'user',
    primaryOfficeId: userRequestingLocation.id,
    administrativeAreaId: userRequestingLocation.administrativeAreaId,
    id: getUUID(),
    role: TestUserRole.enum.COMMUNITY_LEADER
  }

  const resolvedHierarchy = userToEditLocation.administrativeAreaId
    ? getLocationHierarchy(userToEditLocation.administrativeAreaId, {
        administrativeAreas: V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS_MAP,
        locations: V2_DEFAULT_MOCK_LOCATIONS_MAP
      })
    : [userToEditLocation.id]

  const userLocation = {
    primaryOfficeId: userToEditLocation.id as UUID,
    administrativeHierarchy: resolvedHierarchy as UUID[]
  }

  it('returns empty array when user does not have access to users location', () => {
    const acceptedScopes = [
      {
        type: 'user.create',
        options: {
          accessLevel: 'location',
          role: allRoles
        }
      }
    ] satisfies UserScopeV2[]

    const availableRoles = getAvailableRolesForUserUpdatePayload({
      allRoles,
      userLocation,
      userRequesting,
      acceptedScopes
    })

    expect(availableRoles).toEqual([])
  })

  it('returns all roles when no options provided', () => {
    const acceptedScopes = [
      {
        type: 'user.create'
      }
    ] satisfies UserScopeV2[]

    const availableRoles = getAvailableRolesForUserUpdatePayload({
      allRoles,
      userLocation,
      userRequesting,
      acceptedScopes
    })

    expect(availableRoles).toEqual(allRoles)
  })

  it('returns all roles split between multiple scopes', () => {
    const acceptedScopes = [
      {
        type: 'user.edit',
        options: {
          accessLevel: 'location',
          role: ['HOSPITAL_CLERK']
        }
      },
      {
        type: 'user.edit',
        options: {
          role: ['COMMUNITY_LEADER']
        }
      },
      {
        type: 'user.edit',
        options: {
          role: ['LOCAL_REGISTRAR']
        }
      }
    ] satisfies UserScopeV2[]

    const availableRoles = getAvailableRolesForUserUpdatePayload({
      allRoles,
      userLocation,
      userRequesting,
      acceptedScopes
    })

    // Should not include HOSPITAL_CLERK since that role is only allowed at location level and the user does not have access to the user's location, but should include COMMUNITY_LEADER and LOCAL_REGISTRAR since those roles are allowed at any location level
    expect(availableRoles).toEqual(['COMMUNITY_LEADER', 'LOCAL_REGISTRAR'])
  })
})
