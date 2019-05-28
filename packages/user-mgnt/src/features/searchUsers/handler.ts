import * as Hapi from 'hapi'
import * as Joi from 'joi'

import User, { IUserModel } from 'src/model/user'

interface IVerifyPayload {
  username?: string
  mobile?: string
  role?: string
  active?: boolean
  count: number
  skip: number
  sortOrder: string
}

export default async function searchUsers(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const {
    username,
    mobile,
    role,
    active,
    count,
    skip,
    sortOrder
  } = request.payload as IVerifyPayload
  let criteria = {}
  if (username) {
    criteria = { ...criteria, username }
  }
  if (mobile) {
    criteria = { ...criteria, mobile }
  }
  if (role) {
    criteria = { ...criteria, role }
  }
  if (active !== undefined) {
    criteria = { ...criteria, active }
  }

  const userList: IUserModel[] = await User.find(criteria)
    .skip(skip)
    .limit(count)
    .sort({
      creationDate: sortOrder
    })

  return {
    totalItems: await User.find(criteria).count(),
    results: userList
  }
}

export const searchSchema = Joi.object({
  username: Joi.string().optional(),
  mobile: Joi.string().optional(),
  role: Joi.string().optional(),
  active: Joi.boolean().optional(),
  count: Joi.number()
    .min(0)
    .required(),
  skip: Joi.number()
    .min(0)
    .required(),
  sortOrder: Joi.string()
    .only(['asc', 'desc'])
    .required()
})
