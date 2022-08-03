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

import { COUNTRY_CONFIG_URL } from '@notification/constants'
import { logger } from '@notification/logger'

export async function notifyCountryConfig(
  msisdn: string,
  message: string,
  token: string,
  convertUnicode?: boolean
) {
  logger.info(`Sending the following message: "${message}" to ${msisdn}`)
  logger.info('Notifying the country config with above payload')

  const url = `${COUNTRY_CONFIG_URL}/notification`
  try {
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        msisdn,
        message,
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
