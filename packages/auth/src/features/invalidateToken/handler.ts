import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { internal } from 'boom'
import { invalidateToken } from '@auth/features/invalidateToken/service'

interface IInvalidateTokenPayload {
  token: string
}

export default async function invalidateTokenHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { token } = request.payload as IInvalidateTokenPayload

  try {
    await invalidateToken(token)
  } catch (err) {
    throw internal('Failed to invalidate token', err)
  }

  return {}
}

export const reqInvalidateTokenSchema = Joi.object({
  token: Joi.string()
})
