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
import { toTokenWithBearer } from '@opencrvs/commons'
import {
  RecordValidatedPayload,
  useExternalValidationQueue
} from '@opencrvs/commons/message-queue'
import {
  isWaitingExternalValidation,
  SupportedPatientIdentifierCode
} from '@opencrvs/commons/types'
import { REDIS_HOST } from '@workflow/constants'
import { writeMetricsEvent } from '@workflow/records/audit'
import { getRecordById } from '@workflow/records/index'
import {
  isNotificationEnabled,
  sendNotification
} from '@workflow/records/notification'
import { indexBundleWithTransaction } from '@workflow/records/search'
import { toRegistered } from '@workflow/records/state-transitions'
import { invokeWebhooks } from '@workflow/records/webhooks'
import { getToken } from '@workflow/utils/auth-utils'
import { getEventType } from './utils'

export async function markEventAsRegistered({
  registrationNumber,
  token,
  identifiers,
  recordId
}: RecordValidatedPayload) {
  const savedRecord = await getRecordById(
    recordId,
    toTokenWithBearer(token),
    ['WAITING_VALIDATION'],
    true
  )
  const transactionId = `confirm-registration-${recordId}`

  if (!savedRecord) {
    throw new Error(
      'Could not find record in primary database. This should never happen!'
    )
  }

  const bundle = isWaitingExternalValidation(savedRecord)
    ? await toRegistered(savedRecord, registrationNumber, identifiers, token)
    : savedRecord

  const event = getEventType(bundle)

  await indexBundleWithTransaction(bundle, token, transactionId)

  await writeMetricsEvent('registered', {
    record: bundle,
    authToken: token,
    transactionId: transactionId
  })

  if (await isNotificationEnabled('registered', event, token)) {
    await sendNotification('registered', bundle, token)
  }

  await invokeWebhooks({ bundle, token, event })

  return
}

const { recordValidated } = useExternalValidationQueue(REDIS_HOST)

type RecordValidatedHTTPPayload = {
  registrationNumber: string
  childIdentifiers: { type: SupportedPatientIdentifierCode; value: string }[]
  compositionId: string
  trackingId: string
}

export async function markEventAsRegisteredCallbackHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const token = getToken(request)
  const { registrationNumber, childIdentifiers, compositionId, trackingId } =
    request.payload as RecordValidatedHTTPPayload

  await recordValidated({
    recordId: compositionId,
    identifiers: childIdentifiers || [],
    registrationNumber,
    trackingId,
    token
  })

  return h.response().code(200)
}
