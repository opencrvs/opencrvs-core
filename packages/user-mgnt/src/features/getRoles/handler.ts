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

import SystemRole from '@user-mgnt/model/systemRole'
import { SortOrder } from 'mongoose'

interface IVerifyPayload {
  value?: string
  role?: string
  active?: boolean
  sortBy?: string
  sortOrder?: SortOrder
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
  } = request.payload as IVerifyPayload
  let criteria = {}

  if (value) {
    criteria = { ...criteria, value }
  }
  if (role) {
    criteria = { ...criteria, 'roles.labels.label': role }
  }
  if (active !== undefined) {
    criteria = { ...criteria, active }
  }

  return await SystemRole.find(criteria)
    .populate('roles')
    .sort({
      [sortBy]: sortOrder
    })
}

export const searchRoleSchema = Joi.object({
  value: Joi.object({
    $eq: Joi.string().optional(),
    $gt: Joi.string().optional(),
    $lt: Joi.string().optional(),
    $gte: Joi.string().optional(),
    $lte: Joi.string().optional(),
    $ne: Joi.string().optional(),
    $in: Joi.array().items(Joi.string()).optional(),
    $nin: Joi.array().items(Joi.string()).optional()
  }).optional(),
  role: Joi.string().optional(),
  active: Joi.boolean().optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
})
