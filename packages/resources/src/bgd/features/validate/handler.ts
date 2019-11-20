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
import { generateRegistrationNumber } from '@resources/bgd/features/generate/service'
import fetch from 'node-fetch'
import * as Pino from 'pino'
import {
  VALIDATE_IN_BDRIS2,
  CONFIRM_REGISTRATION_URL
} from '@resources/constants'
import {
  getTaskResource,
  findExtension,
  getTrackingIdFromTaskResource
} from '@resources/bgd/features/utils/fhir-utils'
import {
  OPENCRVS_SPECIFICATION_URL,
  getFromFhir
} from '@resources/bgd/features/utils'

const logger = Pino()

export async function bgdValidateRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const bundle = request.payload as fhir.Bundle
    const taskResource = getTaskResource(bundle)

    if (!taskResource || !taskResource.extension) {
      throw new Error(
        'Failed to validate registration: could not find task resource in bundle or task resource had no extensions'
      )
    }

    const trackingId = getTrackingIdFromTaskResource(taskResource)
    const practitionerRefExt = findExtension(
      `${OPENCRVS_SPECIFICATION_URL}extension/regLastUser`,
      taskResource.extension
    )

    if (
      !practitionerRefExt ||
      !practitionerRefExt.valueReference ||
      !practitionerRefExt.valueReference.reference
    ) {
      throw new Error(
        'Failed to validate registration: practitioner reference not found in task resource'
      )
    }

    const practitioner = await getFromFhir(
      practitionerRefExt.valueReference.reference
    )

    if (VALIDATE_IN_BDRIS2 === 'false') {
      const webHookResponse = {
        trackingId,
        registrationNumber: await generateRegistrationNumber(practitioner.id)
      }

      // send web hook to workflow service to continue registration, don't wait for response
      fetch(CONFIRM_REGISTRATION_URL, {
        method: 'POST',
        body: JSON.stringify(webHookResponse),
        headers: { Authorization: request.headers.authorization }
      })
    } else {
      // TODO add to queue for worker to pickup and validate
    }
  } catch (err) {
    fetch(CONFIRM_REGISTRATION_URL, {
      method: 'POST',
      body: JSON.stringify({ error: err.message }),
      headers: { Authorization: request.headers.authorization }
    })

    logger.error(err)
  }

  return h.response().code(202)
}
