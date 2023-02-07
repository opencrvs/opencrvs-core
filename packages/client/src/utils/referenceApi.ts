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
import { Event, System } from '@client/utils/gateway'
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

export interface ICountryLogo {
  fileName: string
  file: string
}
export interface ILoginBackground {
  backgroundColor?: string
  backgroundImage?: string
  imageFit?: string
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
export interface ICurrency {
  isoCode: string
  languagesAndCountry: string[]
}

export interface IApplicationConfig {
  APPLICATION_NAME: string
  BIRTH: {
    REGISTRATION_TARGET: number
    LATE_REGISTRATION_TARGET: number
    FEE: {
      ON_TIME: number
      LATE: number
      DELAYED: number
    }
  }
  COUNTRY_LOGO: ICountryLogo
  CURRENCY: ICurrency
  DEATH: {
    REGISTRATION_TARGET: number
    FEE: {
      ON_TIME: number
      DELAYED: number
    }
  }
  FIELD_AGENT_AUDIT_LOCATIONS: string
  DECLARATION_AUDIT_LOCATIONS: string
  HIDE_EVENT_REGISTER_INFORMATION: boolean
  EXTERNAL_VALIDATION_WORKQUEUE: boolean
  PHONE_NUMBER_PATTERN: RegExp
  NID_NUMBER_PATTERN: RegExp
  ADDRESSES: number
  DATE_OF_BIRTH_UNKNOWN: boolean
  INFORMANT_SIGNATURE: boolean
  INFORMANT_SIGNATURE_REQUIRED: boolean
  ADMIN_LEVELS: number
  LOGIN_BACKGROUND: ILoginBackground
}
export interface IApplicationConfigResponse {
  config: IApplicationConfig
  certificates: ICertificateTemplateData[]
  formConfig: IFormConfig
  systems: System[]
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
  const url = `${window.config.API_GATEWAY_URL}location?type=ADMIN_STRUCTURE&_count=0`

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
  const locations = {
    data: response.entry.reduce(
      (accumulator: { [key: string]: ILocation }, entry: fhir.BundleEntry) => {
        if (!entry.resource || !entry.resource.id) {
          throw new Error('Resource in entry not valid')
        }

        accumulator[entry.resource.id] = generateLocationResource(
          entry.resource as fhir.Location
        )

        return accumulator
      },
      {}
    )
  }

  return locations.data
}

function generateLocationResource(fhirLocation: fhir.Location): ILocation {
  const loc = {} as ILocation
  loc.id = fhirLocation.id as string
  loc.name = fhirLocation.name as string
  loc.alias =
    fhirLocation.alias && fhirLocation.alias[0] ? fhirLocation.alias[0] : ''
  loc.status = fhirLocation.status as string
  loc.physicalType =
    fhirLocation.physicalType &&
    fhirLocation.physicalType.coding &&
    fhirLocation.physicalType.coding[0].display
      ? fhirLocation.physicalType.coding[0].display
      : ''
  loc.type =
    fhirLocation.type &&
    fhirLocation.type.coding &&
    fhirLocation.type.coding[0].code
      ? fhirLocation.type.coding[0].code
      : ''
  loc.partOf =
    fhirLocation.partOf && fhirLocation.partOf.reference
      ? fhirLocation.partOf.reference
      : ''
  return loc
}

async function loadFacilities(): Promise<IFacilitiesDataResponse> {
  const resCRVSOffices = await fetch(
    `${window.config.API_GATEWAY_URL}location?type=CRVS_OFFICE&_count=0`
  )
  const resHealthFacilities = await fetch(
    `${window.config.API_GATEWAY_URL}location?type=HEALTH_FACILITY&_count=0`
  )

  const locationBundleCRVSOffices = await resCRVSOffices.json()
  const locationBundleHealthFacilities = await resHealthFacilities.json()

  const facilities = locationBundleCRVSOffices.entry.reduce(
    (accumulator: { [key: string]: ILocation }, entry: fhir.BundleEntry) => {
      if (!entry.resource || !entry.resource.id) {
        throw new Error('Resource in entry not valid')
      }

      accumulator[entry.resource.id] = generateLocationResource(
        entry.resource as fhir.Location
      )
      return accumulator
    },
    {}
  )

  locationBundleHealthFacilities.entry.reduce(
    (accumulator: { [key: string]: ILocation }, entry: fhir.BundleEntry) => {
      if (!entry.resource || !entry.resource.id) {
        throw new Error('Resource in entry not valid')
      }

      accumulator[entry.resource.id] = generateLocationResource(
        entry.resource as fhir.Location
      )
      return accumulator
    },
    facilities
  )

  return facilities
}

export const referenceApi = {
  loadLocations,
  loadFacilities,
  loadContent,
  loadConfig
}
