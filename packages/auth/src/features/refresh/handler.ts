import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { unauthorized } from 'boom'
import { verifyToken } from 'src/features/authenticate/service'
import { refreshToken } from './service'

interface IRefreshPayload {
  nonce: string
  token: string
}

interface IRefreshResponse {
  token: string
}

export default async function refreshHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { token } = request.payload as IRefreshPayload

  const decoded = await verifyToken(token)
  if (decoded.name !== 'TokenExpiredError') {
    const newToken = await refreshToken(decoded)
    const response: IRefreshResponse = { token: newToken }
    return response
  }
  return unauthorized()
}

export const requestSchema = Joi.object({
  nonce: Joi.string(),
  token: Joi.string()
})
export const responseSchma = Joi.object({
  token: Joi.string()
})
