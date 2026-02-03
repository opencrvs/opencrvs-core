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
import { logger, SCOPES } from '@opencrvs/commons'
import System, { WebhookPermissions } from '@user-mgnt/model/system'
import User from '@user-mgnt/model/user'
import { generateHash, generateSaltedHash } from '@user-mgnt/utils/hash'
import { pickSystem } from '@user-mgnt/utils/system'
import { getTokenPayload, ITokenPayload } from '@user-mgnt/utils/token'
import { statuses } from '@user-mgnt/utils/userUtils'
import * as Joi from 'joi'
import uuid from 'uuid/v4'

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
  scopes: string[]
  integratingSystemType: string
}

export async function registerSystem(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IRegisterSystemPayload
  const { name, integratingSystemType } = payload
  let { settings, scopes } = payload

  try {
    if (!scopes || scopes.length === 0) {
      logger.error('Scopes are required!')
      return h.response('Scopes are required!').code(400)
    }

    // Check if this is a webhook system based on scopes
    const isWebhook = scopes.includes(SCOPES.WEBHOOK)
    if (isWebhook && !settings) {
      logger.error('Webhook payloads are required !')
      return h.response('Webhook payloads are required !').code(400)
    }

    // Check if this is a record search system based on scopes
    const isRecordSearch = scopes.includes(SCOPES.RECORDSEARCH) && !isWebhook
    if (isRecordSearch && !settings) {
      settings = {
        dailyQuota: RECORD_SEARCH_QUOTA,
        webhook: []
      }
    }

    // Check if this is an import/export system based on scopes
    const isImportExport = scopes.includes(SCOPES.RECORD_IMPORT)
    if (isImportExport && !settings) {
      settings = {
        dailyQuota: 1000000, //Arbitrary high number, should we make this configurable?
        webhook: []
      }
    }

    const authorization = request.headers.authorization as string
    const token = getTokenPayload(authorization.split(' ')[1])
    const userId = token.sub
    const systemAdminUser = await User.findById(userId)
    
    // Check if this is a national ID system based on scopes
    const isNationalId = scopes.includes(SCOPES.NATIONALID)
    if (isNationalId) {
      // Query for systems that have NATIONALID scope in their scope array
      // Using simple equality check since NATIONALID systems typically only have this scope
      const existingSystem = await System.findOne({
        scope: SCOPES.NATIONALID
      })
      if (existingSystem) {
        throw new Error('System with NATIONAL_ID scope already exists!')
      }
    }

    if (!systemAdminUser || systemAdminUser.status !== statuses.ACTIVE) {
      logger.error('active system admin user details cannot be found')
      throw unauthorized()
    }

    if (
      (process.env.NODE_ENV === 'development' || QA_ENV) &&
      !scopes.includes('demo')
    ) {
      scopes.push('demo')
    }

    const client_id = uuid()
    const clientSecret = uuid()
    const sha_secret = uuid()
    const { hash, salt } = generateSaltedHash(clientSecret)

    const practitioner = createFhirPractitioner(systemAdminUser, true)
    const practitionerId = await postFhir(authorization, practitioner)
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
    const roleId = await postFhir(authorization, role)
    if (!roleId) {
      throw new Error(
        'PractitionerRole resource not saved correctly, practitionerRole ID not returned'
      )
    }

    // For systems that need settings (webhook, record search, import/export, citizen portal with specific scopes)
    const isCitizenPortal =
      scopes.includes('record.read') ||
      scopes.includes('record.create') ||
      scopes.includes('record.notify') ||
      scopes.some((s) => s.startsWith('record.read[')) ||
      scopes.some((s) => s.startsWith('record.create[')) ||
      scopes.some((s) => s.startsWith('record.notify['))

    if (isWebhook || isRecordSearch || isImportExport || isCitizenPortal) {
      const systemDetails = {
        client_id,
        name: name || systemAdminUser.username,
        createdBy: userId,
        username: systemAdminUser.username,
        status: statuses.ACTIVE,
        scope: scopes,
        practitionerId,
        secretHash: hash,
        salt,
        sha_secret,
        settings
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
      scope: scopes,
      practitionerId,
      secretHash: hash,
      salt,
      sha_secret,
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
    const systemAdminUser = await User.findById(userId)
    if (!systemAdminUser || systemAdminUser.status !== statuses.ACTIVE) {
      logger.error('Active system admin user details cannot be found')
      throw unauthorized()
    }

    const { clientId } = request.payload as SystemClientIdPayload

    const system = await System.findOne({ client_id: clientId })
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
    const token = getTokenPayload(request.headers.authorization.split(' ')[1])
    const userId = token.sub
    const systemAdminUser = await User.findById(userId)
    if (!systemAdminUser || systemAdminUser.status !== statuses.ACTIVE) {
      logger.error('active system admin user details cannot be found')
      throw unauthorized()
    }

    const { clientId } = request.payload as SystemClientIdPayload

    const system = await System.findOne({ client_id: clientId })
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
  _: Hapi.ResponseToolkit
): Promise<IVerifyResponse> {
  const { client_id, client_secret } = request.payload as IVerifyPayload
  const system = await System.findOne({ client_id })

  if (!system) {
    // Don't return a 404 as this gives away that this user account exists
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
  settings: settingsSchema
})

export const clientIdSchema = Joi.object({
  clientId: Joi.string()
})

export const SystemSchema = Joi.object({
  _id: Joi.string(),
  name: Joi.string(),
  status: Joi.string(),
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

    const existingSystem = await System.findOne({ client_id: clientId })

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
  scopes: Joi.array().items(Joi.string()).required(),
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

    const systemUser = await System.findOne({ client_id: clientId })

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

    const system = await System.findOneAndDelete({ client_id: clientId })

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
