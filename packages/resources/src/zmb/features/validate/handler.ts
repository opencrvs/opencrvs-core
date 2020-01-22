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
import { CONFIRM_REGISTRATION_URL } from '@resources/constants'
import { createWebHookResponseFromBundle } from '@resources/zmb/features/validate/service'

const logger = Pino()

export async function zmbValidateRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const bundle = request.payload as fhir.Bundle

    const webHookResponse = await createWebHookResponseFromBundle(bundle)

    // This fetch can be moved to a custom task when validating externally
    fetch(CONFIRM_REGISTRATION_URL, {
      method: 'POST',
      body: JSON.stringify(webHookResponse),
      headers: {
        Authorization: request.headers.authorization,
        'Content-Type': 'application/json'
      }
    })
  } catch (err) {
    fetch(CONFIRM_REGISTRATION_URL, {
      method: 'POST',
      body: JSON.stringify({ error: err.message }),
      headers: {
        Authorization: request.headers.authorization,
        'Content-Type': 'application/json'
      }
    })

    logger.error(err)
  }

  return h.response().code(202)
}
