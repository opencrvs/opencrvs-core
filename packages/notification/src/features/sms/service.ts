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

import { COUNTRY_CONFIG_URL } from '@notification/constants'
import { logger } from '@notification/logger'

export async function notifyCountryConfig(
  templateName: {
    email?: string
    sms?: string
  },
  recipient: {
    email?: string | null
    sms?: string | null
  },
  type: 'user' | 'informant',
  variables: Record<string, unknown>,
  token: string,
  locale: string,
  convertUnicode?: boolean
) {
  const url = `${COUNTRY_CONFIG_URL}/notification`
  try {
    logger.info(
      `Sending the following message template "${templateName}" from notifyCountryConfig`
    )
    return await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        templateName,
        recipient,
        type,
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
