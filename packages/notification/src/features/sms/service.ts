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
import { stringify } from 'querystring'
import { Iconv } from 'iconv'

import {
  SMS_PROVIDER,
  CLICKATELL_API_ID,
  CLICKATELL_PASSWORD,
  CLICKATELL_USER,
  INFOBIP_API_KEY,
  INFOBIP_SENDER_ID,
  INFOBIP_GATEWAY_ENDPOINT,
  COUNTRY_CONFIG_URL
} from '@notification/constants'
import { logger } from '@notification/logger'
import { INotificationPayload } from '@client/utils/referenceApi'

async function sendSMSClickatell(
  msisdn: string,
  message: string,
  convertUnicode?: boolean
) {
  let params = {
    user: CLICKATELL_USER,
    password: CLICKATELL_PASSWORD,
    api_id: CLICKATELL_API_ID,
    to: msisdn,
    text: message,
    unicode: 0
  }
  /* character limit for unicoded sms is 70 otherwise 160 */
  if (convertUnicode) {
    params = {
      ...params,
      text: new Iconv('UTF-8', 'UCS-2BE').convert(message).toString('hex'),
      unicode: 1
    }
  }
  logger.info('Sending an sms', params)

  const url = `https://api.clickatell.com/http/sendmsg?${stringify(params)}`

  let res
  try {
    res = await fetch(url)
  } catch (err) {
    logger.error(err)
    throw err
  }

  const body = await res.text()
  if (body.includes('ERR')) {
    logger.error(body)
    throw new Error(body)
  }
  logger.info('Received success response from Clickatell: Success')
}

async function sendSMSInfobip(to: string, text: string) {
  const body = JSON.stringify({
    messages: [
      {
        destinations: [
          {
            to
          }
        ],
        from: INFOBIP_SENDER_ID,
        text
      }
    ]
  })
  const headers = {
    Authorization: `App ${INFOBIP_API_KEY}`,
    'Content-Type': 'application/json'
  }

  let response
  try {
    response = await fetch(INFOBIP_GATEWAY_ENDPOINT, {
      method: 'POST',
      body,
      headers
    })
  } catch (error) {
    logger.error(error)
    throw error
  }

  const responseBody = await response.text()
  logger.info(`Response from Infobip: ${JSON.stringify(responseBody)}`)
  if (!response.ok) {
    logger.error(`Failed to send sms to ${to}`)
    throw new Error(`Failed to send sms to ${to}`)
  }
}

export async function notifyCountryConfig(
  msisdn: string,
  message: string,
  convertUnicode?: boolean
) {
  logger.info('Using the following provider: ', SMS_PROVIDER)
  logger.info('Sending the following message: ', message)
  logger.info('Notifying the country config with above payload')

  const url = `${COUNTRY_CONFIG_URL}/notification`
  try {
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        msisdn,
        message
      })
    })
  } catch (error) {
    logger.error(error)
    throw error
  }
}
