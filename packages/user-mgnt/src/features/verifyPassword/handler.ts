import * as Hapi from 'hapi'
import * as Joi from 'joi'

interface IVerifyPayload {
  mobile: string
  password: string
}

interface IVerifyResponse {
  role: string
}

export default function verifyPassHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  // @ts-ignore
  const payload = request.payload as IVerifyPayload
  // TODO OCRVS-328
  const response: IVerifyResponse = { role: 'test' }
  return response
}

export const requestSchema = Joi.object({
  mobile: Joi.string(),
  password: Joi.string()
})

export const responseSchema = Joi.object({
  role: Joi.string()
})
