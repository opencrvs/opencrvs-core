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
import { EventType } from '@client/utils/gateway'
import { cacheFile } from '@client/v2-events/cache'
import { TranslationConfig } from '@opencrvs/commons/client'
import { IntlShape } from 'react-intl'
import { fetchFileFromUrl } from './imageUtils'
import { last } from 'lodash'

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

type SearchCriteriaType = keyof typeof SearchCriteria

export interface IOfficesDataResponse {
  [facilityId: string]: CRVSOffice
}

type FontFamilyTypes = {
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
interface ICertificateConfigData {
  id: string
  event: EventType
  // This is a temporary field to indicate that the certificate is a v2 template.
  // As the templates are assigned to event types per id, we would not be able to define separate templates for v1 and v2 'birth' or 'death' events without this.
  // After v1 is phased out, this field can be removed.
  isV2Template?: boolean
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

interface ICurrency {
  isoCode: string
  languagesAndCountry: string[]
}

export interface AdminStructureItem {
  id: string
  label: TranslationConfig
}

export interface IApplicationConfigAnonymous {
  APPLICATION_NAME: string
  COUNTRY_LOGO: ICountryLogo
  PHONE_NUMBER_PATTERN: RegExp | string
}

export interface IApplicationConfig {
  APPLICATION_NAME: string
  ADMIN_STRUCTURE: AdminStructureItem[]
  COUNTRY_LOGO: ICountryLogo
  CURRENCY: ICurrency
  PHONE_NUMBER_PATTERN: RegExp | string
  USER_NOTIFICATION_DELIVERY_METHOD: string
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: string
  SEARCH_DEFAULT_CRITERIA?: SearchCriteriaType
}
export interface IApplicationConfigResponse {
  config: IApplicationConfig
  certificates: ICertificateConfigData[]
}

async function loadConfig(): Promise<IApplicationConfigResponse> {
  const url = '/api/config/config'
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
  const response: IApplicationConfigResponse = await res.json()
  /*
   * We need to download all fonts used by certificates on app initialisation
   * so that if and when a certificate is printed while offline, the fonts are
   * already cached in the browser
   */
  const fonts = response.certificates.flatMap((c) =>
    Object.values(c.fonts || {}).flatMap((p) => Object.values(p))
  )
  const uniqueFonts = [...new Set(fonts)]
  const fontFiles = await Promise.all(
    uniqueFonts.map(async (font: string) => {
      return {
        url: font,
        file: (await fetchFileFromUrl(font, last(font.split('/'))!))!
      }
    })
  )

  await Promise.all(fontFiles.map((f) => cacheFile(f)))
  return response
}

async function loadConfigAnonymousUser(): Promise<
  Partial<IApplicationConfigResponse>
> {
  const url = '/api/config/publicConfig'
  const res = await fetch(url, {
    method: 'GET'
  })

  if (res && res.status !== 200) {
    throw Error(res.statusText)
  }
  return await res.json()
}

async function loadForms(): Promise<LoadFormsResponse> {
  const url = '/api/config/forms'

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
const countryconfigBase: string = '/api/countryconfig'

async function importValidators(): Promise<LoadValidatorsResponse> {
  // https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
  const validators = await import(
    /* @vite-ignore */ `${countryconfigBase}/validators.js`
  )

  return validators
}

export type LoadConditionalsResponse = Record<string, Conditional>
async function importConditionals(): Promise<LoadConditionalsResponse> {
  // https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
  const { conditionals } = await import(
    /* @vite-ignore */ `${countryconfigBase}/conditionals.js`
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
      /* @vite-ignore */ `${countryconfigBase}/handlebars.js`
    )
    return handlebars
  } catch (error) {
    return {}
  }
}

async function loadContent(): Promise<IContentResponse> {
  const url = `${countryconfigBase}/content/client`

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
  return {}
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
  return {}
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
