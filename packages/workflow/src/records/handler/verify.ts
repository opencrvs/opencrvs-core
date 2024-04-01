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
import * as z from 'zod'
import * as Hapi from '@hapi/hapi'
import { getToken } from '@workflow/utils/auth-utils'
import { getRecordById } from '@workflow/records/index'
import { sendBundleToHearth } from '@workflow/records/fhir'
import { toVerified } from '@workflow/records/state-transitions'
import { validateRequest } from '@workflow/features/correction/routes'

export async function verifyRecordHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const token = getToken(request)
  const recordId = request.params.id
  const record = await getRecordById(
    recordId,
    token,
    ['REGISTERED', 'ISSUED'],
    true
  )

  const payload = validateRequest(
    z.object({
      'x-real-ip': z.string()
    }),
    request.payload
  )

  const { verifiedRecord, verifiedRecordWithTaskOnly } = toVerified(
    record,
    payload['x-real-ip']
  )

  await sendBundleToHearth(verifiedRecordWithTaskOnly)
  return verifiedRecord
}
