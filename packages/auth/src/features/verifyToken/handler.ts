import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { verifyToken } from '@auth/features/verifyToken/service'
import { internal } from 'boom'

interface IVerifyTokenPayload {
  token: string
}

export default async function verifyTokenHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { token } = request.payload as IVerifyTokenPayload

  let valid = false
  try {
    valid = await verifyToken(token)
  } catch (err) {
    throw internal('Failed to verifyToken token', err)
  }

  return { valid }
}

export const reqVerifyTokenSchema = Joi.object({
  token: Joi.string()
})

export const resVerifyTokenSchema = Joi.object({
  valid: Joi.boolean()
})
