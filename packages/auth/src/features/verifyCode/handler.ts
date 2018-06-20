import * as Hapi from 'hapi'
import * as Joi from 'joi'

interface IVerifyPayload {
  nonce: string
  code: string
}

interface IVerifyResponse {
  token: string
}

export default function authenticateHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IVerifyPayload
  // @ts-ignore
  const code = payload.code
  // TODO OCRVS-327
  const response: IVerifyResponse = { token: 'xyz.abc.sig' }
  return response
}

export const requestSchema = Joi.object({
  nonce: Joi.string(),
  code: Joi.string()
})
export const responseSchma = Joi.object({
  token: Joi.string()
})
