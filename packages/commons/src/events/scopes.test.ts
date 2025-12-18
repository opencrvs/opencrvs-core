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

import { configurableEventScopeAllowed } from './scopes'

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
