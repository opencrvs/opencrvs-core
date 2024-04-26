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
import { SavedBundle } from '@opencrvs/commons/types'
import * as fhir from '@opencrvs/commons/types'
import { FHIR_URL } from '@config/config/constants'
import { UUID } from '@opencrvs/commons'
import { ServerRoute } from '@hapi/hapi'
import { resolveLocationChildren } from './locationTreeSolver'

const fetchLocations = async () => {
  const allLocationsUrl = new URL(`Location?_count=0&status=active`, FHIR_URL)
  const response = await fetch(allLocationsUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch locations: ${await response.text()}`)
  }

  const bundle = (await response.json()) as SavedBundle<fhir.Location>
  return bundle.entry.map(({ resource }) => resource)
}

export const resolveChildren: ServerRoute['handler'] = async (req) => {
  const { locationId } = req.params as { locationId: UUID }
  const locations = await fetchLocations()
  return resolveLocationChildren(locationId, locations)
}
