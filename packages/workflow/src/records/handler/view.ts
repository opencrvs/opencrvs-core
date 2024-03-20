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
import { getToken } from '@workflow/utils/auth-utils'
import { getValidRecordById } from '@workflow/records/index'
import { Bundle } from '@opencrvs/commons/types'
import { toViewed } from '@workflow/records/state-transitions'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { auditEvent } from '@workflow/records/audit'

export async function viewRecordHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const token = getToken(request)
  const recordId = request.params.id
  const record = await getValidRecordById(recordId, token)

  const viewedRecord = await toViewed(record, token)

  const viewedRecordWithTaskOnly: Bundle = {
    ...viewedRecord,
    entry: [viewedRecord.entry.find((e) => e.resource.resourceType === 'Task')!]
  }

  await sendBundleToHearth(viewedRecordWithTaskOnly)
  await auditEvent('viewed', viewedRecord, token)

  return viewedRecord
}
