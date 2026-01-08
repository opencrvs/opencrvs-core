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

import { EventConfig } from './EventConfig'
import { tennisClubMembershipEvent } from '../fixtures'
import { ActionType } from './ActionType'

describe('EventConfig', () => {
  it('should successfully validate a valid event config', () => {
    const res = EventConfig.safeParse(tennisClubMembershipEvent)
    expect(res.success).toBe(true)
  })

  it('should fail validation with invalid event config', () => {
    const res = EventConfig.safeParse({})
    expect(res.success).toBe(false)
  })

  describe('actionOrder validation', () => {
    it('should successfully validate an action order with valid core actions', () => {
      const res = EventConfig.safeParse({
        ...tennisClubMembershipEvent,
        actionOrder: ['DECLARE', 'REGISTER']
      })

      expect(res.success).toBe(true)
    })

    it('should unsuccessfully validate an action order with actions', () => {
      const res = EventConfig.safeParse({
        ...tennisClubMembershipEvent,
        actionOrder: ['DECLARE', 'INVALID_ACTION', 'REGISTER']
      })

      expect(res.success).toBe(false)
    })

    it('should successfully validate an action order with custom actions', () => {
      const res = EventConfig.safeParse({
        ...tennisClubMembershipEvent,
        actionOrder: ['DECLARE', 'MY_CUSTOM_ACTION', 'REGISTER'],
        actions: [
          ...tennisClubMembershipEvent.actions,
          {
            type: ActionType.CUSTOM,
            customActionType: 'MY_CUSTOM_ACTION',
            form: [],
            label: {
              defaultMessage: 'My custom action',
              description: 'This is the label for the custom action',
              id: 'event.tennis-club-membership.custom-action.label'
            },
            auditHistoryLabel: {
              defaultMessage: 'My custom action',
              description: 'This is the label for the custom action',
              id: 'event.tennis-club-membership.custom-action.audit-history-label'
            }
          }
        ]
      })

      expect(res.success).toBe(true)
    })
  })
})
