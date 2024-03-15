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
import fetch from 'node-fetch'
import { getEventType } from '@workflow/features/registration/utils'
import { EVENT_TYPE, ValidRecord } from '@opencrvs/commons/types'
import { NOTIFICATION_SERVICE_URL } from '@workflow/constants'
import {
  getInformantSMSNotification,
  InformantNotificationName
} from '@workflow/features/registration/sms-notification-utils'
import { internal } from '@hapi/boom'
import { RecordEvent } from './record-events'

type NotificationEvent = Extract<
  RecordEvent,
  'sent-notification' | 'sent-notification-for-review' | 'registered'
>

export async function sendNotification(
  action: NotificationEvent,
  bundle: ValidRecord,
  authToken: string
) {
  const eventType = getEventType(bundle).toLowerCase()
  const res = await fetch(
    new URL(`/${eventType}/${action}`, NOTIFICATION_SERVICE_URL).href,
    {
      method: 'POST',
      body: JSON.stringify(bundle),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    }
  )
  if (!res.ok) {
    throw internal(
      `Forwarding bundle to notification service failed with [${
        res.status
      }] body: ${await res.text()}`
    )
  }
  return res
}

//NOT SENDING ANY NOTIFICATIONS if failed to retrieve flags
async function getNotificationFlags(token: string) {
  try {
    return await getInformantSMSNotification(token)
  } catch {
    return []
  }
}

type SupportedVitalEvents = Exclude<EVENT_TYPE, 'MARRIAGE'>

const MAPPING: Record<
  SupportedVitalEvents,
  Record<NotificationEvent, InformantNotificationName>
> = {
  [EVENT_TYPE.BIRTH]: {
    'sent-notification': InformantNotificationName.birthInProgressSMS,
    'sent-notification-for-review':
      InformantNotificationName.birthDeclarationSMS,
    registered: InformantNotificationName.birthRegistrationSMS
  },
  [EVENT_TYPE.DEATH]: {
    'sent-notification': InformantNotificationName.deathInProgressSMS,
    'sent-notification-for-review':
      InformantNotificationName.deathDeclarationSMS,
    registered: InformantNotificationName.deathRegistrationSMS
  }
}

export async function isNotificationEnabled(
  action: NotificationEvent,
  event: SupportedVitalEvents,
  token: string
) {
  const notificationFlags = await getNotificationFlags(token)
  return (
    notificationFlags.find(({ name }) => name === MAPPING[event][action])
      ?.enabled ?? false
  )
}
