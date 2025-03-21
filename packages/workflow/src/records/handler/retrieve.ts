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
import * as z from 'zod'
import { validateRequest } from '@workflow/utils/index'
import { getValidRecordById } from '@workflow/records/index'
import { getToken } from '@workflow/utils/auth-utils'
import { toRetrieved } from '@workflow/records/state-transitions'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { auditEvent } from '@workflow/records/audit'

export async function retrieveRecordHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = validateRequest(
    z.object({
      id: z.string()
    }),
    request.payload
  )

  const token = getToken(request)
  // Task history is fetched rather than the task only
  const record = await getValidRecordById(payload.id, token, true)

  const [retrievedRecord, changedResources] = await toRetrieved(record, token)

  // Here the sent bundle is saved with task only
  await sendBundleToHearth(changedResources)
  await auditEvent('downloaded', retrievedRecord, token)

  return retrievedRecord
}
