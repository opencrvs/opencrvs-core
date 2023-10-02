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

import { unauthorized } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'
import { QA_ENV, RECORD_SEARCH_QUOTA } from '@user-mgnt/constants'
import {
  createFhirPractitioner,
  createFhirPractitionerRole,
  postFhir
} from '@user-mgnt/features/createUser/service'
import { logger } from '@user-mgnt/logger'
import System, {
  ISystemModel,
  WebhookPermissions
} from '@user-mgnt/model/system'
import User, { IUserModel } from '@user-mgnt/model/user'
import { generateHash, generateSaltedHash } from '@user-mgnt/utils/hash'
import { pickSystem, types } from '@user-mgnt/utils/system'
import { getTokenPayload, ITokenPayload } from '@user-mgnt/utils/token'
import { statuses, systemScopeMapping } from '@user-mgnt/utils/userUtils'
import * as Joi from 'joi'
import * as uuid from 'uuid/v4'

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
  integratingSystemType: string
}

export async function registerSystem(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { name, type, integratingSystemType } =
    request.payload as IRegisterSystemPayload
  let { settings } = request.payload as IRegisterSystemPayload
  try {
    if (type === types.WEBHOOK && !settings) {
      logger.error('Webhook payloads are required !')
      return h.response('Webhook payloads are required !').code(400)
    }

    if (type === types.RECORD_SEARCH && !settings) {
      settings = {
        dailyQuota: RECORD_SEARCH_QUOTA,
        webhook: []
      }
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
    const role = await createFhirPractitionerRole(
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

    if (type === types.WEBHOOK || type === types.RECORD_SEARCH) {
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
      type,
      integratingSystemType
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
  let criteria = {}
  if (systemId) {
    criteria = { ...criteria, _id: systemId }
  }
  if (clientId) {
    criteria = { ...criteria, client_id: clientId }
  }

  const system: ISystemModel | null = await System.findOne(criteria)

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

export const clientIdSchema = Joi.object({
  clientId: Joi.string()
})

export const SystemSchema = Joi.object({
  _id: Joi.string(),
  name: Joi.string(),
  status: Joi.string(),
  type: Joi.string(),
  integratingSystemType: Joi.string(),
  shaSecret: Joi.string(),
  clientId: Joi.string(),
  settings: settingsSchema
})

export const resSystemSchema = Joi.object({
  clientSecret: Joi.string().uuid(),
  system: SystemSchema
})

interface IUpdateSystemPayload {
  clientId: string
  webhook: WebHookPayload[]
}

export async function updatePermissions(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const { clientId, webhook } = request.payload as IUpdateSystemPayload

    const existingSystem: ISystemModel | null = await System.findOne({
      client_id: clientId
    })

    if (!existingSystem) {
      logger.error('No system client is found !')
      return h.response('No system client is found').code(404)
    }
    existingSystem.settings.webhook = webhook
    const newSystem = await System.findOneAndUpdate(
      { client_id: clientId },
      existingSystem,
      {
        new: true
      }
    )

    return h.response(pickSystem(newSystem!)).code(200)
  } catch (err) {
    logger.error(err)
    return h.response(err.message).code(400)
  }
}

export const reqUpdateSystemSchema = Joi.object({
  clientId: Joi.string().required(),
  webhook: webHookSchema.required()
})

export const reqRegisterSystemSchema = Joi.object({
  type: Joi.string().required(),
  name: Joi.string().required(),
  integratingSystemType: Joi.string(),
  settings: Joi.object({
    dailyQuota: Joi.number(),
    webhook: webHookSchema
  }).optional()
})

export async function refreshSystemSecretHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const { clientId } = request.payload as SystemClientIdPayload

    const systemUser: ISystemModel | null = await System.findOne({
      client_id: clientId
    })

    if (!systemUser) {
      logger.error(`No user details found by given clientId: ${clientId}`)
      throw unauthorized()
    }

    const client_secret = uuid()
    const { hash, salt } = generateSaltedHash(client_secret)

    systemUser.salt = salt
    systemUser.secretHash = hash

    const newSystem = await System.findOneAndUpdate(
      { client_id: clientId },
      systemUser,
      {
        new: true
      }
    )
    return h
      .response({
        clientSecret: client_secret,
        system: pickSystem(newSystem!)
      })
      .code(200)
  } catch (e) {
    return h.response(e.message).code(400)
  }
}

export const systemSecretRequestSchema = Joi.object({
  clientId: Joi.string()
})

export async function deleteSystem(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const { clientId } = request.payload as SystemClientIdPayload

    const system = await System.findOneAndDelete({
      client_id: clientId
    })

    if (system) {
      logger.info(`System has been deleted by clientId ${clientId}`)
      return h.response(pickSystem(system)).code(200)
    }

    return h.response(`No system found by clientId: ${clientId}`).code(404)
  } catch (e) {
    logger.info(e.message)
    return h.response(e.message).code(400)
  }
}
