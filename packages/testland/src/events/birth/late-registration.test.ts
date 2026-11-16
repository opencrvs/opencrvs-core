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
import { describe, expect, it } from 'vitest'
import {
  ActionStatus,
  ActionType,
  EventDocument,
  getDeclarationFields,
  resolveEventConfig,
  resolveEventCustomFlags,
  UUID,
  validate
} from '@opencrvs/toolkit/events'
import { birthEvent } from './index'

const LATE_REGISTRATION_FLAG = 'approval-required-for-late-registration'

// The late registration target is 365 days, so the deadline is 2026-01-01
const DOB = '2025-01-01'
const ON_TIME = '2025-06-01T09:00:00.000Z'
const LATE = '2026-03-01T09:00:00.000Z'

const config = resolveEventConfig(birthEvent)

function action(type: ActionType, createdAt: string) {
  return {
    id: `${type}-${createdAt}` as UUID,
    type,
    createdAt,
    createdBy: 'user-1',
    createdByUserType: 'user' as const,
    createdByRole: 'LOCAL_REGISTRAR',
    createdAtLocation: 'location-1' as UUID,
    declaration: type === ActionType.CREATE ? {} : { 'child.dob': DOB },
    status: ActionStatus.Accepted,
    transactionId: `tx-${type}-${createdAt}`
  }
}

function birthRecord(actions: ReturnType<typeof action>[]): EventDocument {
  return {
    id: 'event-1' as UUID,
    type: birthEvent.id,
    trackingId: 'TEST12',
    createdAt: ON_TIME,
    updatedAt: LATE,
    actions: [action(ActionType.CREATE, ON_TIME), ...actions]
  }
}

describe('birth late registration', () => {
  describe('reason for delayed registration', () => {
    const reasonField = getDeclarationFields(config).find(
      ({ id }) => id === 'child.reason'
    )!
    const isShown = (record: EventDocument) =>
      validate(reasonField.conditionals![0].conditional, {
        $now: LATE.slice(0, 10),
        $online: true,
        $form: { 'child.dob': DOB },
        $event: record
      })

    it('is hidden on review of a record that was declared on time', () => {
      expect(isShown(birthRecord([action(ActionType.DECLARE, ON_TIME)]))).toBe(
        false
      )
    })

    it('is shown when a late record is declared', () => {
      expect(isShown(birthRecord([]))).toBe(true)
    })
  })

  describe(LATE_REGISTRATION_FLAG, () => {
    it('is not added when the record was notified on time and declared late', () => {
      const record = birthRecord([
        action(ActionType.NOTIFY, ON_TIME),
        action(ActionType.DECLARE, LATE)
      ])

      expect(resolveEventCustomFlags(record, config)).not.toContain(
        LATE_REGISTRATION_FLAG
      )
    })

    it('is added when the record is declared late', () => {
      const record = birthRecord([action(ActionType.DECLARE, LATE)])

      expect(resolveEventCustomFlags(record, config)).toContain(
        LATE_REGISTRATION_FLAG
      )
    })
  })
})
