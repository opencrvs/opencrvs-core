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

  describe('validateActionOrder()', () => {
    it('should successfully validate an action order with valid core actions', () => {
      const res = EventConfig.safeParse({
        ...tennisClubMembershipEvent,
        actionOrder: ['DECLARE', 'REGISTER']
      })

      expect(res.success).toBe(true)
    })

    it('should unsuccessfully validate an action order with invalid action', () => {
      const res = EventConfig.safeParse({
        ...tennisClubMembershipEvent,
        actionOrder: ['DECLARE', 'INVALID_ACTION', 'REGISTER']
      })

      expect(res.success).toBe(false)
      expect(res.error?.issues[0].message).toBe(
        'Invalid action type in action order: INVALID_ACTION'
      )
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

  describe('validateHasDeclareAction()', () => {
    it('should pass validation when the event has a DECLARE action', () => {
      const res = EventConfig.safeParse(tennisClubMembershipEvent)

      expect(res.success).toBe(true)
    })

    it('should fail validation when the event has no DECLARE action', () => {
      const res = EventConfig.safeParse({
        ...tennisClubMembershipEvent,
        actions: tennisClubMembershipEvent.actions.filter(
          (action) => action.type !== ActionType.DECLARE
        )
      })

      expect(res.success).toBe(false)
      expect(res.error?.issues).toContainEqual(
        expect.objectContaining({
          path: ['actions'],
          message: `Event must have a DECLARE action. Found none for event ${tennisClubMembershipEvent.id}`
        })
      )
    })
  })

  describe('validateActionVersions()', () => {
    const declareActionIndex = tennisClubMembershipEvent.actions.findIndex(
      (action) => action.type === ActionType.DECLARE
    )
    const declareAction = tennisClubMembershipEvent.actions[declareActionIndex]
    const actionCount = tennisClubMembershipEvent.actions.length

    const customAction = {
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

    it('should pass validation when versions of an action have different effectiveFrom values', () => {
      const res = EventConfig.safeParse({
        ...tennisClubMembershipEvent,
        actions: [
          ...tennisClubMembershipEvent.actions,
          { ...declareAction, effectiveFrom: '2020-01-01' },
          { ...declareAction, effectiveFrom: '2025-01-01' }
        ]
      })

      expect(res.success).toBe(true)
    })

    it('should pass validation when versions of a non-DECLARE core action have different effectiveFrom values', () => {
      const registerAction = tennisClubMembershipEvent.actions.find(
        (action) => action.type === ActionType.REGISTER
      )

      const res = EventConfig.safeParse({
        ...tennisClubMembershipEvent,
        actions: [
          ...tennisClubMembershipEvent.actions,
          { ...registerAction, effectiveFrom: '2020-01-01' },
          { ...registerAction, effectiveFrom: '2025-01-01' }
        ]
      })

      expect(res.success).toBe(true)
    })

    it('should keep effectiveFrom on the parsed action', () => {
      const res = EventConfig.safeParse({
        ...tennisClubMembershipEvent,
        actions: [
          ...tennisClubMembershipEvent.actions,
          { ...declareAction, effectiveFrom: '2020-01-01' }
        ]
      })

      expect(res.data?.actions[actionCount].effectiveFrom).toBe('2020-01-01')
    })

    it('should fail validation when effectiveFrom is not a YYYY-MM-DD date', () => {
      const res = EventConfig.safeParse({
        ...tennisClubMembershipEvent,
        actions: [
          ...tennisClubMembershipEvent.actions,
          { ...declareAction, effectiveFrom: '2020-01-01T00:00:00Z' }
        ]
      })

      expect(res.success).toBe(false)
    })

    it('should fail validation when two versions of an action have the same effectiveFrom', () => {
      const res = EventConfig.safeParse({
        ...tennisClubMembershipEvent,
        actions: [
          ...tennisClubMembershipEvent.actions,
          { ...declareAction, effectiveFrom: '2020-01-01' },
          { ...declareAction, effectiveFrom: '2020-01-01' }
        ]
      })

      expect(res.success).toBe(false)
      expect(res.error?.issues).toContainEqual(
        expect.objectContaining({
          path: ['actions', actionCount + 1, 'effectiveFrom'],
          message: `Action 'DECLARE' of event '${tennisClubMembershipEvent.id}' has more than one version with \`effectiveFrom\` '2020-01-01'. Each version must have a different \`effectiveFrom\`.`
        })
      )
    })

    it('should fail validation when two versions of an action have no effectiveFrom', () => {
      const res = EventConfig.safeParse({
        ...tennisClubMembershipEvent,
        actions: [...tennisClubMembershipEvent.actions, declareAction]
      })

      expect(res.success).toBe(false)
      expect(res.error?.issues).toContainEqual(
        expect.objectContaining({
          path: ['actions', actionCount, 'effectiveFrom'],
          message: `Action 'DECLARE' of event '${tennisClubMembershipEvent.id}' has more than one version without \`effectiveFrom\`. At most one version may omit it.`
        })
      )
    })

    it('should tell custom actions apart by customActionType', () => {
      const res = EventConfig.safeParse({
        ...tennisClubMembershipEvent,
        actions: [
          ...tennisClubMembershipEvent.actions,
          customAction,
          { ...customAction, customActionType: 'OTHER_CUSTOM_ACTION' }
        ]
      })

      expect(res.success).toBe(true)
    })

    it('should not take a custom action for a version of the core action its customActionType matches', () => {
      const res = EventConfig.safeParse({
        ...tennisClubMembershipEvent,
        actions: [
          ...tennisClubMembershipEvent.actions,
          { ...customAction, customActionType: ActionType.DECLARE }
        ]
      })

      expect(res.success).toBe(true)
    })

    it('should fail validation when two versions of a custom action have no effectiveFrom', () => {
      const res = EventConfig.safeParse({
        ...tennisClubMembershipEvent,
        actions: [
          ...tennisClubMembershipEvent.actions,
          customAction,
          customAction
        ]
      })

      expect(res.success).toBe(false)
      expect(res.error?.issues).toContainEqual(
        expect.objectContaining({
          path: ['actions', actionCount + 1, 'effectiveFrom'],
          message: `Custom action 'MY_CUSTOM_ACTION' of event '${tennisClubMembershipEvent.id}' has more than one version without \`effectiveFrom\`. At most one version may omit it.`
        })
      )
    })
  })
})
