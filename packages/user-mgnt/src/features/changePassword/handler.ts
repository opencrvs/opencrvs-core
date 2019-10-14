import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { unauthorized } from 'boom'
import User, { IUserModel } from '@user-mgnt/model/user'
import { generateHash } from '@user-mgnt/utils/hash'
import { logger } from '@user-mgnt/logger'

interface IChangePasswordPayload {
  userId: string
  password: string
}

export default async function changePasswordHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const userUpdateData = request.payload as IChangePasswordPayload

  const user: IUserModel | null = await User.findById(userUpdateData.userId)
  if (!user) {
    logger.error(
      `No user details found by given userid: ${userUpdateData.userId}`
    )
    // Don't return a 404 as this gives away that this user account exists
    throw unauthorized()
  }

  user.passwordHash = generateHash(userUpdateData.password, user.salt)

  try {
    await User.update({ _id: user._id }, user)
  } catch (err) {
    logger.error(err.message)
    // return 400 if there is a validation error when updating to mongo
    return h.response().code(400)
  }
  return h.response().code(200)
}

export const changePasswordRequestSchema = Joi.object({
  userId: Joi.string().required(),
  password: Joi.string().required()
})
