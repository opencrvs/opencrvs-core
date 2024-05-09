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
import { Location, SavedBundle } from '@opencrvs/commons/types'
import { FHIR_URL } from '@config/config/constants'
import { memoize } from 'lodash'

function addPathToBase(base: string, path: string) {
  const baseWithSlash = base.endsWith('/') ? base : base + '/'
  return new URL(path, baseWithSlash)
}

export const fetchLocations = memoize(async () => {
  const allLocationsUrl = addPathToBase(
    FHIR_URL,
    `Location?_count=0&status=active`
  )
  const response = await fetch(allLocationsUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch locations: ${await response.text()}`)
  }

  const bundle = (await response.json()) as SavedBundle<Location>
  return bundle.entry.map(({ resource }) => resource)
})

export const fetchFromHearth = async <T = any>(
  suffix: string,
  method = 'GET',
  body: string | undefined = undefined
): Promise<T> => {
  const response = await fetch(addPathToBase(FHIR_URL, suffix), {
    method,
    headers: {
      'Content-Type': 'application/fhir+json'
    },
    body
  })

  if (!response.ok) {
    throw new Error('Fetch from Hearth failed: ' + (await response.text()))
  }

  return (await response.json()) as Promise<T>
}

export const sendToFhir = async (
  body: string,
  suffix: string,
  method: string,
  token: string
) => {
  return fetch(`${FHIR_URL}${suffix}`, {
    method,
    body,
    headers: {
      'Content-Type': 'application/fhir+json',
      Authorization: `${token}`
    }
  })
    .then((response) => {
      return response
    })
    .catch((error) => {
      return Promise.reject(
        new Error(`FHIR ${method} failed: ${error.message}`)
      )
    })
}
