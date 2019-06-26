import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { unauthorized } from 'boom'

import User, { IUserModel } from '@user-mgnt/model/user'
import { generateHash } from '@user-mgnt/utils/hash'

interface IVerifyPayload {
  username: string
  password: string
}

interface IVerifyResponse {
  mobile: string
  scope: string[]
  status: string
  id: string
}

export default async function verifyPassHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { username, password } = request.payload as IVerifyPayload

  // tslint:disable-next-line
  const user: IUserModel | null = await User.findOne({ username })

  if (!user) {
    // Don't return a 404 as this gives away that this user account exists
    throw unauthorized()
  }

  if (generateHash(password, user.salt) !== user.passwordHash) {
    throw unauthorized()
  }

  const response: IVerifyResponse = {
    mobile: user.mobile,
    scope: user.scope,
    status: user.status,
    id: user.id
  }

  return response
}

export const requestSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
})

export const responseSchema = Joi.object({
  mobile: Joi.string(),
  scope: Joi.array().items(Joi.string()),
  status: Joi.string(),
  id: Joi.string()
})
