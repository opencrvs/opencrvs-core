import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { internal } from 'boom'
import { sendSMS } from '@notification/features/sms/service'

export type HapiRequest = Hapi.Request & {
  i18n: {
    __: (messageKey: string, values?: object) => string
    getLocale: () => string
  }
}
export interface ISMSPayload {
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

export const requestSchema = Joi.object({
  msisdn: Joi.string().required(),
  message: Joi.string().required()
})
