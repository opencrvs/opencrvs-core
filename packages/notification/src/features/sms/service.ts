import fetch from 'node-fetch'
import { stringify } from 'querystring'
import { Iconv } from 'iconv'

import {
  SMS_PROVIDER,
  CLICKATELL_API_ID,
  CLICKATELL_PASSWORD,
  CLICKATELL_USER,
  INFOBIP_API_KEY,
  INFOBIP_GATEWAY_ENDPOINT
} from '@notification/constants'
import { logger } from '@notification/logger'
import { convertToMSISDN } from '@notification/features/sms/utils'

async function sendSMSClickatell(
  msisdn: string,
  message: string,
  convertUnicode?: boolean
) {
  let params = {
    user: CLICKATELL_USER,
    password: CLICKATELL_PASSWORD,
    api_id: CLICKATELL_API_ID,
    to: convertToMSISDN(msisdn),
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
  logger.info('Sending a verification token', params)

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
    to: convertToMSISDN(to),
    text
  })
  const headers = {
    Authorization: `Basic ${INFOBIP_API_KEY}`,
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

export async function sendSMS(
  msisdn: string,
  message: string,
  convertUnicode?: boolean
) {
  switch (SMS_PROVIDER) {
    case 'clickatell':
      return sendSMSClickatell(msisdn, message, convertUnicode)
    case 'infobip':
      return sendSMSInfobip(msisdn, message)
    default:
      throw new Error(`Unknown sms provider ${SMS_PROVIDER}`)
  }
}
