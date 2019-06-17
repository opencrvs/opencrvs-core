import * as Hapi from 'hapi'
import fetch from 'node-fetch'
import { HEARTH_URL } from '@workflow/constants'
import { modifyTaskBundle } from '@workflow/features/task/fhir/fhir-bundle-modifier'
import { getEntryId } from '@workflow/features/registration/fhir/fhir-utils'
import { getToken } from '@workflow/utils/authUtils'
import { logger } from '@workflow/logger'

export default async function updateTaskHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
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

    return payload.entry[0].resource
  } catch (error) {
    logger.error(`Workflow/updateTaskHandler: error: ${error}`)
    throw new Error(error)
  }
}
