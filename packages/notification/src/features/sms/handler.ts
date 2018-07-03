import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { internal } from 'boom'
import { sendSMS } from './service'

export interface IAuthPayload {
  msisdn: string
  message: string
}

export default async function smsHandler(
  request: Hapi.Request,
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
