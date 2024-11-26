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
  CertifiedRecord,
  IssuedRecord,
  RegisteredRecord,
  addTaskToRecord,
  getPractitioner,
  getPractitionerContactDetails,
  getRecordWithoutTasks,
  getTasksInAscendingOrder,
  getTrackingId
} from '@opencrvs/commons/types'
import {
  getLoggedInPractitionerResource,
  getPractitionerOfficeId
} from '@workflow/features/user/utils'
import { createNewAuditEvent } from '@workflow/records/audit'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { indexBundle } from '@workflow/records/search'
import { toCorrectionRejected } from '@workflow/records/state-transitions'
import { CorrectionRejectionInput } from '@workflow/records/validations'
import { createRoute } from '@workflow/states'
import { getToken } from '@workflow/utils/auth-utils'
import { validateRequest } from '@workflow/utils/index'
import { findActiveCorrectionRequest, sendNotification } from './utils'
import { SCOPES } from '@opencrvs/commons/authentication'
import { getEventType } from '@workflow/features/registration/utils'

export const rejectCorrectionRoute = createRoute({
  method: 'POST',
  path: '/records/{recordId}/reject-correction',
  allowedStartStates: ['CORRECTION_REQUESTED'],
  action: 'REJECT_CORRECTION',
  includeHistoryResources: true,
  allowedScopes: [SCOPES.RECORD_REGISTRATION_CORRECT],
  handler: async (
    request,
    record
  ): Promise<RegisteredRecord | CertifiedRecord | IssuedRecord> => {
    const rejectionDetails = validateRequest(
      CorrectionRejectionInput,
      request.payload
    )

    const correctionRequest = findActiveCorrectionRequest(record)
    if (!correctionRequest) {
      throw conflict('There is no a pending correction request for this record')
    }

    const loggedInPractitioner = await getLoggedInPractitionerResource(
      getToken(request)
    )
    const recordInPreviousStateWithCorrectionRejection =
      await toCorrectionRejected(
        record,
        await getLoggedInPractitionerResource(getToken(request)),
        await getPractitionerOfficeId(loggedInPractitioner.id),
        rejectionDetails
      )

    // This is just for backwards compatibility reasons as a lot of existing code assimes there
    // is only one task in the bundle
    const [correctionRejectedTask, prevTask] = getTasksInAscendingOrder(
      recordInPreviousStateWithCorrectionRejection
    )

    const recordWithoutTasks = getRecordWithoutTasks(
      recordInPreviousStateWithCorrectionRejection
    )
    const recordWithCorrectionRejectedTask = addTaskToRecord(
      recordWithoutTasks,
      correctionRejectedTask
    )

    const recordWithUpdatedStatus = addTaskToRecord(
      recordWithoutTasks,
      prevTask
    )

    // Mark previous CORRECTION_REQUESTED task as rejected
    // Reinstate previous REGISTERED / CERTIFIED / ISSUED task
    await sendBundleToHearth(recordInPreviousStateWithCorrectionRejection)

    // has reason and timeLoggedMS
    await createNewAuditEvent(
      recordWithCorrectionRejectedTask,
      getToken(request)
    )

    // has the previous business status
    await indexBundle(recordWithUpdatedStatus, getToken(request))

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
      'rejectCorrectionRequest',
      practitionerContacts,
      getAuthHeader(request),
      {
        event: getEventType(record),
        trackingId: getTrackingId(recordWithCorrectionRejectedTask)!,
        userFullName: requestingPractitioner.name,
        reason: rejectionDetails.reason
      }
    )

    return recordWithCorrectionRejectedTask
  }
})
