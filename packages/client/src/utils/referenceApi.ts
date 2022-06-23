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
import { IFormConfig } from '@client/forms'
import { ILanguage } from '@client/i18n/reducer'
import { ILocation } from '@client/offline/reducer'
import { getToken } from '@client/utils/authUtils'
import { Event } from '@client/utils/gateway'
import { questionsTransformer } from '@client/forms/questionConfig'

export interface ILocationDataResponse {
  [locationId: string]: ILocation
}
export interface IFacilitiesDataResponse {
  [facilityId: string]: ILocation
}
export interface IContentResponse {
  languages: ILanguage[]
}

export interface IAssetResponse {
  logo: string
}
export interface ICountryLogo {
  fileName: string
  file: string
}

export interface ICertificateTemplateData {
  event: Event
  status: string
  svgCode: string
  svgDateCreated: string
  svgDateUpdated: string
  svgFilename: string
  user: string
  id: string
}

interface ICurrency {
  isoCode: string
  languagesAndCountry: string[]
}

export interface IApplicationConfig {
  APPLICATION_NAME: string
  BACKGROUND_SYNC_BROADCAST_CHANNEL: string
  BIRTH: {
    REGISTRATION_TARGET: number
    LATE_REGISTRATION_TARGET: number
    FEE: {
      ON_TIME: number
      LATE: number
      DELAYED: number
    }
  }
  COUNTRY: string
  COUNTRY_LOGO: ICountryLogo
  CURRENCY: ICurrency
  COUNTRY_LOGO_RENDER_WIDTH: number
  COUNTRY_LOGO_RENDER_HEIGHT: number
  DESKTOP_TIME_OUT_MILLISECONDS: number
  DEATH: {
    REGISTRATION_TARGET: number
    FEE: {
      ON_TIME: number
      DELAYED: number
    }
  }
  LANGUAGES: string
  UI_POLLING_INTERVAL: number
  FIELD_AGENT_AUDIT_LOCATIONS: string
  DECLARATION_AUDIT_LOCATIONS: string
  INFORMANT_MINIMUM_AGE: number
  HIDE_EVENT_REGISTER_INFORMATION: boolean
  EXTERNAL_VALIDATION_WORKQUEUE: boolean
  SENTRY: string
  LOGROCKET: string
  PHONE_NUMBER_PATTERN: RegExp
  NID_NUMBER_PATTERN: RegExp
  ADDRESSES: number
}

export interface IApplicationConfigResponse {
  config: IApplicationConfig
  certificates: ICertificateTemplateData[]
  formConfig: IFormConfig
}

async function loadConfig(): Promise<IApplicationConfigResponse> {
  const url = `${window.config.CONFIG_API_URL}/config`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })
  if (res && res.status !== 200) {
    throw Error(res.statusText)
  }
  const response = await res.json()
  response.certificates = response.certificates.map(
    ({ _id, ...rest }: { _id: string }) => {
      return { ...rest, id: _id }
    }
  )

  response.formConfig.questionConfig = questionsTransformer(
    response.formConfig.questionConfig
  )

  return response
}

async function loadContent(): Promise<IContentResponse> {
  const url = `${window.config.COUNTRY_CONFIG_URL}/content/client`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })

  if (res && res.status !== 200) {
    throw Error(res.statusText)
  }

  const response = await res.json()

  return {
    ...response
  }
}

async function loadLocations(): Promise<ILocationDataResponse> {
  const url = `${window.config.COUNTRY_CONFIG_URL}/locations`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })

  if (res && res.status !== 200) {
    throw Error(res.statusText)
  }

  const response = await res.json()
  return response.data
}

async function loadFacilities(): Promise<IFacilitiesDataResponse> {
  const url = `${window.config.COUNTRY_CONFIG_URL}/facilities`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })

  if (res && res.status !== 200) {
    throw Error(res.statusText)
  }

  const response = await res.json()
  return response.data
}

async function loadPilotLocations(): Promise<ILocationDataResponse> {
  const url = `${window.config.COUNTRY_CONFIG_URL}/pilotLocations`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })

  if (res && res.status !== 200) {
    throw Error(res.statusText)
  }

  const response = await res.json()
  return response.data
}

export const referenceApi = {
  loadLocations,
  loadFacilities,
  loadPilotLocations,
  loadContent,
  loadConfig
}
