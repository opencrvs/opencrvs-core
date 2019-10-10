import { NON_UNICODED_LANGUAGES } from '@notification/constants'
import { HapiRequest } from '@notification/features/sms/handler'
import { internal } from 'boom'
import { sendSMS } from '@notification/features/sms/service'

interface ISMSMessagePayload {
  name?: string
  trackingid?: string
  username?: string
  password?: string
}

export async function buildAndSendSMS(
  request: HapiRequest,
  msisdn: string,
  messageKey: string,
  messagePayload: ISMSMessagePayload
) {
  try {
    return await sendSMS(
      msisdn,
      request.i18n.__(messageKey, messagePayload),
      /* send unicoded sms if provided local is not in non unicoded set */
      NON_UNICODED_LANGUAGES.indexOf(request.i18n.getLocale()) < 0
    )
  } catch (err) {
    return internal(err)
  }
}
