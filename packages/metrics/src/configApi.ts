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
export interface IPhoneNumberPattern {
  pattern: RegExp
  example: string
  start: string
  num: string
  mask: {
    startForm: number
    endBefore: number
  }
}
interface ICurrency {
  isoCode: string
  languagesAndCountry: string[]
}
export interface IApplicationConfig {
  APPLICATION_NAME: string
  BACKGROUND_SYNC_BROADCAST_CHANNEL: string
  BIRTH: IBirth
  COUNTRY: string
  CURRENCY: ICurrency
  COUNTRY_LOGO_FILE: string
  COUNTRY_LOGO_RENDER_WIDTH: number
  COUNTRY_LOGO_RENDER_HEIGHT: number
  DESKTOP_TIME_OUT_MILLISECONDS: number
  DEATH: IDeath
  HEALTH_FACILITY_FILTER: string
  LANGUAGES: string
  CERTIFICATE_PRINT_LOWEST_CHARGE: number
  CERTIFICATE_PRINT_HIGHEST_CHARGE: number
  UI_POLLING_INTERVAL: number
  FIELD_AGENT_AUDIT_LOCATIONS: string
  APPLICATION_AUDIT_LOCATIONS: string
  INFORMANT_MINIMUM_AGE: number
  HIDE_EVENT_REGISTER_INFORMATION: boolean
  EXTERNAL_VALIDATION_WORKQUEUE: boolean
  SENTRY: string
  LOGROCKET: string
  PHONE_NUMBER_PATTERN: IPhoneNumberPattern
}

export async function getApplicationConfig(): Promise<IApplicationConfig> {
  return fetch(`${CONFIG_API_URL}/config`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
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
