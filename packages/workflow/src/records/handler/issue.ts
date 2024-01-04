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
import { changeState, IssuedRecord } from '@opencrvs/commons/types'
import { createRoute } from '@workflow/states'
import { validateRequest } from '@workflow/utils'
import { getToken } from '@workflow/utils/authUtils'
import { getLoggedInPractitionerResource } from '@workflow/features/user/utils'
import { IssueRequestSchema } from '@workflow/records/validations'
import { toIssued } from '@workflow/records/state-transitions'
import {
  mergeBundles,
  sendBundleToHearth,
  toSavedBundle
} from '@workflow/records/fhir'

export const issueRoute = createRoute({
  method: 'POST',
  path: '/records/{recordId}/issue-record',
  allowedStartStates: ['CERTIFIED'],
  action: 'ISSUE',
  handler: async (request, record): Promise<IssuedRecord> => {
    const token = getToken(request)
    const { certificate, event } = validateRequest(
      IssueRequestSchema,
      request.payload
    )

    const unsavedChangedResources = await toIssued(
      record,
      await getLoggedInPractitionerResource(token),
      event,
      certificate
    )

    const responseBundle = await sendBundleToHearth(unsavedChangedResources)
    const changedResources = toSavedBundle(
      unsavedChangedResources,
      responseBundle
    )

    const issuedRecord = changeState(
      mergeBundles(record, changedResources),
      'ISSUED'
    )
    return issuedRecord
  }
})
