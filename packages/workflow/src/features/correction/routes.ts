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
import { badRequest, conflict } from '@hapi/boom'
import {
  Bundle,
  CertifiedRecord,
  CorrectionRequestedRecord,
  getAuthHeader,
  IssuedRecord,
  RegisteredRecord,
  Task,
  withOnlyLatestTask
} from '@opencrvs/commons'
import { uploadBase64ToMinio } from '@workflow/documents'
import { createNewAuditEvent } from '@workflow/records/audit'
import {
  ApproveRequestInput,
  CorrectionRejectionInput,
  CorrectionRequestInput
} from '@workflow/records/correction-request'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { indexBundle } from '@workflow/records/search'
import {
  toCorrected,
  toCorrectionApproved,
  toCorrectionRejected,
  toCorrectionRequested
} from '@workflow/records/state-transitions'
import { createRoute } from '@workflow/states'
import { getToken } from '@workflow/utils/authUtils'
import { z } from 'zod'

import { getLoggedInPractitionerResource } from '../user/utils'
import { getRecordById } from '@workflow/records'

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
    handler: async (request, record): Promise<CorrectionRequestedRecord> => {
      const correctionDetails = validateRequest(
        CorrectionRequestInput,
        request.payload
      )
      const token = getToken(request)

      if (hasActiveCorrectionRequest(record)) {
        throw conflict(
          'There is already a pending correction request for this record'
        )
      }
      const practitioner = await getLoggedInPractitionerResource(token)

      const paymentAttachmentUrl =
        correctionDetails.payment?.attachmentData &&
        (await uploadBase64ToMinio(
          correctionDetails.payment.attachmentData,
          getAuthHeader(request)
        ))

      const proofOfLegalCorrectionAttachments = await Promise.all(
        correctionDetails.attachments.map(async (attachment) => ({
          type: attachment.type,
          url: await uploadBase64ToMinio(
            attachment.data,
            getAuthHeader(request)
          )
        }))
      )

      const recordInCorrectionRequestedState = await toCorrectionRequested(
        record,
        practitioner,
        correctionDetails,
        proofOfLegalCorrectionAttachments,
        paymentAttachmentUrl
      )

      await sendBundleToHearth(recordInCorrectionRequestedState)
      await createNewAuditEvent(recordInCorrectionRequestedState, token)
      await indexBundle(recordInCorrectionRequestedState, token)

      return recordInCorrectionRequestedState
    }
  }),
  createRoute({
    method: 'POST',
    path: '/records/{recordId}/reject-correction',
    allowedStartStates: ['CORRECTION_REQUESTED'],
    action: 'REJECT_CORRECTION',
    handler: async (
      request,
      record
    ): Promise<RegisteredRecord | CertifiedRecord | IssuedRecord> => {
      const rejectionDetails = validateRequest(
        CorrectionRejectionInput,
        request.payload
      )

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
      await sendBundleToHearth(recordInPreviousStateWithCorrectionRejection)

      // This is just for backwards compatibility reasons as a lot of existing code assimes there
      // is only one task in the bundle
      const recordWithOnlyThePreviousTask = withOnlyLatestTask(
        recordInPreviousStateWithCorrectionRejection
      )

      await createNewAuditEvent(
        recordWithOnlyThePreviousTask,
        getToken(request)
      )
      await indexBundle(recordWithOnlyThePreviousTask, getToken(request))

      return recordWithOnlyThePreviousTask
    }
  }),
  createRoute({
    method: 'POST',
    path: '/records/{recordId}/make-correction',
    allowedStartStates: ['REGISTERED', 'CERTIFIED', 'ISSUED'],
    action: 'MAKE_CORRECTION',
    handler: async (request, record): Promise<RegisteredRecord> => {
      const correctionDetails = validateRequest(
        CorrectionRequestInput,
        request.payload
      )
      const token = getToken(request)

      if (hasActiveCorrectionRequest(record)) {
        throw conflict(
          'There is already a pending correction request for this record'
        )
      }
      const practitioner = await getLoggedInPractitionerResource(token)

      const paymentAttachmentUrl =
        correctionDetails.payment?.attachmentData &&
        (await uploadBase64ToMinio(
          correctionDetails.payment.attachmentData,
          getAuthHeader(request)
        ))

      const proofOfLegalCorrectionAttachments = await Promise.all(
        correctionDetails.attachments.map(async (attachment) => ({
          type: attachment.type,
          url: await uploadBase64ToMinio(
            attachment.data,
            getAuthHeader(request)
          )
        }))
      )

      const recordInCorrectedState = await toCorrected(
        record,
        practitioner,
        correctionDetails,
        proofOfLegalCorrectionAttachments,
        paymentAttachmentUrl
      )

      await sendBundleToHearth(recordInCorrectedState)
      await createNewAuditEvent(recordInCorrectedState, token)
      await indexBundle(recordInCorrectedState, token)

      const updatedRecord = await getRecordById(request.params.recordId, [
        'REGISTERED'
      ])

      return updatedRecord
    }
  }),
  createRoute({
    method: 'POST',
    path: '/records/{recordId}/approve-correction',
    allowedStartStates: ['CORRECTION_REQUESTED'],
    action: 'APPROVE_CORRECTION',
    handler: async (request, record): Promise<RegisteredRecord> => {
      const correctionDetails = validateRequest(
        ApproveRequestInput,
        request.payload
      )
      const token = getToken(request)

      if (!hasActiveCorrectionRequest(record)) {
        throw conflict(
          'There is no pending correction requests for this record'
        )
      }
      const practitioner = await getLoggedInPractitionerResource(token)

      const recordInCorrectedState = await toCorrectionApproved(
        record,
        practitioner,
        correctionDetails
      )

      await sendBundleToHearth(recordInCorrectedState)

      const recordWithOnlyThePreviousTask = withOnlyLatestTask(
        recordInCorrectedState
      )
      await createNewAuditEvent(recordWithOnlyThePreviousTask, token)
      await indexBundle(recordWithOnlyThePreviousTask, token)

      const updatedRecord = await getRecordById(request.params.recordId, [
        'REGISTERED'
      ])

      return updatedRecord
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
