/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import { ObjectId, SortOrder } from 'mongoose'
import SystemRole from '@user-mgnt/model/systemRole'
import { UserRole } from '@user-mgnt/model/user'

type VerifyPayload = {
  value?: string
  role?: string
  active?: boolean
  sortBy?: string
  sortOrder?: SortOrder
}

type UserRoleSchema = {
  labels: { label: string }[]
}

export default async function getSystemRoles(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const {
    value,
    role,
    active,
    sortBy = 'creationDate',
    sortOrder = 'asc'
  } = request.payload as VerifyPayload

  // Define criteria with types: roles is an array of ObjectId
  let criteria: {
    value?: string
    roles?: { $in: ObjectId[] }
    active?: boolean
  } = {}

  if (value) {
    criteria = { ...criteria, value }
  }

  // This part is for querying the 'roles' field by resolving the labels inside UserRole
  if (role) {
    const roleIds = await UserRole.find<UserRoleSchema>({
      'labels.label': role
    }).distinct('_id') // Get only the _id of UserRoles matching the role

    criteria = {
      ...criteria,
      roles: {
        $in: roleIds // Filter the roles by UserRole _ids
      }
    }
  }

  if (active !== undefined) {
    criteria = { ...criteria, active }
  }

  return await SystemRole.find(criteria)
    .populate({ path: 'roles', select: 'labels' })
    .sort({
      [sortBy]: sortOrder
    })
}

export const searchRoleSchema = Joi.object({
  value: Joi.string().optional(),
  role: Joi.string().optional(),
  active: Joi.boolean().optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
})
