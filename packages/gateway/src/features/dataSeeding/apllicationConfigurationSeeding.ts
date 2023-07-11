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

import { COUNTRY_CONFIG_URL, APPLICATION_CONFIG_URL } from '@gateway/constants'

import fetch from 'node-fetch'

interface IBirth {
  REGISTRATION_TARGET: number
  LATE_REGISTRATION_TARGET: number
  FEE: {
    ON_TIME: number
    LATE: number
    DELAYED: number
  }
  PRINT_IN_ADVANCE: boolean
}
interface IDeath {
  REGISTRATION_TARGET: number
  FEE: {
    ON_TIME: number
    DELAYED: number
  }
  PRINT_IN_ADVANCE: boolean
}
interface IMarriage {
  REGISTRATION_TARGET: number
  FEE: {
    ON_TIME: number
    DELAYED: number
  }
  PRINT_IN_ADVANCE: boolean
}
interface ICurrency {
  isoCode: string
  languagesAndCountry: string[]
}

interface ICountryLogo {
  fileName: string
  file: string
}

interface ILoginBackground {
  backgroundColor: string
  backgroundImage: string
  imageFit: string
}

export interface IApplicationConfigurationModel extends Document {
  APPLICATION_NAME: string
  BIRTH: IBirth
  COUNTRY_LOGO: ICountryLogo
  CURRENCY: ICurrency
  DEATH: IDeath
  MARRIAGE: IMarriage
  MARRIAGE_REGISTRATION: boolean
  FIELD_AGENT_AUDIT_LOCATIONS: string
  DECLARATION_AUDIT_LOCATIONS: string
  HIDE_BIRTH_EVENT_REGISTER_INFORMATION: boolean
  HIDE_DEATH_EVENT_REGISTER_INFORMATION: boolean
  HIDE_MARRIAGE_EVENT_REGISTER_INFORMATION: boolean
  EXTERNAL_VALIDATION_WORKQUEUE: boolean
  PHONE_NUMBER_PATTERN: RegExp
  NID_NUMBER_PATTERN: string
  ADDRESSES: number
  DATE_OF_BIRTH_UNKNOWN: boolean
  INFORMANT_SIGNATURE: boolean
  INFORMANT_SIGNATURE_REQUIRED: boolean
  ADMIN_LEVELS: number
  LOGIN_BACKGROUND: ILoginBackground
}

async function getApplicationConfig() {
  const url = new URL('application-config', COUNTRY_CONFIG_URL).toString()
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Expected to get the aplication config from ${url}`)
  }
  return res.json()
}

async function populateAppConfig(
  appConfig: IApplicationConfigurationModel,
  token: string
) {
  const res = await fetch(`${APPLICATION_CONFIG_URL}createApplicationConfig`, {
    method: 'POST',
    body: JSON.stringify(appConfig),
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    }
  })

  return res.json()
}

export async function seedApplicationConfig(token: string) {
  const appConfig = await getApplicationConfig()
  const res = await populateAppConfig(appConfig, token)
  console.log(JSON.stringify(res))
}
