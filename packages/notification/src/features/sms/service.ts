import { Request } from 'hapi'
import { internal } from 'boom'
import fetch from 'node-fetch'

import {
  SMS_PROVIDER,
  CLICKATELL_API_ID,
  CLICKATELL_PASSWORD,
  CLICKATELL_USER
} from 'src/constants'
import { IAuthPayload } from 'src/features/sms/handler'

async function sendSMSClickatell(
  request: Request,
  { msisdn, message }: IAuthPayload
) {
  const escapeSpaces = (str: string) => str.replace(' ', '+')

  request.log(['info', 'sms'], `Sending SMS to '${msisdn}' using Clickatell`)

  const url =
    `http://api.clickatell.com/http/sendmsg?api_id=${CLICKATELL_API_ID}&` +
    `user=${CLICKATELL_USER}&password=${CLICKATELL_PASSWORD}&` +
    `to=${msisdn}&text=${escapeSpaces(message)}`

  let res
  try {
    res = await fetch(url)
  } catch (err) {
    request.log(['error', 'sms'], err)
    throw internal('Could not connect to clickatell provider', err)
  }

  const body = await res.text()
  if (body.includes('ERR')) {
    throw internal(body)
  }
  request.log(
    ['info', 'sms'],
    `Received success response from Clickatell: ${body}`
  )
}

export async function sendSMS(request: Request, options: IAuthPayload) {
  switch (SMS_PROVIDER) {
    case 'clickatell':
      return sendSMSClickatell(request, options)
    default:
      throw internal(`Unknown sms provider ${SMS_PROVIDER}`)
  }
}
