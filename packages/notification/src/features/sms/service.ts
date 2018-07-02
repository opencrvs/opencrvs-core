import fetch from 'node-fetch'
import { stringify } from 'querystring'

import {
  SMS_PROVIDER,
  CLICKATELL_API_ID,
  CLICKATELL_PASSWORD,
  CLICKATELL_USER
} from 'src/constants'
import { logger } from 'src/logger'

async function sendSMSClickatell(msisdn: string, message: string) {
  const params = {
    user: CLICKATELL_USER,
    password: CLICKATELL_PASSWORD,
    api_id: CLICKATELL_API_ID,
    to: msisdn,
    text: message
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

export async function sendSMS(msisdn: string, message: string) {
  switch (SMS_PROVIDER) {
    case 'clickatell':
      return sendSMSClickatell(msisdn, message)
    default:
      throw new Error(`Unknown sms provider ${SMS_PROVIDER}`)
  }
}
