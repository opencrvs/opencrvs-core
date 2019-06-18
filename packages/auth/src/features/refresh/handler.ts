import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { unauthorized } from 'boom'
import { verifyToken } from '@auth/features/authenticate/service'
import { refreshToken } from '@auth/features/refresh/service'

interface IRefreshPayload {
  nonce: string
  token: string
}

export default async function refreshHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { token } = request.payload as IRefreshPayload

  let decoded

  try {
    decoded = verifyToken(token)
  } catch (err) {
    return unauthorized()
  }

  const newToken = await refreshToken(decoded)
  return { token: newToken }
}

export const requestSchema = Joi.object({
  nonce: Joi.string(),
  token: Joi.string()
})
export const responseSchma = Joi.object({
  token: Joi.string()
})
