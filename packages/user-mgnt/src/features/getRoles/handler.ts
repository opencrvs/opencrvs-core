import * as Hapi from 'hapi'
import * as Joi from 'joi'

import Role from '@user-mgnt/model/role'

interface IVerifyPayload {
  title?: string
  value?: string
  type?: string
  active?: boolean
  sortBy?: string
  sortOrder?: string
}

export default async function getRoles(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const {
    title,
    value,
    type,
    active,
    sortBy = 'creationDate',
    sortOrder = 'asc'
  } = request.payload as IVerifyPayload
  let criteria = {}
  if (title) {
    criteria = { ...criteria, title }
  }
  if (value) {
    criteria = { ...criteria, value }
  }
  if (type) {
    criteria = { ...criteria, types: type }
  }
  if (active !== undefined) {
    criteria = { ...criteria, active }
  }

  // tslint:disable-next-line
  return await Role.find(criteria).sort({
    [sortBy]: sortOrder
  })
}

export const searchRoleSchema = Joi.object({
  title: Joi.string().optional(),
  value: Joi.string().optional(),
  type: Joi.string().optional(),
  active: Joi.boolean().optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string()
    .only(['asc', 'desc'])
    .optional()
})
