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
import * as Hapi from '@hapi/hapi'

import { query, writePoints } from '@metrics/influxdb/client'
import {
  generateAuditPoint,
  toInfluxTimestamp
} from '@metrics/features/registration/pointGenerator'
import {
  getCompositionIdFromCompositionOrTask,
  getPractitionerIdFromBundle,
  getTask,
  getTrackingId
} from '@metrics/features/registration/fhirUtils'

type UserAuditAction =
  | 'DECLARED'
  | 'REGISTERED'
  | 'IN_PROGRESS'
  | 'REJECTED'
  | 'CORRECTED'
  | 'REQUESTED_CORRECTION'
  | 'APPROVED_CORRECTION'
  | 'REJECTED_CORRECTION'
  | 'VALIDATED'
  | 'DECLARATION_UPDATED'
  | 'ASSIGNED'
  | 'UNASSIGNED'
  | 'RETRIEVED'
  | 'VIEWED'
  | 'ARCHIVED'
  | 'REINSTATED_IN_PROGRESS'
  | 'REINSTATED_DECLARED'
  | 'REINSTATED_REJECTED'
  | 'SENT_FOR_APPROVAL'
  | 'CERTIFIED'
  | 'ISSUED'
  | 'MARKED_AS_DUPLICATE'
  | 'MARKED_AS_NOT_DUPLICATE'

type RawUserAuditDataPoint = {
  practitionerId: number
  action: UserAuditAction
  ipAddress: string
  data: string
  userAgent: string
}

type ParsedUserAuditDataPoint = {
  practitionerId: number
  action: UserAuditAction
  ipAddress: string
  data: Record<string, any>
  userAgent: string
}

type UserAuditDataPointWithComposition<Action> = ParsedUserAuditDataPoint & {
  action: Action
  data: { compositionId: string }
}

type UserAuditDataPoint =
  | UserAuditDataPointWithComposition<'DECLARED'>
  | UserAuditDataPointWithComposition<'REGISTERED'>
  | UserAuditDataPointWithComposition<'IN_PROGRESS'>
  | UserAuditDataPointWithComposition<'REJECTED'>
  | UserAuditDataPointWithComposition<'CORRECTED'>
  | UserAuditDataPointWithComposition<'REQUESTED_CORRECTION'>
  | UserAuditDataPointWithComposition<'APPROVED_CORRECTION'>
  | UserAuditDataPointWithComposition<'REJECTED_CORRECTION'>
  | UserAuditDataPointWithComposition<'VALIDATED'>
  | UserAuditDataPointWithComposition<'DECLARATION_UPDATED'>
  | UserAuditDataPointWithComposition<'ASSIGNED'>
  | UserAuditDataPointWithComposition<'UNASSIGNED'>
  | UserAuditDataPointWithComposition<'RETRIEVED'>
  | UserAuditDataPointWithComposition<'VIEWED'>
  | UserAuditDataPointWithComposition<'ARCHIVED'>
  | UserAuditDataPointWithComposition<'REINSTATED_IN_PROGRESS'>
  | UserAuditDataPointWithComposition<'REINSTATED_DECLARED'>
  | UserAuditDataPointWithComposition<'REINSTATED_REJECTED'>
  | UserAuditDataPointWithComposition<'SENT_FOR_APPROVAL'>
  | UserAuditDataPointWithComposition<'CERTIFIED'>
  | UserAuditDataPointWithComposition<'ISSUED'>
  | UserAuditDataPointWithComposition<'MARKED_AS_DUPLICATE'>
  | UserAuditDataPointWithComposition<'MARKED_AS_NOT_DUPLICATE'>

export async function createUserAuditPointFromFHIR(
  action: UserAuditAction,
  request: Hapi.Request
) {
  const ipAddress = request.headers['x-real-ip'] || request.info.remoteAddress
  const userAgent =
    request.headers['x-real-user-agent'] || request.headers['user-agent']

  const bundle = request.payload as fhir.Bundle
  return writePoints([
    generateAuditPoint(
      getPractitionerIdFromBundle(bundle)!,
      action,
      ipAddress,
      userAgent,
      {
        compositionId: getCompositionIdFromCompositionOrTask(bundle),
        trackingId: getTrackingId(getTask(bundle)!)
      }
    )
  ])
}

export async function getUserAuditEvents(
  practitionerId: string,
  size: number,
  skip: number,
  timeStart: string,
  timeEnd: string
): Promise<Array<UserAuditDataPoint>> {
  let startDate
  let endDate
  let startDateCondition = ''
  let endDateCondition = ''

  if (timeStart) {
    startDate = toInfluxTimestamp(timeStart)
    startDateCondition = ` and time >= ${startDate}`
  }
  if (timeEnd) {
    endDate = toInfluxTimestamp(timeEnd)
    endDateCondition = ` and time <= ${endDate}`
  }

  const results = await query<Array<RawUserAuditDataPoint>>(
    `SELECT * from user_audit_event where practitionerId = $practitionerId ${startDateCondition} ${endDateCondition} order by time desc limit ${size} offset ${skip}`,
    {
      placeholders: {
        practitionerId: practitionerId
      }
    }
  )

  return results.map((row) => ({
    ...row,
    data: row.data ? JSON.parse(row.data) : {}
  }))
}

export async function countUserAuditEvents(
  practitionerId: string,
  timeStart: string,
  timeEnd: string
): Promise<number> {
  let startDate
  let endDate
  let startDateCondition = ''
  let endDateCondition = ''

  if (timeStart) {
    startDate = toInfluxTimestamp(timeStart)
    startDateCondition = ` and time >= ${startDate}`
  }
  if (timeEnd) {
    endDate = toInfluxTimestamp(timeEnd)
    endDateCondition = ` and time <= ${endDate}`
  }
  const result = await query(
    `SELECT COUNT(ipAddress)
     from user_audit_event
     where practitionerId = $practitionerId ${startDateCondition} ${endDateCondition}`,
    { placeholders: { practitionerId: practitionerId } }
  )
  if (result.length === 0) {
    return 0
  }
  return result[0].count
}
