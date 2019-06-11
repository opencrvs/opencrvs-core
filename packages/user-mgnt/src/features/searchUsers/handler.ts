import * as Hapi from 'hapi'
import * as Joi from 'joi'

import User, { IUserModel } from '@user-mgnt/model/user'

interface IVerifyPayload {
  username?: string
  mobile?: string
  role?: string
  active?: boolean
  primaryOfficeId?: string
  locationId?: string
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
    primaryOfficeId,
    locationId,
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
  if (primaryOfficeId) {
    criteria = { ...criteria, primaryOfficeId }
  }
  if (locationId) {
    criteria = { ...criteria, catchmentAreaIds: locationId }
  }
  if (active !== undefined) {
    criteria = { ...criteria, active }
  }

  // tslint:disable-next-line
  const userList: IUserModel[] = await User.find(criteria)
    .skip(skip)
    .limit(count)
    .sort({
      creationDate: sortOrder
    })

  return {
    // tslint:disable-next-line
    totalItems: await User.find(criteria).count(),
    results: userList
  }
}

export const searchSchema = Joi.object({
  username: Joi.string().optional(),
  mobile: Joi.string().optional(),
  role: Joi.string().optional(),
  active: Joi.boolean().optional(),
  primaryOfficeId: Joi.string().optional(),
  locationId: Joi.string().optional(),
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
