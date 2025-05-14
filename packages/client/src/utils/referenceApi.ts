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
import { ISerializedForm } from '@client/forms'
import { Conditional } from '@client/forms/conditionals'
import { Validator } from '@client/forms/validators'
import { ILanguage } from '@client/i18n/reducer'
import {
  AdminStructure,
  CRVSOffice,
  Facility,
  ILocation
} from '@client/offline/reducer'
import { getToken } from '@client/utils/authUtils'
import { EventType, System } from '@client/utils/gateway'
import { IntlShape } from 'react-intl'

export interface ILocationDataResponse {
  [locationId: string]: AdminStructure
}
export interface IFacilitiesDataResponse {
  [facilityId: string]: Facility
}

export const SearchCriteria = {
  TRACKING_ID: 'TRACKING_ID',
  REGISTRATION_NUMBER: 'REGISTRATION_NUMBER',
  NATIONAL_ID: 'NATIONAL_ID',
  NAME: 'NAME',
  PHONE_NUMBER: 'PHONE_NUMBER',
  EMAIL: 'EMAIL'
} as const

export type SearchCriteriaType = keyof typeof SearchCriteria

export interface IOfficesDataResponse {
  [facilityId: string]: CRVSOffice
}

export type FontFamilyTypes = {
  normal: string
  bold: string
  italics: string
  bolditalics: string
}

export type CertificateConfiguration = Partial<{
  fonts: Record<string, FontFamilyTypes>
}>

export interface IContentResponse {
  languages: ILanguage[]
}

export interface LoadFormsResponse {
  forms: {
    version: string
    birth: ISerializedForm
    death: ISerializedForm
    marriage: ISerializedForm
  }
}

interface ICountryLogo {
  fileName: string
  file: string
}
interface ILoginBackground {
  backgroundColor?: string
  backgroundImage?: string
  imageFit?: string
}
export interface ICertificateConfigData {
  id: string
  event: EventType
  label: {
    id: string
    defaultMessage: string
    description: string
  }
  isDefault: boolean
  fee: {
    onTime: number
    late: number
    delayed: number
  }
  svgUrl: string
  fonts?: Record<string, FontFamilyTypes>
}

export interface ICertificateData extends ICertificateConfigData {
  hash?: string
  svg: string
}

export interface ICurrency {
  isoCode: string
  languagesAndCountry: string[]
}

export interface IApplicationConfigAnonymous {
  APPLICATION_NAME: string
  COUNTRY_LOGO: ICountryLogo
  LOGIN_BACKGROUND: ILoginBackground
  PHONE_NUMBER_PATTERN: RegExp
}

export interface IApplicationConfig {
  APPLICATION_NAME: string
  BIRTH: {
    REGISTRATION_TARGET: number
    LATE_REGISTRATION_TARGET: number
    PRINT_IN_ADVANCE: boolean
  }
  COUNTRY_LOGO: ICountryLogo
  CURRENCY: ICurrency
  DEATH: {
    REGISTRATION_TARGET: number
    PRINT_IN_ADVANCE: boolean
  }
  MARRIAGE: {
    REGISTRATION_TARGET: number
    PRINT_IN_ADVANCE: boolean
  }
  FEATURES: {
    DEATH_REGISTRATION: boolean
    MARRIAGE_REGISTRATION: boolean
    EXTERNAL_VALIDATION_WORKQUEUE: boolean
    PRINT_DECLARATION: boolean
    DATE_OF_BIRTH_UNKNOWN: boolean
  }
  FIELD_AGENT_AUDIT_LOCATIONS: string
  DECLARATION_AUDIT_LOCATIONS: string
  PHONE_NUMBER_PATTERN: RegExp
  NID_NUMBER_PATTERN: RegExp
  LOGIN_BACKGROUND: ILoginBackground
  USER_NOTIFICATION_DELIVERY_METHOD: string
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: string
  SEARCH_DEFAULT_CRITERIA?: SearchCriteriaType
}
export interface IApplicationConfigResponse {
  config: IApplicationConfig
  certificates: ICertificateConfigData[]
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

  if (res && res.status === 422) {
    const err = new Error((await res.json()).message, {
      cause: 'VALIDATION_ERROR'
    })
    throw err
  }

  if (res && res.status !== 200) {
    throw Error(res.statusText)
  }
  const response = await res.json()
  return response
}

async function loadConfigAnonymousUser(): Promise<
  Partial<IApplicationConfigResponse>
> {
  const url = `${window.config.CONFIG_API_URL}/publicConfig`
  const res = await fetch(url, {
    method: 'GET'
  })

  if (res && res.status !== 200) {
    throw Error(res.statusText)
  }
  return await res.json()
}

async function loadForms(): Promise<LoadFormsResponse> {
  const url = `${window.config.CONFIG_API_URL}/forms`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })
  if (res.status === 422) {
    const err = new Error((await res.json()).message, {
      cause: 'VALIDATION_ERROR'
    })
    throw err
  }

  if (res && !res.ok) {
    throw new Error(res.statusText)
  }

  const response = await res.json()

  return {
    forms: { ...response }
  }
}

export type LoadValidatorsResponse = Record<string, Validator>
async function importValidators(): Promise<LoadValidatorsResponse> {
  // https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
  const validators = await import(
    /* @vite-ignore */ `${window.config.COUNTRY_CONFIG_URL}/validators.js`
  )

  return validators
}

export type LoadConditionalsResponse = Record<string, Conditional>
export async function importConditionals(): Promise<LoadConditionalsResponse> {
  // https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
  const { conditionals } = await import(
    /* @vite-ignore */ `${window.config.COUNTRY_CONFIG_URL}/conditionals.js`
  )
  return conditionals
}

type InjectedUtilities = {
  intl: IntlShape
}

export type LoadHandlebarHelpersResponse = Record<
  string,
  (injectedUtilities: InjectedUtilities) => Handlebars.HelperDelegate
>

async function importHandlebarHelpers(): Promise<LoadHandlebarHelpersResponse> {
  try {
    // https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
    const handlebars = await import(
      /* @vite-ignore */ `${window.config.COUNTRY_CONFIG_URL}/handlebars.js`
    )
    return handlebars
  } catch (error) {
    return {}
  }
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
  return {
    id: fhirLocation.id as string,
    name: fhirLocation.name as string,
    statisticalId:
      fhirLocation.identifier
        ?.find(
          (id) => id.system === 'http://opencrvs.org/specs/id/statistical-code'
        )
        ?.value?.replace('ADMIN_STRUCTURE_', '') ?? '',
    alias:
      fhirLocation.alias && fhirLocation.alias[0] ? fhirLocation.alias[0] : '',
    status: fhirLocation.status as string,
    physicalType:
      fhirLocation.physicalType &&
      fhirLocation.physicalType.coding &&
      fhirLocation.physicalType.coding[0].display
        ? fhirLocation.physicalType.coding[0].display
        : '',
    jurisdictionType:
      fhirLocation.identifier?.find(
        (id) => id.system === 'http://opencrvs.org/specs/id/jurisdiction-type'
      )?.value ?? '',
    type:
      fhirLocation.type &&
      fhirLocation.type.coding &&
      fhirLocation.type.coding[0].code
        ? fhirLocation.type.coding[0].code
        : '',
    partOf:
      fhirLocation.partOf && fhirLocation.partOf.reference
        ? fhirLocation.partOf.reference
        : ''
  }
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
  loadConfig,
  loadForms,
  importValidators,
  importConditionals,
  importHandlebarHelpers,
  loadConfigAnonymousUser
}
