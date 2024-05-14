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
  changeState,
  updateFHIRBundle
} from '@opencrvs/commons/types'
import { uploadBase64AttachmentsToDocumentsStore } from '@workflow/documents'
import { getEventType } from '@workflow/features/registration/utils'
import { getLoggedInPractitionerResource } from '@workflow/features/user/utils'
import { createNewAuditEvent } from '@workflow/records/audit'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { indexBundle } from '@workflow/records/search'
import { toCorrected } from '@workflow/records/state-transitions'
import { CorrectionRequestInput } from '@workflow/records/validations'
import { createRoute } from '@workflow/states'
import { getToken } from '@workflow/utils/auth-utils'
import { validateRequest } from '@workflow/utils/index'
import { findActiveCorrectionRequest } from './utils'

export const makeCorrectionRoute = createRoute({
  method: 'POST',
  path: '/records/{recordId}/make-correction',
  allowedStartStates: ['REGISTERED', 'CERTIFIED', 'ISSUED'],
  action: 'MAKE_CORRECTION',
  handler: async (request, record): Promise<RegisteredRecord> => {
    const recordInput = request.payload as
      | BirthRegistration
      | DeathRegistration
      | MarriageRegistration

    const correctionDetails = validateRequest(
      CorrectionRequestInput,
      recordInput.registration?.correction
    )
    const token = getToken(request)

    if (findActiveCorrectionRequest(record)) {
      throw conflict(
        'There is already a pending correction request for this record'
      )
    }
    const practitioner = await getLoggedInPractitionerResource(token)

    const recordInputWithUploadedAttachments =
      await uploadBase64AttachmentsToDocumentsStore(
        recordInput,
        getAuthHeader(request)
      )

    const paymentAttachmentUrl =
      recordInputWithUploadedAttachments?.registration?.correction?.payment
        ?.attachmentData

    const proofOfLegalCorrectionAttachments =
      recordInputWithUploadedAttachments?.registration?.correction
        ?.attachments ?? []

    const recordInCorrectedState = await toCorrected(
      record,
      practitioner,
      correctionDetails,
      proofOfLegalCorrectionAttachments,
      paymentAttachmentUrl
    )

    const { correction, ...registration } =
      recordInputWithUploadedAttachments.registration!

    const recordWithUpdatedValues = updateFHIRBundle(
      recordInCorrectedState,
      { ...recordInputWithUploadedAttachments, registration },
      getEventType(record)
    )

    await indexBundle(recordWithUpdatedValues, token)
    await sendBundleToHearth(recordWithUpdatedValues)
    await createNewAuditEvent(recordWithUpdatedValues, token)

    return changeState(recordWithUpdatedValues, 'REGISTERED')
  }
})
