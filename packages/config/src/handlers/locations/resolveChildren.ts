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
import {
  SavedBundle,
  Location,
  resourceIdentifierToUUID
} from '@opencrvs/commons/types'
import { FHIR_URL } from '@config/config/constants'
import { UUID } from '@opencrvs/commons'
import { compact } from 'lodash'
import { ServerRoute } from '@hapi/hapi'

/**
 * Fetches the location itself and the children of it as a flat FHIR array
 */
async function fetchLocationChildren(locationId: UUID) {
  const locationHierarchyUrl = new URL(
    `Location?_count=0&status=active&partof=${locationId}`,
    FHIR_URL
  )

  const response = await fetch(locationHierarchyUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch locations: ${await response.text()}`)
  }

  const bundle = (await response.json()) as SavedBundle<Location>
  return bundle.entry.map(({ resource }) => resource)
}

export const resolveLocationLeafLevel: ServerRoute['handler'] = async (req) => {
  const { locationId } = req.params as { locationId: UUID }
  const locations = await fetchLocationChildren(locationId)
  const allPartOfs = compact(
    locations.map(
      ({ partOf }) => partOf && resourceIdentifierToUUID(partOf.reference)
    )
  )

  // Finds the locations that aren't part of anything
  return locations.filter(({ id }) => !allPartOfs.includes(id))
}
