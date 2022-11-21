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

import { logger } from '@user-mgnt/logger'
import System, {
  ISystemModel,
  WebhookPermissions
} from '@user-mgnt/model/system'
import User, { IUserModel } from '@user-mgnt/model/user'
import { generateSaltedHash, generateHash } from '@user-mgnt/utils/hash'
import { statuses, systemScopeMapping, types } from '@user-mgnt/utils/userUtils'
import { QA_ENV } from '@user-mgnt/constants'
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import { getTokenPayload, ITokenPayload } from '@user-mgnt/utils/token'
import { unauthorized } from '@hapi/boom'
import * as uuid from 'uuid/v4'
import {
  createFhirPractitioner,
  createFhirPractitionerRole,
  postFhir
} from '@user-mgnt/features/createUser/service'
import { pick } from 'lodash'
import { Types } from 'mongoose'

export enum EventType {
  Birth = 'birth',
  Death = 'death'
}

interface WebHookPayload {
  event: EventType
  permissions: WebhookPermissions[]
}

interface IRegisterSystemPayload {
  name: string
  settings: {
    dailyQuota: number
    webhook: WebHookPayload[]
  }
  type: string
}

/** Returns a curated System with only the params we want to expose */
const pickSystem = (system: ISystemModel & { _id: Types.ObjectId }) => ({
  ...pick(system, ['name', 'status', 'type']),
  // TODO: client_id and sha_secret should be camelCased in the Mongoose-model
  _id: system._id.toString(),
  shaSecret: system.sha_secret,
  clientId: system.client_id
})

export async function registerSystem(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { name, settings, type } = request.payload as IRegisterSystemPayload
  try {
    if (type === types.WEBHOOK && !settings.webhook) {
      logger.error('Webhook payloads are required !')
      return h.response('Webhook payloads are required !').code(400)
    }
    const token: ITokenPayload = getTokenPayload(
      request.headers.authorization.split(' ')[1]
    )
    const userId = token.sub
    const systemAdminUser: IUserModel | null = await User.findById(userId)

    const existingSystem: ISystemModel | null = await System.findOne({
      type: type
    })

    if (!systemAdminUser || systemAdminUser.status !== statuses.ACTIVE) {
      logger.error('active system admin user details cannot be found')
      throw unauthorized()
    }

    if (existingSystem && existingSystem.type === types.NATIONAL_ID) {
      throw new Error('System with NATIONAL_ID already exists !')
    }
    if (!systemScopeMapping[type]) {
      logger.error('scope doesnt exist')
      return h.response().code(400)
    }
    const systemScopes: string[] = systemScopeMapping[type]

    if (
      (process.env.NODE_ENV === 'development' || QA_ENV) &&
      !systemScopes.includes('demo')
    ) {
      systemScopes.push('demo')
    }

    const client_id = uuid()
    const clientSecret = uuid()
    const sha_secret = uuid()

    const { hash, salt } = generateSaltedHash(clientSecret)

    const practitioner = createFhirPractitioner(systemAdminUser, true)
    const practitionerId = await postFhir(
      request.headers.authorization,
      practitioner
    )
    if (!practitionerId) {
      throw new Error(
        'Practitioner resource not saved correctly, practitioner ID not returned'
      )
    }
    const role = createFhirPractitionerRole(
      systemAdminUser,
      practitionerId,
      true
    )
    const roleId = await postFhir(request.headers.authorization, role)
    if (!roleId) {
      throw new Error(
        'PractitionerRole resource not saved correctly, practitionerRole ID not returned'
      )
    }
    const systemDetails = {
      client_id,
      name: name || systemAdminUser.username,
      createdBy: userId,
      username: systemAdminUser.username,
      status: statuses.ACTIVE,
      scope: systemScopes,
      practitionerId,
      secretHash: hash,
      salt,
      sha_secret,
      settings,
      type
    }
    const newSystem = await System.create(systemDetails)

    return h
      .response({
        // NOTE! Client secret is visible for only this response and then forever gone
        clientSecret,
        system: pickSystem(newSystem)
      })
      .code(201)
  } catch (err) {
    logger.error(err)
    // return 400 if there is a validation error when saving to mongo
    return h.response().code(400)
  }
}

interface SystemClientIdPayload {
  clientId: string
}

