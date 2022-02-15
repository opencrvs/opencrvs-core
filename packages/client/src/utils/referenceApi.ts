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
import { ISerializedForm } from '@client/forms'
import { ILanguage } from '@client/i18n/reducer'
import { ILocation } from '@client/offline/reducer'
import {
  IPDFTemplate,
  ISVGTemplate
} from '@client/pdfRenderer/transformer/types'
import { getToken } from '@client/utils/authUtils'
import { ICertificateCollectorDefinition } from '@client/views/PrintCertificate/VerifyCollector'
import _ from 'lodash'

export interface ILocationDataResponse {
  [locationId: string]: ILocation
}
export interface IFacilitiesDataResponse {
  [facilityId: string]: ILocation
}
export interface IDefinitionsResponse {
  languages: ILanguage[]
  forms: {
    registerForm: { birth: ISerializedForm; death: ISerializedForm }
    certificateCollectorDefinition: {
      birth: ICertificateCollectorDefinition
      death: ICertificateCollectorDefinition
    }
    userForm: ISerializedForm
  }
  templates: {
    receipt?: IPDFTemplate
    certificates: {
      birth: ISVGTemplate
      death: ISVGTemplate
    }
  }
}
export interface ICertificateResponse {
  birth: {
    svgCode: string
  }
  death: {
    svgCode: string
  }
}
export interface IAssetResponse {
  logo: string
}

interface IPhoneNumberPattern {
  pattern: RegExp
  example: string
  start: string
  num: string
  mask: {
    startForm: number
    endBefore: number
  }
}

interface INIDNumberPattern {
  pattern: RegExp
  example: string
  num: string
}

export interface IApplicationConfig {
  BACKGROUND_SYNC_BROADCAST_CHANNEL: string
  COUNTRY: string
  COUNTRY_LOGO_FILE: string
  COUNTRY_LOGO_RENDER_WIDTH: number
  COUNTRY_LOGO_RENDER_HEIGHT: number
  DESKTOP_TIME_OUT_MILLISECONDS: number
  LANGUAGES: string
  CERTIFICATE_PRINT_CHARGE_FREE_PERIOD: number
  CERTIFICATE_PRINT_CHARGE_UP_LIMIT: number
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
  BIRTH_REGISTRATION_TARGET: number
  DEATH_REGISTRATION_TARGET: number
  NID_NUMBER_PATTERN: INIDNumberPattern
}

async function loadConfig(): Promise<IApplicationConfig> {
  const url = `${window.config.CONFIG_API_URL}/config`

  const res = await fetch(url, {
    method: 'GET'
  })

  if (res && res.status !== 200) {
    throw Error(res.statusText)
  }

  const response = await res.json()
  return response
}

async function loadCertificatesTemplatesDefinitions(): Promise<ICertificateResponse> {
  const url = `${window.config.COUNTRY_CONFIG_URL}/getActiveCertificates`

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

  const birthCertificateTemplate: any = _.find(response, {
    event: 'birth',
    status: 'ACTIVE'
  })

  const deathCertificateTemplate: any = _.find(response, {
    event: 'death',
    status: 'ACTIVE'
  })

  const certificatesTemplates = {
    birth: { svgCode: birthCertificateTemplate.svgCode },
    death: { svgCode: deathCertificateTemplate.svgCode }
  } as ICertificateResponse

  return certificatesTemplates
}
async function loadDefinitions(): Promise<IDefinitionsResponse> {
  const url = `${window.config.COUNTRY_CONFIG_URL}/definitions/client`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })

  if (res && res.status !== 200) {
    throw Error(res.statusText)
  }

  const certificateTemplates = await loadCertificatesTemplatesDefinitions()
  const response = await res.json()

  response.templates.certificates.birth.definition =
    certificateTemplates.birth.svgCode
  response.templates.certificates.death.definition =
    certificateTemplates.death.svgCode
  return response
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

const toDataURL = (url: string) =>
  fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
    )

async function loadAssets(): Promise<IAssetResponse> {
  const url = `${window.config.COUNTRY_CONFIG_URL}/assets/${window.config.COUNTRY_LOGO_FILE}`

  return toDataURL(url).then((dataUrl) => {
    return {
      logo: `${dataUrl}`
    }
  })
}

export const referenceApi = {
  loadLocations,
  loadFacilities,
  loadPilotLocations,
  loadDefinitions,
  loadAssets,
  loadConfig
}
