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
import fetch from 'node-fetch'
import * as Pino from 'pino'
import {
  VALIDATE_IN_BDRIS2,
  CONFIRM_REGISTRATION_URL
} from '@resources/constants'
import { addToQueue } from '@resources/bgd/features/bdris-queue/service'
import { createWebHookResponseFromBundle } from '@resources/bgd/features/validate/service'

const logger = Pino()

export async function bgdValidateRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const bundle = request.payload as fhir.Bundle

    if (VALIDATE_IN_BDRIS2 === 'true') {
      // Add to queue for worker to pickup and validate asynchronously
      // Note: using the token like this isn't the best solution as it may expire before the queue
      // runs, not sure of a better solution without changing up how our auth works
      addToQueue(bundle, request.headers.authorization)
      return h.response().code(202)
    }

    const webHookResponse = await createWebHookResponseFromBundle(bundle)

    // send web hook to workflow service to continue registration, don't wait for response
    fetch(CONFIRM_REGISTRATION_URL, {
      method: 'POST',
      body: JSON.stringify(webHookResponse),
      headers: { Authorization: request.headers.authorization }
    })
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