export async function deactivateSystem(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const token: ITokenPayload = getTokenPayload(
      request.headers.authorization.split(' ')[1]
    )
    const userId = token.sub
    const systemAdminUser: IUserModel | null = await User.findById(userId)
    if (!systemAdminUser || systemAdminUser.status !== statuses.ACTIVE) {
      logger.error('Active system admin user details cannot be found')
      throw unauthorized()
    }

    const { clientId } = request.payload as SystemClientIdPayload

    const system: ISystemModel | null = await System.findOne({
      client_id: clientId
    })
    if (!system) {
      logger.error(
        `No system details found for requested client_id: ${clientId}`
      )
      throw unauthorized()
    }
    system.status = statuses.DEACTIVATED

    const newSystem = await System.findOneAndUpdate(
      { _id: system._id },
      system,
      {
        returnDocument: 'after'
      }
    )

    return h.response(pickSystem(newSystem!)).code(200)
  } catch (err) {
    logger.error(err)
    return h.response().code(400)
  }
}

export async function reactivateSystem(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const token: ITokenPayload = getTokenPayload(
      request.headers.authorization.split(' ')[1]
    )
    const userId = token.sub
    const systemAdminUser: IUserModel | null = await User.findById(userId)
    if (!systemAdminUser || systemAdminUser.status !== statuses.ACTIVE) {
      logger.error('active system admin user details cannot be found')
      throw unauthorized()
    }

    const { clientId } = request.payload as SystemClientIdPayload

    const system: ISystemModel | null = await System.findOne({
      client_id: clientId
    })
    if (!system) {
      logger.error(
        `No system details found for requested client_id: ${clientId}`
      )
      throw unauthorized()
    }
    system.status = statuses.ACTIVE

    const newSystem = await System.findOneAndUpdate(
      { _id: system._id },
      system,
      {
        returnDocument: 'after'
      }
    )

    return h.response(pickSystem(newSystem!)).code(200)
  } catch (err) {
    logger.error(err)
    return h.response().code(400)
  }
}

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
  h: Hapi.ResponseToolkit
) {
  const { client_id, client_secret } = request.payload as IVerifyPayload

  const system: ISystemModel | null = await System.findOne({ client_id })

  if (!system) {
    // Don't return a 404 as this gives away that this user account exists
    throw unauthorized()
  }

  if (generateHash(client_secret, system.salt) !== system.secretHash) {
    throw unauthorized()
  }

  const response: IVerifyResponse = {
    scope: system.scope,
    status: system.status,
    id: system.id
  }

  return response
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
  h: Hapi.ResponseToolkit
) {
  const { systemId, clientId } = request.payload as IGetSystemPayload

  const system: ISystemModel | null = await System.findOne({
    $or: [{ _id: systemId }, { clientId: clientId }]
  })

  if (!system) {
    // Don't return a 404 as this gives away that this user account exists
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
    settings: {
      dailyQuota: system.settings.dailyQuota || 0
    }
  }
}

export async function getAllSystemsHandler() {
  const systems = await System.find()
  return systems.map((system) => pickSystem(system))
}

export const getSystemRequestSchema = Joi.object({
  systemId: Joi.string(),
  clientId: Joi.string()
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
  settings: Joi.object({
    dailyQuota: Joi.number()
  })
})

export const clientIdSchema = Joi.object({
  clientId: Joi.string()
})

export const SystemSchema = Joi.object({
  _id: Joi.string(),
  name: Joi.string(),
  status: Joi.string(),
  type: Joi.string(),
  shaSecret: Joi.string(),
  clientId: Joi.string()
})

export const resRegisterSystemSchema = Joi.object({
  clientSecret: Joi.string().uuid(),
  system: SystemSchema
})

interface IUpdateSystemPayload {
  client_id: string
  webhook: WebHookPayload[]
}

export async function updateSystemClient(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const { client_id, webhook } = request.payload as IUpdateSystemPayload

    const existingSystem: ISystemModel | null = await System.findOne({
      client_id
    })

    if (!existingSystem) {
      logger.error('No system client is found !')
      return h.response('No system client is found').code(404)
    }

    existingSystem.settings.webhook = webhook
    await existingSystem.save()

    const response: IUpdateSystemPayload = {
      client_id: existingSystem.client_id,
      webhook: existingSystem.settings.webhook
    }

    return h.response(response).code(200)
  } catch (err) {
    logger.error(err)
    return h.response(err.message).code(400)
  }
}

const webHookSchema = Joi.array().items(
  Joi.object({
    event: Joi.string().required(),
    permissions: Joi.array().items(Joi.string()).required()
  })
)
export const reqUpdateSystemSchema = Joi.object({
  client_id: Joi.string().required(),
  webhook: webHookSchema.required()
})

export const reqRegisterSystemSchema = Joi.object({
  type: Joi.string().required(),
  name: Joi.string(),
  settings: Joi.object({
    dailyQuota: Joi.number(),
    webhook: webHookSchema
  })
})
