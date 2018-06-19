import * as Hapi from 'hapi'
import * as Joi from 'joi'

import User from '../../model/user'
import { generatePasswordHash } from '../../utils/password'

interface IVerifyPayload {
  mobile: string
  password: string
}

interface IVerifyResponse {
  role: string
}

export default async function verifyPassHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { mobile, password } = request.payload as IVerifyPayload

  if (!mobile || !password) {
    return h.response().code(400)
  }

  const user: any = await User.findOne({ mobile })

  if (!user) {
    // Don't return a 404 as this gives away that this user account exists
    return h.response().code(400)
  }

  if (generatePasswordHash(password, user.salt) !== user.passwordHash) {
    return h.response().code(400)
  }

  const response: IVerifyResponse = { role: user.role }
  return response
}

export const requestSchema = Joi.object({
  mobile: Joi.string(),
  password: Joi.string()
})

export const responseSchema = Joi.object({
  role: Joi.string()
})
