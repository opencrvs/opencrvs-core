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
import { toUpsertRegistrationIdentifier } from '@workflow/records/state-transitions'
import { getEventType } from './utils'
import { indexBundle } from '@workflow/records/search'
import { auditEvent } from '@workflow/records/audit'
import {
  isNotificationEnabled,
  sendNotification
} from '@workflow/records/notification'
import { invokeWebhooks } from '@workflow/records/webhooks'
import { SupportedPatientIdentifierCode } from '@opencrvs/commons/types'

export interface UpsertRegistrationPayload {
  trackingId: string
  registrationNumber: string
  error?: string
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
  const { registrationNumber, error, identifiers } =
    request.payload as UpsertRegistrationPayload

  if (error) {
    throw new Error(`Upsert operation failed with error: ${error}`)
  }

  const savedRecord = await getRecordById(
    compositionId,
    request.headers.authorization,
    ['IN_PROGRESS'],
    true
  )
  if (!savedRecord) {
    throw new Error('Could not find record in elastic search!')
  }

  const bundle = await toUpsertRegistrationIdentifier(
    request,
    savedRecord,
    registrationNumber,
    token,
    identifiers
  )

  const event = getEventType(bundle)

  // Index the updated bundle
  await indexBundle(bundle, token)

  // Audit the event
  await auditEvent('registered', bundle, token)

  // Send notifications if enabled
  if (await isNotificationEnabled('registered', event, token)) {
    await sendNotification('registered', bundle, token)
  }

  // Invoke webhooks for the updated bundle
  await invokeWebhooks({ bundle, token, event })

  // Return the updated bundle
  return h.response(bundle).code(200)
}
