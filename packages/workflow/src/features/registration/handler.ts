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
import { getToken } from '@workflow/utils/authUtils'
import * as Hapi from '@hapi/hapi'
import { getEventType } from '@workflow/features/registration/utils'
import { EVENT_TYPE } from '@opencrvs/commons/types'
import { getRecordById } from '@workflow/records/index'
import { toRegistered } from '@workflow/records/state-transitions'
import { getLoggedInPractitionerResource } from '@workflow/features/user/utils'
import { indexBundle } from '@workflow/records/search'
import {
  isNotificationEnabled,
  sendNotification
} from '@workflow/records/notification'
import { auditEvent } from '@workflow/records/audit'
import { sendBundleToHearth } from '@workflow/records/fhir'

export interface IEventRegistrationCallbackPayload {
  trackingId: string
  registrationNumber: string
  error: string
  compositionId: string
  childIdentifiers?: {
    type: string
    value: string
  }[]
}

export async function markEventAsRegisteredCallbackHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const token = getToken(request)
  const { registrationNumber, error, childIdentifiers, compositionId } =
    request.payload as IEventRegistrationCallbackPayload

  if (error) {
    throw new Error(`Callback triggered with an error: ${error}`)
  }

  const savedRecord = await getRecordById(
    compositionId,
    request.headers.authorization,
    ['WAITING_VALIDATION']
  )
  if (!savedRecord) {
    throw new Error('Could not find record in elastic search!')
  }
  const practitioner = await getLoggedInPractitionerResource(getToken(request))

  const event = getEventType(savedRecord)

  const registeredBundle = await toRegistered(
    request,
    savedRecord,
    practitioner,
    registrationNumber,
    childIdentifiers
  )
  await sendBundleToHearth(registeredBundle)
  await indexBundle(registeredBundle, getToken(request))
  await auditEvent('registered', registeredBundle, token)

  // Notification not implemented for marriage yet
  if (
    event !== EVENT_TYPE.MARRIAGE &&
    (await isNotificationEnabled('registered', event, token))
  ) {
    await sendNotification('registered', registeredBundle, token)
  }

  return h.response(registeredBundle).code(200)
}
