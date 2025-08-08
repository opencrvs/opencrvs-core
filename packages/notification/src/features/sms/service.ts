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

import { COUNTRY_CONFIG_URL } from '@notification/constants'
import { logger, maskEmail, maskSms } from '@opencrvs/commons'

export async function notifyCountryConfig(
  templateName: {
    email?: string
    sms?: string
  },
  recipient: {
    email?: string | null
    sms?: string | null
    bcc?: string[]
  },
  type: 'user' | 'informant',
  variables: Record<string, unknown>,
  locale: string,
  convertUnicode?: boolean
) {
  const url = `${COUNTRY_CONFIG_URL}/notification`
  try {
    logger.info(
      `Sending notification to countryconfig.

Template: ${JSON.stringify(templateName, null, 4)}
${recipient.email ? `Email: ${maskEmail(recipient.email)}` : ''}
${recipient.sms ? `SMS: ${maskSms(recipient.sms)}` : ''}
${recipient.bcc ? `Amount of recipients: ${recipient.bcc.length}` : ''}`
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
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    logger.error(error)
    throw error
  }
}
