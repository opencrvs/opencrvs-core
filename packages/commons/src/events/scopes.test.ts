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

import { configurableEventScopeAllowed, isActionInScope } from './scopes'
import { ActionType } from './ActionType'
import { encodeScope } from '../scopes-v2'

describe('configurableEventScopeAllowed()', () => {
  describe('scope: record.custom-action', () => {
    it('should return false if the event type is not authorized in the found scopes', () => {
      const scopes = [
        'record.custom-action[event=my-event-type,customActionType=MY_CUSTOM_ACTION]'
      ]

      expect(
        configurableEventScopeAllowed(
          scopes,
          ['record.custom-action'],
          'other-event-type',
          'MY_CUSTOM_ACTION'
        )
      ).toBe(false)
    })

    it('should return false if the custom action type is not authorized in the found scopes', () => {
      const scopes = [
        'record.custom-action[event=my-event-type,customActionType=MY_CUSTOM_ACTION]'
      ]

      expect(
        configurableEventScopeAllowed(
          scopes,
          ['record.custom-action'],
          'my-event-type',
          'OTHER_CUSTOM_ACTION_TYPE'
        )
      ).toBe(false)
    })

    it('should return false if has multiple scopes, but none of them with correct combination of event type and custom action type', () => {
      const scopes = [
        'record.custom-action[event=my-event-type,customActionType=MY_CUSTOM_ACTION]',
        'record.custom-action[event=other-event-type,customActionType=OTHER_CUSTOM_ACTION_TYPE]'
      ]

      expect(
        configurableEventScopeAllowed(
          scopes,
          ['record.custom-action'],
          'my-event-type',
          'OTHER_CUSTOM_ACTION_TYPE'
        )
      ).toBe(false)
    })

    it('should return true if the event type is authorized in the found scopes', () => {
      const scopes = [
        'record.custom-action[event=my-event-type,customActionType=MY_CUSTOM_ACTION]'
      ]

      expect(
        configurableEventScopeAllowed(
          scopes,
          ['record.custom-action'],
          'my-event-type',
          'MY_CUSTOM_ACTION'
        )
      ).toBe(true)
    })

    it('should return true if has multiple scopes, one of which has the correct combination of event type and custom action type', () => {
      const scopes = [
        'record.custom-action[event=other-event-type|my-event-type,customActionType=OTHER_CUSTOM_ACTION_TYPE]',
        'record.custom-action[event=my-event-type,customActionType=MY_CUSTOM_ACTION]'
      ]

      expect(
        configurableEventScopeAllowed(
          scopes,
          ['record.custom-action'],
          'my-event-type',
          'MY_CUSTOM_ACTION'
        )
      ).toBe(true)
    })
  })
})

