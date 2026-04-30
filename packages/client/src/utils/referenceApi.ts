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

import { ILanguage } from '@client/i18n/reducer'
import { AdminStructure, CRVSOffice, Facility } from '@client/offline/reducer'
import { getToken } from '@client/utils/authUtils'
import { EventType } from '@client/utils/gateway'
import { cacheFile } from '@client/v2-events/cache'
import { ApplicationConfig, TranslationConfig } from '@opencrvs/commons/client'
import { IntlShape } from 'react-intl'
import { fetchFileFromUrl } from './imageUtils'
import { last } from 'lodash'

interface Conditional {
  description?: string
  action: string
  expression: string
}

export interface ILocationDataResponse {
  [locationId: string]: AdminStructure
}
export interface IFacilitiesDataResponse {
  [facilityId: string]: Facility
}

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

export interface AdminStructureItem {
  id: string
  label: TranslationConfig
}

export interface IApplicationConfigAnonymous {
  APPLICATION_NAME: string
  COUNTRY_LOGO: ICountryLogo
  PHONE_NUMBER_PATTERN: RegExp | string
}

export interface IApplicationConfigResponse {
  config: ApplicationConfig
  certificates: ICertificateConfigData[]
}

async function loadConfig(): Promise<IApplicationConfigResponse> {
  const url = '/api/config'
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
  const url = '/api/publicConfig'
  const res = await fetch(url, {
    method: 'GET'
  })

  if (res && res.status !== 200) {
    throw Error(res.statusText)
  }
  return await res.json()
}

const countryconfigBase: string = '/api/countryconfig'

type LoadConditionalsResponse = Record<string, Conditional>
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

async function loadFacilities(): Promise<IFacilitiesDataResponse> {
  return {}
}

export const referenceApi = {
  loadLocations,
  loadFacilities,
  loadContent,
  loadConfig,
  importConditionals,
  importHandlebarHelpers,
  loadConfigAnonymousUser
}
