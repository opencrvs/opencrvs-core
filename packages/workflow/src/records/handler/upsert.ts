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
import { getEventType } from './utils'
import { indexBundle } from '@workflow/records/search'
import { auditEvent } from '@workflow/records/audit'
import {
  isNotificationEnabled,
  sendNotification
} from '@workflow/records/notification'
import { invokeWebhooks } from '@workflow/records/webhooks'
import {
  SupportedPatientIdentifierCode,
  RegisteredRecord
} from '@opencrvs/commons/types'

export interface EventRegistrationPayload {
  trackingId: string
  registrationNumber: string
  error: string
  identifiers?: {
    type: SupportedPatientIdentifierCode
    value: string
  }[]
}

export async function upsertRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const token = getToken(request)
  const compositionId = request.params.id
  const { error } = request.payload as EventRegistrationPayload

  if (error) {
    throw new Error(`Callback triggered with an error: ${error}`)
  }

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
    throw new Error('Could not find record in elastic search!')
  }

  const bundle = savedRecord as RegisteredRecord
  const event = getEventType(bundle)

  await indexBundle(bundle, token)
  await auditEvent('registered', bundle, token)

  if (await isNotificationEnabled('registered', event, token)) {
    await sendNotification('registered', bundle, token)
  }

  await invokeWebhooks({ bundle, token, event })

  return h.response(bundle).code(200)
}