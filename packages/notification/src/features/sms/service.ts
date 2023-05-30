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
  COUNTRY_CONFIG_URL,
  USER_NOTIFICATION_DELIVERY_METHOD
} from '@notification/constants'
import { logger } from '@notification/logger'

export async function notifyCountryConfig(
  templateName: string,
  recipient: string,
  variables: Record<string, string>,
  token: string,
  locale: string,
  convertUnicode?: boolean
) {
  const notificationType = USER_NOTIFICATION_DELIVERY_METHOD
  const url = `${COUNTRY_CONFIG_URL}/notification`
  try {
    logger.info(
      `Sending the following message: "${templateName}" to ${recipient}`
    )
    logger.info('Notifying the country config with above payload')
    return await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        type: notificationType,
        templateName,
        recipient,
        locale,
        variables,
        convertUnicode
      }),
      headers: {
        'Content-Type': 'application/json',
        authorization: token
      }
    })
  } catch (error) {
    logger.error(error)
    throw error
  }
}
