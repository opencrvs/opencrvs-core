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
import { Request, ResponseToolkit } from '@hapi/hapi'
import { getTrackingId, InProgressRecord } from '@opencrvs/commons/types'
import { sendNotification } from '@notification/features/sms/utils'
import { messageKeys } from '@notification/i18n/messages'
import {
  getOfficeName,
  getRegistrationLocation
} from '@notification/features/utils'
import {
  getContactEmail,
  getContactPhoneNo,
  getInformantName
} from '@notification/features/utilsForPartiallyCompletedRecord'

export async function birthInProgressNotification(
  req: Request,
  h: ResponseToolkit
) {
  const inProgressRecord = req.payload as InProgressRecord
  await sendNotification(
    {
      sms: messageKeys.birthInProgressNotification,
      email: messageKeys.birthInProgressNotification
    },
    {
      sms: getContactPhoneNo(inProgressRecord),
      email: getContactEmail(inProgressRecord)
    },
    'informant',
    {
      trackingId: getTrackingId(inProgressRecord),
      crvsOffice: getOfficeName(inProgressRecord),
      registrationLocation: getRegistrationLocation(inProgressRecord),
      informantName: getInformantName(inProgressRecord)
    }
  )
  return h.response().code(200)
}

export async function deathInProgressNotification(
  req: Request,
  h: ResponseToolkit
) {
  const inProgressRecord = req.payload as InProgressRecord
  await sendNotification(
    {
      sms: messageKeys.deathInProgressNotification,
      email: messageKeys.deathInProgressNotification
    },
    {
      sms: getContactPhoneNo(inProgressRecord),
      email: getContactEmail(inProgressRecord)
    },
    'informant',
    {
      trackingId: getTrackingId(inProgressRecord),
      crvsOffice: getOfficeName(inProgressRecord),
      registrationLocation: getRegistrationLocation(inProgressRecord),
      informantName: getInformantName(inProgressRecord)
    }
  )
  return h.response().code(200)
}
