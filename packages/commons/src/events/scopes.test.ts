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

import { isActionInScope } from './scopes'
import { encodeScope } from '../scopes'
import { ActionType } from './ActionType'
import { EventIndexWithAdministrativeHierarchy } from './locations'
import { UserContext } from '../users/User'
import { createPrng, generateUuid, TestUserRole } from './test.utils'

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

  describe('actions with empty scope map (never allowed)', () => {
    it('should return false for DUPLICATE_DETECTED even with scopes', () => {
      expect(
        isActionInScope({
          scopes: ['record.read[event=birth]'],
          action: ActionType.DUPLICATE_DETECTED,
          event: makeEvent('birth'),
          currentUser: testUser
        })
      ).toBe(false)
    })

    it('should return false for CUSTOM even with scopes', () => {
      expect(
        isActionInScope({
          scopes: ['record.read[event=birth]'],
          action: ActionType.CUSTOM,
          event: makeEvent('birth'),
          currentUser: testUser
        })
      ).toBe(false)
    })
  })

  describe('non-encoded scopes', () => {
    it('should prevent READ when legacy scope includes the event type', () => {
      expect(
        isActionInScope({
          scopes: ['record.read[event=birth]'],
          action: ActionType.READ,
          event: makeEvent('birth'),
          currentUser: testUser
        })
      ).toBe(false)
    })

    it('should deny READ when legacy scope does not include the event type', () => {
      expect(
        isActionInScope({
          scopes: ['record.read[event=birth]'],
          action: ActionType.READ,
          event: makeEvent('death'),
          currentUser: testUser
        })
      ).toBe(false)
    })

    it('should deny DECLARE when user has legacy record.declare scope for the event', () => {
      expect(
        isActionInScope({
          scopes: ['record.declare[event=birth|death]'],
          action: ActionType.DECLARE,
          event: makeEvent('birth'),
          currentUser: testUser
        })
      ).toBe(false)
    })

    it('should deny DECLARE when user has legacy record.register scope for the event', () => {
      expect(
        isActionInScope({
          scopes: ['record.register[event=birth]'],
          action: ActionType.DECLARE,
          event: makeEvent('birth'),
          currentUser: testUser
        })
      ).toBe(false)
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

  describe('encoded and non-encoded scope interaction (OR logic)', () => {
    it('should allow when V1 denies but V2 allows', () => {
      const nonEncodedScope = 'record.read[event=birth]'
      const encodedScope = encodeScope({
        type: 'record.read',
        options: { event: ['death'] }
      })

      expect(
        isActionInScope({
          scopes: [encodedScope, nonEncodedScope],
          action: ActionType.READ,
          event: makeEvent('death'),
          currentUser: testUser
        })
      ).toBe(true)
    })

    it('should deny when V1 allows but V2 denies', () => {
      const nonEncodedScope = 'record.read[event=birth]'
      const encodedScope = encodeScope({
        type: 'record.read',
        options: { event: ['death'] }
      })

      expect(
        isActionInScope({
          scopes: [nonEncodedScope, encodedScope],
          action: ActionType.READ,
          event: makeEvent('birth'),
          currentUser: testUser
        })
      ).toBe(false)
    })

    it('should deny when both V1 and V2 deny', () => {
      const nonEncodedScope = 'record.read[event=birth]'
      const encodedScope = encodeScope({
        type: 'record.read',
        options: { event: ['death'] }
      })

      expect(
        isActionInScope({
          scopes: [nonEncodedScope, encodedScope],
          action: ActionType.READ,
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
