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
import { SavedLocation } from '@search/../../commons/build/dist/types'
import { APPLICATION_CONFIG_URL } from '@search/constants'

const FETCH_LEAF_LEVELS_LOCATION_URL = (id: UUID) =>
  new URL(`/locations/${id}/leaf`, APPLICATION_CONFIG_URL)

export async function resolveLocationLeafLevels(locationId: UUID) {
  const response = await fetch(FETCH_LEAF_LEVELS_LOCATION_URL(locationId))
  if (!response.ok) {
    throw new Error(
      "Couldn't fetch the leaf level location from config: " +
        (await response.text())
    )
  }

  const locations = (await response.json()) as Array<SavedLocation>
  return locations.map((location) => location.id)
}
