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

import { OSIA_REST_URL, UNSAFE__OSIA_PERSISTENT_JWT } from '@gateway/constants'
import { logger } from '@gateway/logger'

const OSIA_USERINFO_ENDPOINT = (nationalId: string) =>
  OSIA_REST_URL &&
  new URL(`v1/persons/${nationalId}/match`, OSIA_REST_URL).toString()

export const verifyUserInfo = async ({
  nationalId,
  firstName,
  lastName,
  dateOfBirth
}: {
  nationalId: string
  firstName: string
  lastName: string
  dateOfBirth: string
}) => {
  const request = await fetch(OSIA_USERINFO_ENDPOINT(nationalId)!, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UNSAFE__OSIA_PERSISTENT_JWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      firstName,
      lastName,
      dateOfBirth
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
    logger.warn("Couldn't verify user info with OSIA", response)
    return { nationalId, verified: false }
  }
}
