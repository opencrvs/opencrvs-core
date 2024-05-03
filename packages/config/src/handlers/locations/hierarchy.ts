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
import { SavedLocation } from '@opencrvs/commons/types'
import { ServerRoute } from '@hapi/hapi'
import { FHIR_URL } from '@config/config/constants'

async function fetchLocation(locationId: string) {
  const url = new URL(`Location/${locationId}`, FHIR_URL)
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  })
  if (!res.ok) {
    throw new Error('Failed to get location')
  }
  return (await res.json()) as SavedLocation
}

export const locationHierarchyHandler: ServerRoute['handler'] = async (req) => {
  const { locationId } = req.params as { locationId: string }
  let location = await fetchLocation(locationId)
  const hierarchy = [location]
  let parentLocationId = location.partOf?.reference.split('/').at(1)
  while (parentLocationId && parentLocationId !== '0') {
    location = await fetchLocation(parentLocationId)
    hierarchy.push(location)
    parentLocationId = location.partOf?.reference.split('/').at(1)
  }
  return hierarchy.reverse()
}
