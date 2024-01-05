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
import { CertifiedRecord, changeState } from '@opencrvs/commons/types'
import { createRoute } from '@workflow/states'
import { validateRequest } from '@workflow/utils'
import { getToken } from '@workflow/utils/authUtils'
import { getLoggedInPractitionerResource } from '@workflow/features/user/utils'
import { requestSchema } from '@workflow/records/validations/certify'
import { toCertified } from '@workflow/records/state-transitions'
import { uploadBase64ToMinio } from '@workflow/documents'
import { getAuthHeader } from '@opencrvs/commons/http'
import {
  mergeBundles,
  sendBundleToHearth,
  toSavedBundle
} from '@workflow/records/fhir'
import { indexBundle } from '@workflow/records/search'
import { auditEvent } from '@workflow/records/audit'

export const certifyRoute = createRoute({
  method: 'POST',
  path: '/records/{recordId}/certify-record',
  allowedStartStates: ['REGISTERED'],
  action: 'CERTIFY',
  handler: async (request, record): Promise<CertifiedRecord> => {
    const token = getToken(request)
    const {
      certificate: { data, ...certificateDetailsWithoutData },
      event
    } = validateRequest(requestSchema, request.payload)
    const certificateUrl = await uploadBase64ToMinio(
      data,
      getAuthHeader(request)
    )

    const unsavedChangedResources = await toCertified(
      record,
      await getLoggedInPractitionerResource(token),
      event,
      { ...certificateDetailsWithoutData, certificateUrl }
    )

    const responseBundle = await sendBundleToHearth(unsavedChangedResources)
    const changedResources = toSavedBundle(
      unsavedChangedResources,
      responseBundle
    )

    const certifiedRecord = changeState(
      mergeBundles(record, changedResources),
      'CERTIFIED'
    )

    await indexBundle(certifiedRecord, token)
    await auditEvent('mark-certified', certifiedRecord, token)

    return certifiedRecord
  }
})
