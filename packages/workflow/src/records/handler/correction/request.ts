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
  CorrectionRequestedRecord,
  getComposition
} from '@opencrvs/commons/types'
import { uploadFileToMinio } from '@workflow/documents'
import {
  getLoggedInPractitionerResource,
  getPractitionerOfficeId
} from '@workflow/features/user/utils'
import { createNewAuditEvent } from '@workflow/records/audit'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { indexBundle } from '@workflow/records/search'
import { toCorrectionRequested } from '@workflow/records/state-transitions'
import { CorrectionRequestInput } from '@workflow/records/validations'
import { createRoute } from '@workflow/states'
import { getToken } from '@workflow/utils/auth-utils'
import { validateRequest } from '@workflow/utils/index'
import { findActiveCorrectionRequest } from './utils'
import { SCOPES } from '@opencrvs/commons/authentication'
import { notifyForAction } from '@workflow/utils/country-config-api'
import { getRecordSpecificToken } from '@workflow/records/token-exchange'
import { getEventType } from '@workflow/features/registration/utils'

export const requestCorrectionRoute = createRoute({
  method: 'POST',
  path: '/records/{recordId}/request-correction',
  allowedStartStates: ['REGISTERED', 'CERTIFIED', 'ISSUED'],
  action: 'REQUEST_CORRECTION',
  includeHistoryResources: true,
  allowedScopes: [SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION],
  handler: async (request, record): Promise<CorrectionRequestedRecord> => {
    const correctionDetails = validateRequest(
      CorrectionRequestInput,
      request.payload
    )

    const token = getToken(request)

    if (findActiveCorrectionRequest(record)) {
      throw conflict(
        'There is already a pending correction request for this record'
      )
    }
    const practitioner = await getLoggedInPractitionerResource(token)
    const practitionerOfficeId = await getPractitionerOfficeId(practitioner.id)

    const paymentAttachmentUrl =
      correctionDetails.payment?.attachmentData &&
      (await uploadFileToMinio(
        correctionDetails.payment.attachmentData,
        getAuthHeader(request)
      ))

    const proofOfLegalCorrectionAttachments = await Promise.all(
      correctionDetails.attachments.map(async (attachment) => ({
        type: attachment.type,
        url: await uploadFileToMinio(attachment.data, getAuthHeader(request))
      }))
    )

    const recordInCorrectionRequestedState = await toCorrectionRequested(
      record,
      practitioner,
      practitionerOfficeId,
      correctionDetails,
      proofOfLegalCorrectionAttachments,
      paymentAttachmentUrl
    )

    await sendBundleToHearth(recordInCorrectionRequestedState)
    await createNewAuditEvent(recordInCorrectionRequestedState, token)
    await indexBundle(recordInCorrectionRequestedState, token)

    const recordSpecificToken = await getRecordSpecificToken(
      token,
      request.headers,
      getComposition(recordInCorrectionRequestedState).id
    )
    await notifyForAction({
      event: getEventType(recordInCorrectionRequestedState),
      action: 'request-correction',
      record,
      headers: {
        ...request.headers,
        authorization: `Bearer ${recordSpecificToken.access_token}`
      }
    })

    return recordInCorrectionRequestedState
  }
})
