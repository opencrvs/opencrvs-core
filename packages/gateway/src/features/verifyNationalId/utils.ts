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

import { OSIA_REST_URL, OSIA_SERVICE_VERSION } from '@gateway/constants'
import fetch from 'node-fetch'

const OSIA_USERINFO_ENDPOINT = (nationalId: string) =>
  OSIA_REST_URL &&
  new URL(
    `${OSIA_SERVICE_VERSION}/persons/${nationalId}`,
    OSIA_REST_URL
  ).toString()

export const verifyUserInfoWithOSIA = async ({
  nationalId,
  firstName,
  lastName,
  birthDate
}: {
  nationalId: string
  firstName: string
  lastName: string
  birthDate: string
}) => {
  console.log('MY URL: ', OSIA_USERINFO_ENDPOINT(nationalId))
  const request = await fetch(OSIA_USERINFO_ENDPOINT(nationalId)!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      firstName,
      lastName,
      dateOfBirth: birthDate
    })
  })

  if (!request.ok) {
    throw new Error(
      `Couldn't verify user info with OSIA: ${JSON.stringify(
        await request.text(),
        null,
        4
      )}`
    )
  }

  /** Response is information about non matching attributes. Returns a list of matching result. An empty list indicates all attributes were matching. */
  const response = await request.json()

  if (response.length === 0) {
    return { nationalId, verified: true }
  } else {
    throw new Error(
      `Couldn't verify user info with OSIA: ${JSON.stringify(response)}`
    )
  }
}
