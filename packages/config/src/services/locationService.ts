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

import { GATEWAY_URL } from '@config/config/constants'
import { ISelectOption } from '@config/models/question'
import fetch from 'node-fetch'

export const locationService = async (queryObj: {
  [key: string]: string | number
}) => {
  const resp = await fetch(
    `${GATEWAY_URL}location?${Object.keys(queryObj)
      .map((key) => key + '=' + queryObj[key])
      .join('&')}`
  )
  return resp.json()
}

export const healthFacilityService = async (query: any) => {
  const queryObj = { ...query, _count: 0 }
  const facilities = await locationService(queryObj)

  return facilities.entry.map((i: any) => ({
    value: i.resource.id,
    label: [
      {
        lang: 'en',
        descriptor: {
          id: i.resource.id,
          defaultMessage: i.resource.name
        }
      }
    ]
  })) as ISelectOption[]
}
