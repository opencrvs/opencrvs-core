/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import * as Hapi from '@hapi/hapi'
import { Types } from 'mongoose'
import { logger } from '@user-mgnt/logger'
import { UserRole } from '@user-mgnt/model/user'
import SystemRole, { ISystemRoleModel } from '@user-mgnt/model/systemRole'
import * as Joi from 'joi'

const roleLabelSchema = Joi.object({
  lang: Joi.string().required(),
  label: Joi.string().required()
})

const roleRequestSchema = Joi.object({
  _id: Joi.string().optional(),
  labels: Joi.array().items(roleLabelSchema).required()
})

export const systemRolesRequestSchema = Joi.object({
  id: Joi.string().required(),
  value: Joi.string().optional(),
  roles: Joi.array().items(roleRequestSchema).optional(),
  active: Joi.boolean().optional()
})

export const systemRoleResponseSchema = Joi.object({
  msg: Joi.string().required()
})

export interface IRoleLabel {
  lang: string
  label: string
}

export interface IRoleRequest {
  _id: string
  labels: IRoleLabel[]
}

export interface ISystemRolesRequest {
  id: string
  value?: string
  roles?: IRoleRequest[]
  active?: boolean
}

export default async function updateRole(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const systemRolesRequest = request.payload as ISystemRolesRequest
  let updatedRoleIds: Types.ObjectId[] = []

  const systemRole: ISystemRoleModel | null = await SystemRole.findOne({
    _id: systemRolesRequest.id
  })

  if (!systemRole) {
    return h.response({ msg: 'Not found' }).code(404)
  }

  if (systemRolesRequest.roles) {
    try {
      updatedRoleIds = await updateParticularRoles(systemRolesRequest.roles)
      systemRole.roles = updatedRoleIds
    } catch (err) {
      logger.error(err)
      return h
        .response({ msg: 'Something went wrong while updating roles' })
        .code(401)
    }
  }
  try {
    systemRole.value = systemRolesRequest.value ?? systemRole.value
    systemRole.active = systemRolesRequest.active ?? systemRole.active
    await SystemRole.updateOne({ _id: systemRole._id }, systemRole)
  } catch (err) {
    logger.error(err)
    return h
      .response({ msg: 'Something went wrong while updating System roles' })
      .code(401)
  }

  logger.info(systemRole)
  return h.response({ msg: 'System role updated' }).code(200)
}

async function updateParticularRoles(roles: IRoleRequest[]) {
  return Promise.all(
    roles.map(async (role) => {
      const id = new Types.ObjectId(role._id)
      await UserRole.updateOne({ _id: id.toString() }, role, { upsert: true })
      return id
    })
  )
}
