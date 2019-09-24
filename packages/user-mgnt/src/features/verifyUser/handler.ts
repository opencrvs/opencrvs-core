import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { unauthorized } from 'boom'
import User, { IUserModel } from '@user-mgnt/model/user'

interface IVerifyPayload {
  mobile: string
}

interface IVerifyResponse {
  mobile: string
  scope: string[]
  id: string
}

export default async function verifyUserHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { mobile } = request.payload as IVerifyPayload

  // tslint:disable-next-line
  const user: IUserModel | null = await User.findOne({ mobile })

  if (!user) {
    // Don't return a 404 as this gives away that this user account exists
    throw unauthorized()
  }

  const response: IVerifyResponse = {
    mobile: user.mobile,
    scope: user.scope,
    id: user.id
  }

  return response
}

export const requestSchema = Joi.object({
  mobile: Joi.string().required()
})

export const responseSchema = Joi.object({
  mobile: Joi.string(),
  scope: Joi.array().items(Joi.string()),
  id: Joi.string()
})
