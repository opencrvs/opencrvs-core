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
  ITokenPayload,
  generateChallenge
} from '@webhooks/features/manage/service'
import { internal } from 'boom'
import Webhook, { TRIGGERS } from '@webhooks/model/webhook'
import { logger } from '@webhooks/logger'
import * as uuid from 'uuid/v4'
import fetch from 'node-fetch'
import { resolve } from 'url'

interface ISubscribePayload {
  address: string
  trigger: string
}

export async function subscribeWebhooksHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { address, trigger } = request.payload as ISubscribePayload
  if (!TRIGGERS[TRIGGERS[trigger]]) {
    return h.response(`Unsupported trigger: ${trigger}`).code(400)
  }
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
      return h
        .response(
          'Active system details cannot be found.  This client is no longer enabled'
        )
        .code(400)
    }

    const webhookId = uuid()
    const createdBy = {
      client_id: system.client_id,
      name: system.name,
      type: 'api',
      username: system.username
    }
    const webhook = {
      webhookId,
      createdBy,
      address,
      trigger: TRIGGERS[TRIGGERS[trigger]]
    }
    const challenge = generateChallenge()
    try {
      const challengeCheck = await fetch(
        resolve(
          address,
          `?opencrvs.mode=subscribe&opencrvs.challenge=${challenge}`
        ),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
        .then(response => {
          return response.json()
        })
        .catch(error => {
          return Promise.reject(new Error(` request failed: ${error.message}`))
        })

      if (challengeCheck !== challengeCheck.challenge) {
        throw new Error(
          `${challenge} is not equal to ${challengeCheck.challenge}.  Subscription endpoint check failed`
        )
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

export async function listWebhooksHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
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
      return h
        .response(
          'Active system details cannot be found.  This client is no longer enabled'
        )
        .code(400)
    }
    try {
      // tslint:disable-next-line
      const entries = await Webhook.find({
        'createdBy.client_id': system.client_id
      }).sort({
        createdAt: 'asc'
      })

      const sortedEntries: any = []
      entries.forEach(item => {
        const entry = {
          id: item.webhookId,
          address: item.address,
          createdAt: new Date((item.createdAt as number) * 1000).toISOString(),
          createdBy: item.createdBy,
          trigger: item.trigger
        }
        sortedEntries.push(entry)
      })
      return h.response({ entries: sortedEntries }).code(200)
    } catch (err) {
      logger.error(err)
      throw internal()
    }
  } catch (err) {
    logger.error(err)
    return h.response().code(400)
  }
}

export async function deleteWebhookHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const webhookId = request.params.webhookId
  if (!webhookId) {
    return h.response('No webhook id in URL params').code(400)
  }
  try {
    // tslint:disable-next-line
    await Webhook.findOneAndRemove({ webhookId })
  } catch (err) {
    return h.response(`Could not delete webhook: ${webhookId}`).code(400)
  }
  return h.response().code(204)
}
