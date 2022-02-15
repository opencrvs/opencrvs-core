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
import { fhirUrl, COUNTRY_CONFIG_URL, SEARCH_URL } from '@metrics/constants'

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
    .then((response) => {
      return response.json() as Promise<T>
    })
    .catch((error) => {
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
  const url = [COUNTRY_CONFIG_URL.replace(/\/$/, ''), suffix].join('/')
  return fetch(url, {
    method,
    headers: {
      ...authHeader
    },
    body
  })
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
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
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
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
