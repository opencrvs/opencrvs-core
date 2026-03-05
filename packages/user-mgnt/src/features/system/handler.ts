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

/**
 * This file contains ONLY authentication-related system handlers.
 * System client management (create, update, delete, list) has been migrated
 * to the events service integrations endpoints.
 */

import { unauthorized } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'
import System from '@user-mgnt/model/system'
import { generateHash } from '@user-mgnt/utils/hash'
import * as Joi from 'joi'

interface IVerifyPayload {
  client_id: string
  client_secret: string
}

interface IVerifyResponse {
  scope: string[]
  status: string
  id: string
}

export async function verifySystemHandler(
  request: Hapi.Request,
  _: Hapi.ResponseToolkit
): Promise<IVerifyResponse> {
  const { client_id, client_secret } = request.payload as IVerifyPayload
  const system = await System.findOne({ client_id })

  if (!system) {
    throw unauthorized()
  }

  if (generateHash(client_secret, system.salt) !== system.secretHash) {
    throw unauthorized()
  }

  return {
    scope: system.scope,
    status: system.status,
    id: system.id
  }
}

export const verifySystemReqSchema = Joi.object({
  client_id: Joi.string().required(),
  client_secret: Joi.string().required()
})

export const verifySystemResSchema = Joi.object({
  scope: Joi.array().items(Joi.string()),
  status: Joi.string(),
  id: Joi.string()
})

interface IGetSystemPayload {
  systemId: string
  clientId: string
}

export async function getSystemHandler(
  request: Hapi.Request,
  _h: Hapi.ResponseToolkit
) {
  const { systemId, clientId } = request.payload as IGetSystemPayload
  let criteria = {}
  if (systemId) {
    criteria = { ...criteria, _id: systemId }
  }
  if (clientId) {
    criteria = { ...criteria, client_id: clientId }
  }

  const system = await System.findOne(criteria)

  if (!system) {
    throw unauthorized()
  }
  const systemName = system.name
  return {
    name: systemName || system.createdBy,
    createdBy: system.createdBy,
    client_id: system.client_id,
    username: system.username,
    status: system.status,
    scope: system.scope,
    sha_secret: system.sha_secret,
    practitionerId: system.practitionerId,
    type: system.type,
    settings: system.settings
  }
}

export const getSystemRequestSchema = Joi.object({
  systemId: Joi.string(),
  clientId: Joi.string()
})

const webHookSchema = Joi.array().items(
  Joi.object({
    event: Joi.string().required(),
    permissions: Joi.array().items(Joi.string())
  }).unknown(true)
)

const settingsSchema = Joi.object({
  dailyQuota: Joi.number(),
  openIdProviderBaseUrl: Joi.string(),
  openIdProviderClientId: Joi.string(),
  openIdProviderClaims: Joi.string(),
  webhook: webHookSchema
})

export const getSystemResponseSchema = Joi.object({
  name: Joi.string(),
  createdBy: Joi.string(),
  username: Joi.string(),
  client_id: Joi.string(),
  status: Joi.string(),
  scope: Joi.array().items(Joi.string()),
  sha_secret: Joi.string(),
  practitionerId: Joi.string(),
  type: Joi.string(),
  settings: settingsSchema
})
