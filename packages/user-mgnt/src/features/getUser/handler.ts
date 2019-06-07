import * as Hapi from 'hapi'
import { unauthorized } from 'boom'
import User, { IUserModel } from '@user-mgnt/model/user'

interface IVerifyPayload {
  userId: string
}

export default async function getUser(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { userId } = request.payload as IVerifyPayload

  const user: IUserModel | null = await User.findOne({ _id: userId })

  if (!user) {
    // Don't return a 404 as this gives away that this user account exists
    throw unauthorized()
  }
  return user
}
