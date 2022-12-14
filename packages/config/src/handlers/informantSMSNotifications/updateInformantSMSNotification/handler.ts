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
import { logger } from '@config/config/logger'
import * as Joi from 'joi'
import InformantSMSNotification from '@config/models/informantSMSNotifications'
import { badRequest } from '@hapi/boom'
import getInformantSMSNotificationsHandler from '@config/handlers/informantSMSNotifications/getInformantSMSNotification/handler'

export interface IInformantSMSNotificationPayload {
  id: string
  name: string
  enabled: boolean
}

export default async function updateInformantSMSNotification(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const informantSMSNotificationPayload =
    request.payload as IInformantSMSNotificationPayload

  try {
    const existingInformantSMSNotification =
      await InformantSMSNotification.findOne({
        _id: informantSMSNotificationPayload.id
      })

    if (!existingInformantSMSNotification) {
      throw badRequest(
        `No informantSMSNotification found by given id: ${informantSMSNotificationPayload.id}`
      )
    }
    // Update existing fields
    existingInformantSMSNotification.name = informantSMSNotificationPayload.name
    existingInformantSMSNotification.enabled =
      informantSMSNotificationPayload.enabled
    existingInformantSMSNotification.updatedAt = Date.now()

    await InformantSMSNotification.updateOne(
      { _id: existingInformantSMSNotification._id },
      existingInformantSMSNotification
    )
    const informantSMSNotifications = await getInformantSMSNotificationsHandler(
      request,
      h
    )
    return h.response(informantSMSNotifications).code(201)
  } catch (err) {
    logger.error(err)
    return h.response('Could not update informantSMSNotification').code(400)
  }
}

export const requestSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string(),
  enabled: Joi.boolean()
})
