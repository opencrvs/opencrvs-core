import * as Hapi from 'hapi'
import fetch from 'node-fetch'
import { HEARTH_URL } from '@workflow/constants'
import { modifyTaskBundle } from '@workflow/features/task/fhir/fhir-bundle-modifier'
import {
  getEntryId,
  getSharedContactMsisdn
} from '@workflow/features/registration/fhir/fhir-utils'
import { checkForDuplicateStatus } from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import { getToken } from '@workflow/utils/authUtils'
import { logger } from '@workflow/logger'
import { sendEventNotification } from '@workflow/features/registration/utils'
import { Events } from '@workflow/features/events/handler'
import { REG_STATUS_REJECTED } from '@workflow/features/registration/fhir/constants'

export default async function updateTaskHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
  event: Events
) {
  try {
    const payload = await modifyTaskBundle(
      request.payload as fhir.Bundle,
      getToken(request)
    )
    const taskId = getEntryId(payload)
    if (
      !payload ||
      !payload.entry ||
      !payload.entry[0] ||
      !payload.entry[0].resource
    ) {
      throw new Error('Task has no entry')
    }

    // Checking for duplicate status update
    await checkForDuplicateStatus(
      payload.entry[0].resource as fhir.Task,
      REG_STATUS_REJECTED
    )

    const res = await fetch(`${HEARTH_URL}/Task/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(payload.entry[0].resource),
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
    const msisdn = await getSharedContactMsisdn(payload)
    /* sending notification to the contact */
    if (msisdn) {
      logger.info(
        'updateTaskHandler(reject application) sending event notification'
      )
      sendEventNotification(payload, event, msisdn, {
        Authorization: request.headers.authorization
      })
    } else {
      logger.info(
        'updateTaskHandler(reject application) could not send event notification'
      )
    }

    return payload.entry[0].resource
  } catch (error) {
    logger.error(`Workflow/updateTaskHandler: error: ${error}`)
    throw new Error(error)
  }
}
