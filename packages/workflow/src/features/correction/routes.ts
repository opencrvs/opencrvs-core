/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { badRequest, conflict, notFound } from '@hapi/boom'
import { Request } from '@hapi/hapi'
import {
  Bundle,
  CertifiedRecord,
  CorrectionRequestedRecord,
  IssuedRecord,
  RegisteredRecord,
  Task,
  isCorrectionRequestedTask
} from '@opencrvs/commons'
import { getRecordById, RecordNotFoundError } from '@workflow/records'
import { createNewAuditEvent } from '@workflow/records/audit'
import {
  CorrectionRejectionInput,
  CorrectionRequestInput
} from '@workflow/records/correction-request'
import { isTask, sendBundleToHearth } from '@workflow/records/fhir'
import { indexBundle } from '@workflow/records/search'
import {
  toCorrectionRejected,
  toCorrectionRequested
} from '@workflow/records/state-transitions'
import { createRoute } from '@workflow/states'
import { getToken } from '@workflow/utils/authUtils'
import { z } from 'zod'

import { getLoggedInPractitionerResource } from '../user/utils'

function validateRequest<T extends z.ZodType>(
  validator: T,
  payload: unknown
): z.infer<T> {
  try {
    return validator.parse(payload)
  } catch (error) {
    throw badRequest(error.message)
  }
}

export const routes = [
  createRoute({
    method: 'POST',
    path: '/records/{recordId}/request-correction',
    allowedStartStates: ['REGISTERED', 'CERTIFIED', 'ISSUED'],
    action: 'REQUEST_CORRECTION',
    handler: async (request: Request): Promise<CorrectionRequestedRecord> => {
      const correctionDetails = validateRequest(
        CorrectionRequestInput,
        request.payload
      )

      const bundle = await getRecordById(request.params.recordId, [
        'REGISTERED',
        'CERTIFIED',
        'ISSUED'
      ])

      if (hasActiveCorrectionRequest(bundle)) {
        throw conflict(
          'There is already a pending correction request for this record'
        )
      }
      const practitioner = await getLoggedInPractitionerResource(
        getToken(request)
      )

      const recordInCorrectionRequestedState = await toCorrectionRequested(
        bundle,
        practitioner,
        correctionDetails
      )

      // @todo Only send new task to Hearth so it doesn't change anything else
      await sendBundleToHearth({
        ...bundle,
        entry: [
          {
            resource: recordInCorrectionRequestedState.entry
              .map(({ resource }) => resource)
              .find(isTask)
          }
        ]
      })

      await createNewAuditEvent(
        recordInCorrectionRequestedState,
        getToken(request)
      )
      await indexBundle(recordInCorrectionRequestedState, getToken(request))

      return recordInCorrectionRequestedState
    }
  }),
  createRoute({
    method: 'POST',
    path: '/records/{recordId}/reject-correction',
    allowedStartStates: ['CORRECTION_REQUESTED'],
    action: 'REJECT_CORRECTION',
    handler: async (
      request: Request
    ): Promise<RegisteredRecord | CertifiedRecord | IssuedRecord> => {
      const rejectionDetails = validateRequest(
        CorrectionRejectionInput,
        request.payload
      )

      let record: CorrectionRequestedRecord

      try {
        record = await getRecordById(request.params.recordId, [
          'CORRECTION_REQUESTED'
        ])
      } catch (error) {
        if (error instanceof RecordNotFoundError) {
          throw notFound(error.message)
        }
        throw error
      }

      if (!hasActiveCorrectionRequest(record)) {
        throw conflict(
          'There is no a pending correction request for this record'
        )
      }

      const recordInPreviousStateWithCorrectionRejection =
        await toCorrectionRejected(
          record,
          await getLoggedInPractitionerResource(getToken(request)),
          rejectionDetails
        )

      // Mark previous CORRECTION_REQUESTED task as rejected
      // Reinstate previous REGISTERED / CERTIFIED / ISSUED task
      await sendBundleToHearth({
        ...recordInPreviousStateWithCorrectionRejection,
        entry: recordInPreviousStateWithCorrectionRejection.entry
          .map(({ resource }) => resource)
          .filter(isTask)
          .map((resource) => ({ resource }))
      })

      // This is just for backwards compatibility reasons as a lot of existing code assimes there
      // is only one task in the bundle
      const recordWithOnlyThePreviousTask = {
        ...recordInPreviousStateWithCorrectionRejection,
        entry: recordInPreviousStateWithCorrectionRejection.entry.filter(
          (entry) => {
            if (!isTask(entry.resource)) {
              return true
            }
            return !isCorrectionRequestedTask(entry.resource)
          }
        )
      }

      await createNewAuditEvent(
        recordWithOnlyThePreviousTask,
        getToken(request)
      )
      await indexBundle(recordWithOnlyThePreviousTask, getToken(request))

      return recordWithOnlyThePreviousTask
    }
  })
]

function hasActiveCorrectionRequest(bundle: Bundle) {
  return bundle.entry.some((entry) => {
    if (entry.resource.resourceType !== 'Task') {
      return false
    }
    const task = entry.resource as Task

    return (
      task.status === 'requested' &&
      task.businessStatus?.coding?.some(
        (coding) => coding.code === 'CORRECTION_REQUESTED'
      )
    )
  })
}
