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
    request.payload as IInformantSMSNotificationPayload[]

  try {
    const existingInformantSMSNotifications =
      await InformantSMSNotification.find().exec()
    if (!existingInformantSMSNotifications) {
      throw badRequest(`No informantSMSNotification record found!`)
    }

    const modifiedInformantSMSNotification =
      informantSMSNotificationPayload.filter((informantSMSNotification) => {
        const hasModified = existingInformantSMSNotifications.find(
          (inftNoti) =>
            String(inftNoti._id) === String(informantSMSNotification.id) &&
            (inftNoti.name !== informantSMSNotification.name ||
              inftNoti.enabled !== informantSMSNotification.enabled)
        )

        return hasModified
      })

    // find and Update existing fields
    try {
      await Promise.all(
        modifiedInformantSMSNotification.map(
          async (informantSMSNotification) => {
            await InformantSMSNotification.updateOne(
              { _id: informantSMSNotification?.id },
              { ...informantSMSNotification, updatedAt: Date.now() }
            )
          }
        )
      )
    } catch (err) {
      return h.response(`Failed to update existing question. ${err}`).code(400)
    }

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

export const requestSchema = Joi.array().items({
  id: Joi.string().required(),
  name: Joi.string().required(),
  enabled: Joi.boolean()
})
