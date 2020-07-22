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
import * as Hapi from 'hapi'
import * as Joi from 'joi'
import {
  getTokenPayload,
  getSystem,
  ISystem,
  ITokenPayload
} from '@webhooks/features/webhooks/service'
import { unauthorized, internal } from 'boom'
import Webhook, { IClient } from '@webhooks/model/webhook'
import { logger } from '@webhooks/logger'
import * as uuid from 'uuid/v4'

interface ISubscribePayload {
  address: string
  trigger: string
}

export async function subscribeWebhooksHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { address, trigger } = request.payload as ISubscribePayload
  const token: ITokenPayload = getTokenPayload(
    request.headers.authorization.split(' ')[1]
  )
  const systemId = token.sub
  try {
    const system: ISystem = await getSystem(
      { systemId },
      request.headers.authorization
    )
    if (!system || system.status !== 'active') {
      logger.error('active system details cannot be found')
      throw unauthorized()
    }
    try {
      const webhookId = uuid()
      const createdBy: IClient = {
        clientId: system.client_id,
        name: system.name,
        type: 'api',
        username: system.username
      }
      const webhook = {
        webhookId,
        createdBy,
        address,
        trigger
      }

      await Webhook.create(webhook)
      return h
        .response({
          id: webhookId,
          createdBy,
          address,
          trigger,
          createdAt: new Date().toISOString()
        })
        .code(200)
    } catch (err) {
      logger.error(err)
      throw internal()
    }
  } catch (err) {
    logger.error(err)
    return h.response().code(400)
  }
}

export const reqSubscribeWebhookSchema = Joi.object({
  address: Joi.string(),
  trigger: Joi.string()
})

export const resSubscribeWebhookSchema = Joi.object({
  id: Joi.string(),
  address: Joi.string(),
  createdAt: Joi.string(),
  createdBy: Joi.object({
    client_id: Joi.string(),
    type: Joi.string(),
    username: Joi.string(),
    name: Joi.string()
  }),
  trigger: Joi.string()
})
