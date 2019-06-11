import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { unauthorized } from 'boom'

import User, { IUserModel } from '@user-mgnt/model/user'

interface IVerifyPayload {
  userId: string
}

interface IVerifyResponse {
  mobile: string
}

export default async function getUserMobile(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { userId } = request.payload as IVerifyPayload
  // tslint:disable-next-line
  const user: IUserModel | null = await User.findById(userId)

  if (!user) {
    // Don't return a 404 as this gives away that this user account exists
    throw unauthorized()
  }

  const response: IVerifyResponse = { mobile: user.mobile }

  return response
}

export const requestSchema = Joi.object({
  userId: Joi.string().required()
})

export const responseSchema = Joi.object({
  mobile: Joi.string()
})
