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
import { getToken } from '@workflow/utils/auth-utils'
import * as Hapi from '@hapi/hapi'
import { getRecordById } from '@workflow/records/index'
import { indexBundle } from '@workflow/records/search'
import { toUpserted } from '@workflow/records/state-transitions'
import { SupportedPatientIdentifierCode } from '@opencrvs/commons/types'

interface IdentifierInput {
  type: SupportedPatientIdentifierCode
  value: string
}
export interface EventRegistrationPayload {
  trackingId: string
  registrationNumber: string
  identifiers: IdentifierInput[]
}

export async function upsertRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const token = getToken(request)
  const compositionId = request.params.id
  const { identifiers } = request.payload as EventRegistrationPayload

  const savedRecord = await getRecordById(
    compositionId,
    request.headers.authorization,
    [
      'ARCHIVED',
      'CERTIFIED',
      'CORRECTION_REQUESTED',
      'IN_PROGRESS',
      'READY_FOR_REVIEW',
      'ISSUED',
      'REGISTERED',
      'REJECTED',
      'VALIDATED',
      'WAITING_VALIDATION'
    ],
    true
  )
  if (!savedRecord) {
    throw new Error(
      'Could not find record with composition id: ' + compositionId
    )
  }

  const upsertedRecord = toUpserted(savedRecord, identifiers)

  await indexBundle(upsertedRecord, token)
  // TBD: audit event

  return h.response(upsertedRecord).code(200)
}