describe('isActionInScope()', () => {
  describe('actions with null scope map (always allowed)', () => {
    it('should return true for ASSIGN regardless of scopes', () => {
      expect(isActionInScope([], ActionType.ASSIGN, 'birth')).toBe(true)
    })

    it('should return true for UNASSIGN regardless of scopes', () => {
      expect(isActionInScope([], ActionType.UNASSIGN, 'death')).toBe(true)
    })
  })

  describe('actions with empty scope map (never allowed)', () => {
    it('should return false for DUPLICATE_DETECTED even with scopes', () => {
      expect(
        isActionInScope(
          ['record.read[event=birth]'],
          ActionType.DUPLICATE_DETECTED,
          'birth'
        )
      ).toBe(false)
    })

    it('should return false for CUSTOM even with scopes', () => {
      expect(
        isActionInScope(
          ['record.read[event=birth]'],
          ActionType.CUSTOM,
          'birth'
        )
      ).toBe(false)
    })
  })

  describe('non-encoded scopes', () => {
    it('should allow READ when legacy scope includes the event type', () => {
      expect(
        isActionInScope(['record.read[event=birth]'], ActionType.READ, 'birth')
      ).toBe(true)
    })

    it('should deny READ when legacy scope does not include the event type', () => {
      expect(
        isActionInScope(['record.read[event=birth]'], ActionType.READ, 'death')
      ).toBe(false)
    })

    it('should allow DECLARE when user has record.declare scope for the event', () => {
      expect(
        isActionInScope(
          ['record.declare[event=birth|death]'],
          ActionType.DECLARE,
          'birth'
        )
      ).toBe(true)
    })

    it('should allow DECLARE when user has record.register scope for the event', () => {
      expect(
        isActionInScope(
          ['record.register[event=birth]'],
          ActionType.DECLARE,
          'birth'
        )
      ).toBe(true)
    })
  })

  describe('encoded scopes', () => {
    it('should allow READ when V2 scope includes the event type', () => {
      const encodedScope = encodeScope({
        type: 'record.read',
        options: { event: ['birth', 'death'] }
      })

      expect(isActionInScope([encodedScope], ActionType.READ, 'birth')).toBe(
        true
      )
    })

    it('should allow READ when V2 scope type matches even if event option does not include the event type', () => {
      const encodedScope = encodeScope({
        type: 'record.read',
        options: { event: ['birth'] }
      })

      // V2 scope check currently only verifies scope type, not event options
      expect(isActionInScope([encodedScope], ActionType.READ, 'death')).toBe(
        true
      )
    })

    it('should allow action when V2 scope has no event option (unrestricted)', () => {
      const encodedScope = encodeScope({
        type: 'record.read'
      })

      expect(
        isActionInScope(
          [encodedScope],
          ActionType.READ,
          'tennis-club-membership'
        )
      ).toBe(true)
    })

    it('should deny action when V2 scope type does not match the action', () => {
      const encodedScope = encodeScope({
        type: 'record.declare',
        options: { event: ['birth'] }
      })

      expect(isActionInScope([encodedScope], ActionType.READ, 'birth')).toBe(
        false
      )
    })

    it('should allow REGISTER with V2 scope for matching event', () => {
      const encodedScope = encodeScope({
        type: 'record.register',
        options: { event: ['birth', 'death', 'tennis-club-membership'] }
      })

      expect(
        isActionInScope(
          [encodedScope],
          ActionType.REGISTER,
          'tennis-club-membership'
        )
      ).toBe(true)
    })

    it('should allow REGISTER with V2 scope type match even when event is not included', () => {
      const encodedScope = encodeScope({
        type: 'record.register',
        options: { event: ['birth', 'death'] }
      })

      // V2 scope check currently only verifies scope type, not event options
      expect(
        isActionInScope(
          [encodedScope],
          ActionType.REGISTER,
          'tennis-club-membership'
        )
      ).toBe(true)
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
        isActionInScope(
          [encodedScope, nonEncodedScope],
          ActionType.READ,
          'death'
        )
      ).toBe(true)
    })

    it('should allow when V1 allows but V2 denies', () => {
      const nonEncodedScope = 'record.read[event=birth]'
      const encodedScope = encodeScope({
        type: 'record.read',
        options: { event: ['death'] }
      })

      expect(
        isActionInScope(
          [nonEncodedScope, encodedScope],
          ActionType.READ,
          'birth'
        )
      ).toBe(true)
    })

    it('should allow when V1 denies but V2 scope type matches', () => {
      const nonEncodedScope = 'record.read[event=birth]'
      const encodedScope = encodeScope({
        type: 'record.read',
        options: { event: ['death'] }
      })

      // V2 scope check currently only verifies scope type, not event options
      expect(
        isActionInScope(
          [nonEncodedScope, encodedScope],
          ActionType.READ,
          'tennis-club-membership'
        )
      ).toBe(true)
    })
  })

  describe('no scopes', () => {
    it('should deny action when user has no scopes', () => {
      expect(isActionInScope([], ActionType.READ, 'birth')).toBe(false)
    })

    it('should deny action when user has unrelated scopes', () => {
      const encodedScope = encodeScope({
        type: 'record.declare',
        options: { event: ['birth'] }
      })

      expect(isActionInScope([encodedScope], ActionType.READ, 'birth')).toBe(
        false
      )
    })
  })
})
