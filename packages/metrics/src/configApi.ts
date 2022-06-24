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
import fetch from 'node-fetch'
import { CONFIG_API_URL } from '@metrics/constants'
interface IBirth {
  REGISTRATION_TARGET: number
  LATE_REGISTRATION_TARGET: number
  FEE: {
    ON_TIME: number
    LATE: number
    DELAYED: number
  }
}
interface IDeath {
  REGISTRATION_TARGET: number
  FEE: {
    ON_TIME: number
    DELAYED: number
  }
}
export interface ICountryLogo {
  fileName: string
  file: string
}

interface ICurrency {
  isoCode: string
  languagesAndCountry: string[]
}
export interface IApplicationConfig {
  APPLICATION_NAME: string
  BIRTH: IBirth
  CURRENCY: ICurrency
  COUNTRY_LOGO: ICountryLogo
  DEATH: IDeath
  HEALTH_FACILITY_FILTER: string
  FIELD_AGENT_AUDIT_LOCATIONS: string
  DECLARATION_AUDIT_LOCATIONS: string
  HIDE_EVENT_REGISTER_INFORMATION: boolean
  EXTERNAL_VALIDATION_WORKQUEUE: boolean
  PHONE_NUMBER_PATTERN: string
  ADDRESSES: number
}

export async function getApplicationConfig(
  authorization: string
): Promise<IApplicationConfig> {
  const token = authorization.replace('Bearer ', '')
  return fetch(`${CONFIG_API_URL}/config`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
    .then((response) => {
      return response.json()
    })
    .then((response) => {
      return response.config
    })
    .catch((error) => {
      return Promise.reject(
        new Error(`Application config request failed: ${error.message}`)
      )
    })
}
