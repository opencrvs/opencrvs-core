import * as Hapi from 'hapi'
import { internal } from 'boom'
import { sendSMS } from './service'
import { NON_UNICODED_LOCALES } from 'src/constants'

export type HapiRequest = Hapi.Request & {
  i18n: {
    __: (messageKey: string, values?: object) => string
    getLocale: () => string
  }
}
interface ISMSPayload {
  msisdn: string
}

interface IAuthPayload extends ISMSPayload {
  message: string
}

export async function smsHandler(
  request: HapiRequest,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IAuthPayload
  try {
    await sendSMS(payload.msisdn, payload.message)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

interface IDeclarationPayload extends ISMSPayload {
  trackingid: string
  name: string
}

export async function sendBirthDeclarationConfirmation(
  request: HapiRequest,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IDeclarationPayload
  try {
    await sendSMS(
      payload.msisdn,
      request.i18n.__('birthDeclarationNotification', {
        name: payload.name,
        trackingid: payload.trackingid
      }),
      /* send unicoded sms if provided local is not in non unicoded set */
      NON_UNICODED_LOCALES.indexOf(request.i18n.getLocale()) < 0
    )
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}
