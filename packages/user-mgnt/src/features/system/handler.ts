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
import System, { ISystemModel } from '@user-mgnt/model/system'
import User, { IUserModel } from '@user-mgnt/model/user'
import { generateSaltedHash } from '@user-mgnt/utils/hash'
import { statuses, systemScopeMapping } from '@user-mgnt/utils/userUtils'
import { QA_ENV } from '@user-mgnt/constants'
import * as Hapi from 'hapi'
import * as _ from 'lodash'
import * as Joi from 'joi'
import { getTokenPayload, ITokenPayload } from '@user-mgnt/utils/token'
import { unauthorized } from 'boom'
import * as uuid from 'uuid/v4'

interface IVerifyPayload {
  scope: string
}

interface IVerifyResponse {
  client_id: string
  secret_id: string
  sha_secret: string
}

export async function registerSystemClient(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { scope } = request.payload as IVerifyPayload
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
    if (!systemScopeMapping[scope]) {
      logger.error('scope doesnt exist')
      return h.response().code(400)
    }
    const systemScopes: string[] = systemScopeMapping[scope]

    if (
      (process.env.NODE_ENV === 'development' || QA_ENV) &&
      !systemScopes.includes('demo')
    ) {
      systemScopes.push('demo')
    }
    /* tslint:disable */
    const client_id = uuid()
    const secret_id = uuid()
    const sha_secret = uuid()
    /* tslint:enable */
    const { hash, salt } = generateSaltedHash(secret_id)
    const system = {
      client_id,
      name: systemAdminUser.name,
      username: systemAdminUser.username,
      status: statuses.ACTIVE,
      scope: systemScopes,
      secretHash: hash,
      salt,
      sha_secret
    }

    await System.create(system)

    const response: IVerifyResponse = {
      client_id,
      secret_id,
      sha_secret
    }
    return h.response(response).code(201)
  } catch (err) {
    logger.error(err)
    // return 400 if there is a validation error when saving to mongo
    return h.response().code(400)
  }
}

export const reqRegisterSystemSchema = Joi.object({
  scope: Joi.string().required()
})

export const resRegisterSystemSchema = Joi.object({
  client_id: Joi.string(),
  secret_id: Joi.string(),
  sha_secret: Joi.string()
})

interface IAuditSystemPayload {
  client_id: string
}

export async function deactivateSystemClient(
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

    const auditSystemPayload = request.payload as IAuditSystemPayload

    const system: ISystemModel | null = await System.findById(
      auditSystemPayload.client_id
    )
    if (!system) {
      logger.error(
        `No system details found for requested client_id: ${auditSystemPayload.client_id}`
      )
      throw unauthorized()
    }

    system.status = statuses.DEACTIVATED

    try {
      // tslint:disable-next-line
      await System.update({ _id: system._id }, system)
    } catch (err) {
      logger.error(err.message)
      return h.response().code(400)
    }
    return h.response().code(200)
  } catch (err) {
    logger.error(err)
    return h.response().code(400)
  }
}

export async function reactivateSystemClient(
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

    const auditSystemPayload = request.payload as IAuditSystemPayload

    const system: ISystemModel | null = await System.findById(
      auditSystemPayload.client_id
    )
    if (!system) {
      logger.error(
        `No system details found for requested client_id: ${auditSystemPayload.client_id}`
      )
      throw unauthorized()
    }

    system.status = statuses.ACTIVE

    try {
      // tslint:disable-next-line
      await System.update({ _id: system._id }, system)
    } catch (err) {
      logger.error(err.message)
      return h.response().code(400)
    }
    return h.response().code(200)
  } catch (err) {
    logger.error(err)
    return h.response().code(400)
  }
}

export const auditSystemSchema = Joi.object({
  client_id: Joi.string().required()
})
