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
import { logger } from '@opencrvs/commons'
import { COUNTRY_CONFIG_URL } from '@gateway/constants'
import fetch from '@gateway/fetch'

export async function formsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const token = request.headers.authorization as string
  const url = new URL('forms', COUNTRY_CONFIG_URL).toString()
  const response = await fetch(url, {
    headers: {
      Authorization: token
    }
  })

  if (response.status !== 200) {
    logger.error(
      `Gateway failed to fetch form definition from ${url}. Check country config logs for more details`
    )
    return h.response().code(500)
  }

  const forms = await response.json()
  return h.response(forms).code(200)
}
