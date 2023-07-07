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
import { internal } from '@hapi/boom'
import { Request, ResponseToolkit } from '@hapi/hapi'
import { logger } from '@user-mgnt/logger'
import SystemRole, { SYSTEM_ROLE_TYPES } from '@user-mgnt/model/systemRole'
import * as Joi from 'joi'

export const createSystemRoleReqSchema = Joi.object({
  value: Joi.string()
    .allow(...SYSTEM_ROLE_TYPES)
    .required(),
  roles: Joi.array().items(Joi.string()).required(),
  active: Joi.boolean().optional()
})

type ReqPayload = {
  value: typeof SYSTEM_ROLE_TYPES[number]
  roles: string[]
  active?: boolean
}

export async function createSystemRole(req: Request, h: ResponseToolkit) {
  const reqObject = req.payload as ReqPayload
  try {
    const newSystemRole = await SystemRole.create(reqObject)
    return h.response(newSystemRole)
  } catch (err) {
    logger.error(err)
    throw internal('Failed to create the new system role')
  }
}
