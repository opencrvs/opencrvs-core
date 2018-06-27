import * as Hapi from 'hapi'
import * as Joi from 'joi'
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
  await sendSMS(request, payload)
  return 'OK'
}

export const requestSchema = Joi.object({
  msisdn: Joi.string().required(),
  message: Joi.string().required()
})
