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
import { UUID } from '@opencrvs/commons'
import {
  Location,
  ResourceIdentifier,
  SavedLocation
} from '@opencrvs/commons/types'

interface IBirth {
  REGISTRATION_TARGET: number
  LATE_REGISTRATION_TARGET: number
  PRINT_IN_ADVANCE: boolean
}
interface IDeath {
  REGISTRATION_TARGET: number
  PRINT_IN_ADVANCE: boolean
}

interface IMarriage {
  REGISTRATION_TARGET: number
  PRINT_IN_ADVANCE: boolean
}
export interface ICountryLogo {
  fileName: string
  file: string
}

export interface ILoginBackground {
  backgroundColor: string
  backgroundImage: string
  imageFit: string
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
  MARRIAGE: IMarriage
  HEALTH_FACILITY_FILTER: string
  FIELD_AGENT_AUDIT_LOCATIONS: string
  DECLARATION_AUDIT_LOCATIONS: string
  EXTERNAL_VALIDATION_WORKQUEUE: boolean
  PHONE_NUMBER_PATTERN: string
  LOGIN_BACKGROUND: ILoginBackground
}

type LocationType = 'CRVS_OFFICE' | 'HEALTH_FACILITY' | 'ADMIN_STRUCTURE'

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

const FETCH_ALL_LOCATION_CHILDREN = (id: UUID, type?: LocationType) => {
  const typeQuery = type ? `?type=${type}` : ''
  return new URL(`/locations/${id}/children${typeQuery}`, CONFIG_API_URL)
}

export const fetchLocationChildren = async (id: UUID, type?: LocationType) => {
  const response = await fetch(FETCH_ALL_LOCATION_CHILDREN(id, type))

  if (!response.ok) {
    throw new Error(
      `Couldn't fetch the children of a location from config: ${await response.text()}`
    )
  }

  return response.json() as Promise<SavedLocation[]>
}

export const fetchLocationChildrenIds = async (
  id: ResourceIdentifier<Location>,
  typeFilter?: LocationType
) => {
  // TODO: Migrate InfluxDB to use UUID's instead of the "Location/" prefix
  const locations = await fetchLocationChildren(
    id.replace('Location/', '') as UUID,
    typeFilter
  )
  return locations.map(({ id }) => `Location/${id}`)
}
