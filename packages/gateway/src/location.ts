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

import { UUID } from '@opencrvs/commons'
import { Location, SavedLocation } from '@opencrvs/commons/types'
import { APPLICATION_CONFIG_URL } from './constants'

export const fetchLocation = async (id: UUID) => {
  const response = await fetch(
    new URL(`/locations/${id}`, APPLICATION_CONFIG_URL)
  )

  if (!response.ok) {
    throw new Error(
      `Couldn't fetch a location from config: ${await response.text()}`
    )
  }

  return response.json() as Promise<Location>
}

const FETCH_ALL_LOCATION_CHILDREN = (id: UUID) =>
  new URL(`/locations/${id}/children`, APPLICATION_CONFIG_URL)

export const fetchLocationChildren = async (id: UUID) => {
  const response = await fetch(FETCH_ALL_LOCATION_CHILDREN(id))

  if (!response.ok) {
    throw new Error(
      `Couldn't fetch the children of a location from config: ${await response.text()}`
    )
  }

  return response.json() as Promise<SavedLocation[]>
}
