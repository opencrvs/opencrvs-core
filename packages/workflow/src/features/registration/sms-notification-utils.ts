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
import { COUNTRY_CONFIG_URL } from '@workflow/constants'
import { logger } from '@opencrvs/commons'

type EventNotificationFlags = {
  'sent-notification'?: boolean
  'sent-notification-for-review'?: boolean
  'sent-for-approval'?: boolean
  registered?: boolean
  'sent-for-updates'?: boolean
}

type NotificationFlags = {
  BIRTH?: EventNotificationFlags
  DEATH?: EventNotificationFlags
  MARRIAGE?: EventNotificationFlags
}

export async function getInformantSMSNotification(token: string) {
  try {
    const recordNotificationURL = new URL(
      'record-notification',
      COUNTRY_CONFIG_URL
    ).toString()
    const res = await fetch(recordNotificationURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    return (await res.json()) as NotificationFlags
  } catch (err) {
    logger.error(`Unable to get informant SMS Notifications for error : ${err}`)
    throw err
  }
}
