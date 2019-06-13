import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { unauthorized } from 'boom'
import User, { IUserModel } from '@user-mgnt/model/user'

interface IVerifyPayload {
  userId: string
  practitionerId: string
}

export default async function getUser(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { userId, practitionerId } = request.payload as IVerifyPayload

  let criteria = {}
  if (userId) {
    criteria = { ...criteria, _id: userId }
  }
  if (practitionerId) {
    criteria = { ...criteria, practitionerId }
  }
  // tslint:disable-next-line
  const user: IUserModel | null = await User.findOne(criteria)

  if (!user) {
    // Don't return a 404 as this gives away that this user account exists
    throw unauthorized()
  }
  return user
}

export const getUserRequestSchema = Joi.object({
  userId: Joi.string().optional(),
  practitionerId: Joi.string().optional()
})
