import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { unauthorized } from 'boom'

import User, { IUserModel } from '@user-mgnt/model/user'
import { generatePasswordHash } from '@user-mgnt/utils/password'

interface IVerifyPayload {
  mobile: string
  password: string
}

interface IVerifyResponse {
  scope: string[]
  id: string
}

export default async function verifyPassHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { mobile, password } = request.payload as IVerifyPayload

  // tslint:disable-next-line
  const user: IUserModel | null = await User.findOne({ mobile })

  if (!user) {
    // Don't return a 404 as this gives away that this user account exists
    throw unauthorized()
  }

  if (generatePasswordHash(password, user.salt) !== user.passwordHash) {
    throw unauthorized()
  }

  const response: IVerifyResponse = { scope: user.scope, id: user.id }

  return response
}

export const requestSchema = Joi.object({
  mobile: Joi.string().required(),
  password: Joi.string().required()
})

export const responseSchema = Joi.object({
  scope: Joi.array().items(Joi.string()),
  id: Joi.string()
})
