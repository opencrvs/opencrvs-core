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
import fetch from 'node-fetch'
import { CONFIG_API_URL } from '@metrics/constants'
import { Document } from 'mongoose'

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
  CURRENCY: ICurrency
  COUNTRY_LOGO: ICountryLogo
  HEALTH_FACILITY_FILTER: string
  PHONE_NUMBER_PATTERN: string
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

export async function getDashboardQueries(): Promise<
  Array<{ collection: string; aggregate: Document[] }>
> {
  return fetch(`${CONFIG_API_URL}/dashboardQueries`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(
        new Error(`Dashboard queries request failed: ${error.message}`)
      )
    })
}