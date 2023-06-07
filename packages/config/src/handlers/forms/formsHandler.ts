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
import { COUNTRY_CONFIG_URL } from '@config/config/constants'
import { internal } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'
import fetch from 'node-fetch'

async function getForm(token: string) {
  const response = await fetch(`${COUNTRY_CONFIG_URL}/forms`, {
    headers: {
      Authorization: token
    }
  })

  if (response.status !== 200) {
    return { birth: { sections: [] } }
  }

  return response.json()
}

export default async function getSystems(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    return await getForm(request.headers.authorization)
  } catch (error) {
    throw internal(error.message)
  }
}
