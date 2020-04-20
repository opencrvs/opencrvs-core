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
import { fhirUrl, RESOURCE_URL, SEARCH_URL } from '@metrics/constants'

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
  return await fetchFHIR(`Location/${locationId}`, authHeader)
}

export async function fetchParentLocationByLocationID(
  locationID: string,
  authHeader: IAuthHeader
) {
  const location = await fetchFHIR(locationID, authHeader)
  return location && location.partOf && location.partOf.reference
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

export const fetchAllFromSearch = (authHeader: IAuthHeader) => {
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
