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
import fetch from 'node-fetch'
import { HEARTH_URL } from '@workflow/constants'
import { modifyTaskBundle } from '@workflow/features/task/fhir/fhir-bundle-modifier'
import {
  getEntryId,
  getSharedContactEmail,
  getSharedContactMsisdn
} from '@workflow/features/registration/fhir/fhir-utils'
import { getToken } from '@workflow/utils/authUtils'
import { logger } from '@workflow/logger'
import { sendEventNotification } from '@workflow/features/registration/utils'
import { Events } from '@workflow/features/events/utils'
import { Bundle, Task } from '@opencrvs/commons/types'

export default async function updateTaskHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
  event: Events
) {
  try {
    const token = getToken(request)
    const payload = await modifyTaskBundle(request.payload as Bundle, token)
    const taskId = getEntryId(payload)
    const taskResource = payload.entry?.[0].resource as Task | undefined
    if (!taskResource) {
      throw new Error('TaskBundle has no entry')
    }
    const res = await fetch(`${HEARTH_URL}/Task/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskResource),
      headers: {
        'Content-Type': 'application/fhir+json'
      }
    })
    if (!res.ok) {
      throw new Error(
        `FHIR put to /fhir failed with [${
          res.status
        }] body: ${await res.text()}`
      )
    }
    const sms = await getSharedContactMsisdn(payload)
    const email = await getSharedContactEmail(payload)
    /* sending notification to the contact */
    if (sms || email) {
      logger.info(`updateTaskHandler(${event}) sending event notification`)
      sendEventNotification(
        payload,
        event,
        { sms, email },
        {
          Authorization: request.headers.authorization
        }
      )
    } else {
      logger.info(
        'updateTaskHandler(reject declaration) could not send event notification'
      )
    }

    return taskResource
  } catch (error) {
    logger.error(`Workflow/updateTaskHandler: error: ${error}`)
    throw new Error(error)
  }
}
