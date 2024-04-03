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
import { APPLICATION_CONFIG_URL } from '@workflow/constants'
import fetch from 'node-fetch'
import { logger } from '@workflow/logger'

export enum InformantNotificationName {
  birthInProgressSMS = 'birthInProgressSMS',
  birthDeclarationSMS = 'birthDeclarationSMS',
  birthRegistrationSMS = 'birthRegistrationSMS',
  birthRejectionSMS = 'birthRejectionSMS',
  deathInProgressSMS = 'deathInProgressSMS',
  deathDeclarationSMS = 'deathDeclarationSMS',
  deathRegistrationSMS = 'deathRegistrationSMS',
  deathRejectionSMS = 'deathRejectionSMS'
}

interface IInformantSMSNotification {
  _id: string
  name: InformantNotificationName
  enabled: boolean
  updatedAt: number
  createdAt: number
}

export async function getInformantSMSNotification(token: string) {
  try {
    const informantSMSNotificationURL = new URL(
      'informantSMSNotification',
      APPLICATION_CONFIG_URL
    ).toString()
    const res = await fetch(informantSMSNotificationURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    return (await res.json()) as IInformantSMSNotification[]
  } catch (err) {
    logger.error(`Unable to get informant SMS Notifications for error : ${err}`)
    throw err
  }
}

export function isInformantSMSNotificationEnabled(
  informantSMSNotifications: IInformantSMSNotification[],
  name: InformantNotificationName
) {
  const isNotificationEnabled = informantSMSNotifications.find(
    (notification) => notification.name === name
  )?.enabled
  return Boolean(isNotificationEnabled)
}
