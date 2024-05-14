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
import { SavedLocation } from '@opencrvs/commons/types'
import { APPLICATION_CONFIG_URL } from '@notification/constants'
import fetch from 'node-fetch'
import { memoize } from 'lodash'

const FETCH_LOCATION = (id: UUID) =>
  new URL(`/locations/${id}/children`, APPLICATION_CONFIG_URL)

export const fetchLocation = memoize(async (locationId: UUID) => {
  const response = await fetch(FETCH_LOCATION(locationId))
  if (!response.ok) {
    throw new Error(
      `Couldn't fetch location ${locationId} from config: ` +
        (await response.text())
    )
  }

  return response.json() as Promise<SavedLocation>
})
