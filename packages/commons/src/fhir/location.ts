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
  Location,
  Office,
  Resource,
  resourceIdentifierToUUID,
  SavedBundle
} from '.'

export function isLocation<T extends Resource>(
  resource: T
): resource is T & Location {
  return resource.resourceType === 'Location'
}

export function isOffice<T extends Resource>(
  resource: T
): resource is T & Office {
  return (
    (isLocation(resource) &&
      resource.type?.coding?.some(({ code }) => code === 'CRVS_OFFICE')) ??
    false
  )
}

export function getOfficeFromSavedBundle<T extends SavedBundle>(bundle: T) {
  return bundle.entry.map(({ resource }) => resource).find(isOffice)
}

export function getOfficeLocationFromSavedBundle<T extends SavedBundle>(
  bundle: T
) {
  const office = getOfficeFromSavedBundle(bundle)
  if (!office || !office.partOf) {
    throw new Error('Office not found in the bundle.')
  }

  const locationId = resourceIdentifierToUUID(office.partOf.reference)
  const location = bundle.entry
    .map(({ resource }) => resource)
    .filter(isLocation)
    .find((location) => location.id === locationId)

  return location
}
