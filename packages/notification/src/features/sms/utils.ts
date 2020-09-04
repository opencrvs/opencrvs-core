/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { NON_UNICODED_LANGUAGES } from '@notification/constants'
import { HapiRequest } from '@notification/features/sms/handler'
import { internal } from '@hapi/boom'
import { sendSMS } from '@notification/features/sms/service'

interface ISendSMSPayload {
  name?: string
  authCode?: string
  trackingId?: string
  username?: string
  password?: string
  crvsOffice?: string
  registrationNumber?: string
}

export async function buildAndSendSMS(
  request: HapiRequest,
  msisdn: string,
  messageKey: string,
  messagePayload: ISendSMSPayload
) {
  try {
    return await sendSMS(
      msisdn,
      request.i18n.__(messageKey, messagePayload),
      /* send unicoded sms if provided local is not in non unicoded set */
      NON_UNICODED_LANGUAGES.indexOf(request.i18n.getLocale()) < 0
    )
  } catch (err) {
    return internal(err)
  }
}
