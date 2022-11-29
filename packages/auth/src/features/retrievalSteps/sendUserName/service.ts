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
import fetch from 'node-fetch'
import {
  NOTIFICATION_SERVICE_URL,
  JWT_ISSUER,
  APPLICATION_CONFIG_URL
} from '@auth/constants'
import { resolve, URL } from 'url'
import { createToken } from '@auth/features/authenticate/service'
import { logger } from '@auth/logger'

export async function sendUserName(mobile: string, username: string) {
  const token = await createToken(
    'auth',
    ['sysadmin'],
    ['opencrvs:notification-user', 'opencrvs:config-user'],
    JWT_ISSUER
  )
  const config = await getApplicationConfig(token)

  if (!config.SMS_USERNAME_REMINDER_ENABLED) {
    logger.info('Username reminder SMS messaging is disabled')
    return
  }

  const url = resolve(NOTIFICATION_SERVICE_URL, '/retrieveUserNameSMS')
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ msisdn: mobile, username }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  if (res.status !== 200) {
    throw Error(`Unable to send username`)
  }
}

async function getApplicationConfig(authToken: string): Promise<{
  SMS_USERNAME_REMINDER_ENABLED: boolean
}> {
  return fetch(new URL('/config', APPLICATION_CONFIG_URL).toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  })
    .then((response) => {
      return response.json()
    })
    .then((response) => {
      return response.config
    })
    .catch((error) => {
      return Promise.reject(
        new Error(`Application config request failed: ${error.message}`)
      )
    })
}
