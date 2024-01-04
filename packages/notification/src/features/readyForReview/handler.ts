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
import { sendNotification } from '@notification/features/sms/utils'
import { messageKeys } from '@notification/i18n/messages'
import {
  getContactEmail,
  getContactPhoneNo,
  getPersonName,
  getInformantName,
  getOfficeName,
  getRegistrationLocation
} from '@notification/features/utils'
import { getTrackingId, ReadyForReviewRecord } from '@opencrvs/commons/types'

export async function birthReadyForReviewNotification(
  req: Request,
  h: ResponseToolkit
) {
  const readyForReviewRecord = req.payload as ReadyForReviewRecord
  await sendNotification(
    req,
    {
      sms: messageKeys.birthDeclarationNotification,
      email: messageKeys.birthDeclarationNotification
    },
    {
      sms: getContactPhoneNo(readyForReviewRecord),
      email: getContactEmail(readyForReviewRecord)
    },
    'informant',
    {
      trackingId: getTrackingId(readyForReviewRecord),
      crvsOffice: getOfficeName(readyForReviewRecord),
      registrationLocation: getRegistrationLocation(readyForReviewRecord),
      name: getPersonName(readyForReviewRecord, 'child'),
      informantName: getInformantName(readyForReviewRecord)
    }
  )
  return h.response().code(200)
}

export async function deathReadyForReviewNotification(
  req: Request,
  h: ResponseToolkit
) {
  const readyForReviewRecord = req.payload as ReadyForReviewRecord
  await sendNotification(
    req,
    {
      sms: messageKeys.deathDeclarationNotification,
      email: messageKeys.deathDeclarationNotification
    },
    {
      sms: getContactPhoneNo(readyForReviewRecord),
      email: getContactEmail(readyForReviewRecord)
    },
    'informant',
    {
      trackingId: getTrackingId(readyForReviewRecord),
      crvsOffice: getOfficeName(readyForReviewRecord),
      registrationLocation: getRegistrationLocation(readyForReviewRecord),
      name: getPersonName(readyForReviewRecord, 'deceased'),
      informantName: getInformantName(readyForReviewRecord)
    }
  )
  return h.response().code(200)
}
