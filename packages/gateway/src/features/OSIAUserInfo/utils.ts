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
import { OIDPUserInfo } from '@gateway/features/OIDPUserInfo/oidp-types'

const OSIA_USERINFO_ENDPOINT = (nationalId: string) =>
  OSIA_REST_URL &&
  new URL(
    `v1/persons/${nationalId}&attributeNames=uin&attributeNames=firstName&attributeNames=lastName&attributeNames=dateOfBirth`,
    OSIA_REST_URL
  ).toString()

const convertOSIAUserInfoToOIDPUserInfo = (
  osiaUserInfo: Pick<
    OSIAUserInfo,
    'uin' | 'firstName' | 'lastName' | 'dateOfBirth'
  >
): OIDPUserInfo => {
  return {
    sub: osiaUserInfo.uin,
    name: `${osiaUserInfo.firstName} ${osiaUserInfo.lastName}`,
    birthdate: osiaUserInfo.dateOfBirth
  }
}

export const fetchUserInfo = async (nationalId: string) => {
  const request = await fetch(OSIA_USERINFO_ENDPOINT(nationalId)!, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${UNSAFE__OSIA_PERSISTENT_JWT}`
    }
  })

  const response = await request.json()
  return convertOSIAUserInfoToOIDPUserInfo(response)
}
