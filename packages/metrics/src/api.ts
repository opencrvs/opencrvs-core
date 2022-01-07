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
import { IAuthHeader } from '@metrics/features/registration'
import {
  CONFIG_API_URL,
  fhirUrl,
  RESOURCE_URL,
  SEARCH_URL
} from '@metrics/constants'

export function fetchFHIR<T = any>(
  suffix: string,
  authHeader: IAuthHeader,
  method: string = 'GET',
  body?: string
) {
  const url = [fhirUrl.replace(/\/$/, ''), suffix].join('/')
  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/fhir+json',
      ...authHeader
    },
    body
  })
    .then(response => {
      return response.json() as Promise<T>
    })
    .catch(error => {
      return Promise.reject(new Error(`FHIR request failed: ${error.message}`))
    })
}

export function fetchTaskHistory(taskId: string, authHeader: IAuthHeader) {
  return fetchFHIR<fhir.Bundle>(`Task/${taskId}/_history`, authHeader)
}

export const fetchLocation = async (
  locationId: string,
  authHeader: IAuthHeader
) => {
  return await fetchFHIR(
    locationId.startsWith('Location/') ? locationId : `Location/${locationId}`,
    authHeader
  )
}

export async function fetchParentLocationByLocationID(
  locationID: string,
  authHeader: IAuthHeader
) {
  const location = await fetchFHIR(locationID, authHeader)
  return location && location.partOf && location.partOf.reference
}

export async function fetchTaskIdByCompositionID(
  compositionId: string,
  authHeader: IAuthHeader
) {
  const taskBundle = await fetchFHIR(
    `Task?focus=Composition/${compositionId}`,
    authHeader
  )
  if (!taskBundle.entry[0] || !taskBundle.entry[0].resource) {
    return null
  }
  return taskBundle.entry[0].resource.id
}

export async function fetchChildLocationsByParentId(
  locationId: string,
  authHeader: IAuthHeader
): Promise<fhir.Location[]> {
  const bundle = await fetchFHIR(
    `Location?_count=0&type=ADMIN_STRUCTURE&partof=${locationId}`,
    authHeader
  )
  return bundle?.entry?.map((entry: fhir.BundleEntry) => entry.resource) ?? []
}
export function fetchFromResource(
  suffix: string,
  authHeader: IAuthHeader,
  method: string = 'GET',
  body?: string
) {
  const url = [RESOURCE_URL.replace(/\/$/, ''), suffix].join('/')
  return fetch(url, {
    method,
    headers: {
      ...authHeader
    },
    body
  })
    .then(response => {
      return response.json()
    })
    .catch(error => {
      return Promise.reject(
        new Error(`RESOURCE request failed: ${error.message}`)
      )
    })
}

export function fetchAllFromSearch(authHeader: IAuthHeader) {
  return fetch(`${SEARCH_URL}search/all`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    }
  })
    .then(response => {
      return response.json()
    })
    .catch(error => {
      return Promise.reject(
        new Error(`Search request failed: ${error.message}`)
      )
    })
}

export const fetchPractitionerRole = async (
  practitionerId: string,
  authHeader: IAuthHeader
) => {
  const roleBundle: fhir.Bundle = await fetchFHIR(
    `PractitionerRole?practitioner=${practitionerId}`,
    authHeader
  )
  const practitionerRole =
    roleBundle &&
    roleBundle.entry &&
    roleBundle.entry &&
    roleBundle.entry.length > 0 &&
    (roleBundle.entry[0].resource as fhir.PractitionerRole)

  const roleCode =
    practitionerRole &&
    practitionerRole.code &&
    practitionerRole.code.length > 0 &&
    practitionerRole.code[0].coding &&
    practitionerRole.code[0].coding[0].code

  if (roleCode) {
    return roleCode
  } else {
    return Promise.reject(new Error(`Role code cannot be found`))
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

export interface IApplicationConfig {
  BACKGROUND_SYNC_BROADCAST_CHANNEL: string
  COUNTRY: string
  COUNTRY_LOGO_FILE: string
  COUNTRY_LOGO_RENDER_WIDTH: number
  COUNTRY_LOGO_RENDER_HEIGHT: number
  DESKTOP_TIME_OUT_MILLISECONDS: number
  HEALTH_FACILITY_FILTER: string
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
}

export async function getApplicationConfig(): Promise<IApplicationConfig> {
  return fetch(`${CONFIG_API_URL}/getConfig`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      return response.json()
    })
    .catch(error => {
      return Promise.reject(
        new Error(`Application config request failed: ${error.message}`)
      )
    })
}
