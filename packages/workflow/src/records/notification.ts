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
} from '@workflow/features/registration/smsNotificationUtils'
import { internal } from '@hapi/boom'

type NotificationEvent = 'in-progress' | 'ready-for-review'

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

type SupportedEvents = Exclude<EVENT_TYPE, 'MARRIAGE'>

const MAPPING: Record<
  SupportedEvents,
  Record<NotificationEvent, InformantNotificationName>
> = {
  [EVENT_TYPE.BIRTH]: {
    'in-progress': InformantNotificationName.birthInProgressSMS,
    'ready-for-review': InformantNotificationName.birthDeclarationSMS
  },
  [EVENT_TYPE.DEATH]: {
    'in-progress': InformantNotificationName.deathInProgressSMS,
    'ready-for-review': InformantNotificationName.deathDeclarationSMS
  }
}

export async function isNotificationEnabled(
  action: NotificationEvent,
  event: SupportedEvents,
  token: string
) {
  const notificationFlags = await getNotificationFlags(token)
  return (
    notificationFlags.find(({ name }) => name === MAPPING[event][action])
      ?.enabled ?? false
  )
}
