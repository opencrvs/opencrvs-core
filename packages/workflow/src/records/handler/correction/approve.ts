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
import { conflict } from '@hapi/boom'
import { getAuthHeader } from '@opencrvs/commons/http'
import {
  BirthRegistration,
  DeathRegistration,
  MarriageRegistration,
  RegisteredRecord,
  ValidRecord,
  addTaskToRecord,
  getPractitioner,
  getPractitionerContactDetails,
  getRecordWithoutTasks,
  getTaskFromSavedBundle,
  getTasksInAscendingOrder,
  getTrackingId,
  updateFHIRBundle
} from '@opencrvs/commons/types'
import { uploadBase64AttachmentsToDocumentsStore } from '@workflow/documents'
import { getEventType } from '@workflow/features/registration/utils'
import { createNewAuditEvent } from '@workflow/records/audit'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { indexBundle } from '@workflow/records/search'
import { toCorrectionApproved } from '@workflow/records/state-transitions'
import { ApproveRequestInput } from '@workflow/records/validations'
import { createRoute } from '@workflow/states'
import { getToken } from '@workflow/utils/auth-utils'
import { validateRequest } from '@workflow/utils/index'
import { findActiveCorrectionRequest, sendNotification } from './utils'
import { SCOPES } from '@opencrvs/commons/authentication'
import { getValidRecordById } from '@workflow/records'

export const approveCorrectionRoute = createRoute({
  method: 'POST',
  path: '/records/{recordId}/approve-correction',
  allowedStartStates: ['CORRECTION_REQUESTED'],
  action: 'APPROVE_CORRECTION',
  allowedScopes: [SCOPES.RECORD_REGISTRATION_CORRECT],
  includeHistoryResources: true,
  handler: async (request, record): Promise<RegisteredRecord> => {
    const recordInput = request.payload as
      | BirthRegistration
      | DeathRegistration
      | MarriageRegistration

    const correctionDetails = validateRequest(
      ApproveRequestInput,
      recordInput.registration?.correction
    )

    const recordInputWithUploadedAttachments =
      await uploadBase64AttachmentsToDocumentsStore(
        recordInput,
        getAuthHeader(request)
      )

    const token = getToken(request)
    const correctionRequest = findActiveCorrectionRequest(record)

    if (!correctionRequest) {
      throw conflict('There is no pending correction requests for this record')
    }

    const recordInCorrectedState = await toCorrectionApproved(
      record,
      getToken(request),
      correctionDetails
    )
    const { correction, ...registration } =
      recordInputWithUploadedAttachments.registration!

    /*
     * Separate tasks from the record
     */
    const [correctionRequestApprovedTask, correctedTask] =
      getTasksInAscendingOrder(recordInCorrectedState)
    const recordWithoutTasks = getRecordWithoutTasks(recordInCorrectedState)

    /*
     * Create and update the valid record that only has one task (the corrected task)
     */
    const newRecord = addTaskToRecord(recordWithoutTasks, correctedTask)

    newRecord satisfies ValidRecord

    const recordWithUpdatedValues = updateFHIRBundle(
      newRecord,
      { ...recordInputWithUploadedAttachments, registration },
      getEventType(record)
    )

    /*
     * Saves the previous task in the "approved" state and the new task (record put to Registered state)
     * Note that because we are storing the task "twice", the approved task needs to be first in the list!
     */

    const updatedCorrectedTask = getTaskFromSavedBundle(recordWithUpdatedValues)
    const recordWithNoTasks = getRecordWithoutTasks(recordWithUpdatedValues)

    // First add the approved task to the record
    const recordWithApprovedTask = addTaskToRecord(
      recordWithNoTasks,
      correctionRequestApprovedTask
    )

    // Then add the corrected task to the record
    const fullBundleToBeSaved = addTaskToRecord(
      recordWithApprovedTask,
      updatedCorrectedTask
    )

    await sendBundleToHearth(fullBundleToBeSaved)

    /*
     * Create metrics events & reindex the bundle in elasticsearch
     */
    const updatedRecord = await getValidRecordById(
      request.params.recordId,
      request.headers.authorization,
      true
    )

    await createNewAuditEvent(updatedRecord, token)
    await indexBundle(updatedRecord, token)

    /*
     * Notify the requesting practitioner that the correction request has been approved
     */

    const requestingPractitioner = getPractitioner(
      correctionRequest.requester.agent.reference.split('/')[1],
      record
    )

    const practitionerContacts = getPractitionerContactDetails(
      requestingPractitioner
    )

    await sendNotification(
      'approveCorrectionRequest',
      practitionerContacts,
      getAuthHeader(request),
      {
        event: getEventType(record),
        trackingId: getTrackingId(recordWithUpdatedValues)!,
        userFullName: requestingPractitioner.name
      }
    )

    return recordWithUpdatedValues
  }
})
