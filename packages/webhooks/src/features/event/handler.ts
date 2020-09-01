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
import { logger } from '@webhooks/logger'
import { internal } from 'boom'
import * as Hapi from 'hapi'
import Webhook, { TRIGGERS, IWebhookModel } from '@webhooks/model/webhook'
import { webhookQueue } from '@webhooks/queue'
import * as ShortUIDGen from 'short-uid'
import { createRequestSignature } from '@webhooks/features/event/service'

export async function birthRegisteredHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const bundle = request.payload as fhir.Bundle
  try {
    // tslint:disable-next-line
    const webhooks: IWebhookModel[] = await Webhook.find({
      trigger: TRIGGERS.BIRTH_REGISTERED
    })
    if (webhooks) {
      webhooks.forEach(webhookToNotify => {
        logger.info(`Queueing webhook ${webhookToNotify.webhookId}`)
        const payload = {
          timestamp: new Date().toISOString(),
          id: webhookToNotify.webhookId,
          event: {
            hub: {
              topic: TRIGGERS.BIRTH_REGISTERED
            },
            context: [bundle]
          }
        }
        const hmac = createRequestSignature(
          'sha256',
          webhookToNotify.sha_secret,
          JSON.stringify(payload)
        )
        webhookQueue.add(
          {
            payload,
            url: webhookToNotify.address,
            hmac
          },
          {
            jobId: `WEBHOOK_${new ShortUIDGen().randomUUID().toUpperCase()}_${
              webhookToNotify.webhookId
            }`,
            attempts: 3
          }
        )
      })
    } else {
      logger.info(`No webhooks subscribed to birth registration trigger`)
    }
  } catch (error) {
    logger.error(`Webhooks/birthRegisteredHandler: error: ${error}`)
    return internal(error)
  }

  return h.response().code(200)
}
