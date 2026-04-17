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
import { ILocation } from '@client/offline/reducer'
import { ISearchLocation as SearchLocation } from '@opencrvs/components/lib/LocationSearch'
import { IntlShape, MessageDescriptor } from 'react-intl'
import { locationMessages } from '@client/i18n/messages'
import { countries } from '@client/utils/countries'
import { getDefaultLanguage } from '@client/i18n/utils'
import {
  AdministrativeArea,
  joinValues,
  Location,
  UUID
} from '@opencrvs/commons/client'
import { getAdministrativeAreaHierarchy } from '../v2-events/utils'

export function filterLocations(
  locations: { [key: string]: ILocation },
  allowedType: string,
  match?: {
    locationLevel: keyof ILocation // ex: 'partOf' or 'id'
    locationId?: string
  }
): { [key: string]: ILocation } {
  const filteredLocations: { [key: string]: ILocation } = {}
  Object.values(locations).forEach((location: ILocation) => {
    if (
      location.type === allowedType.toString() &&
      (!match ||
        !match.locationId ||
        location[match.locationLevel] === match.locationId)
    ) {
      filteredLocations[location.id] = location
    }
  })

  return filteredLocations
}

export function generateLocationName(
  location: ILocation | undefined,
  intl: IntlShape
) {
  // when health institution in place of delivery is set null in birth registration form
  if (!location) {
    return ''
  }
  let name = getLocalizedLocationName(intl, location)
  location.jurisdictionType &&
    (name += ` ${
      intl.formatMessage(locationMessages[location.jurisdictionType]) || ''
    }`.trimEnd())
  return name
}

/**
 * @deprecated
 *
 * Given locations and administrative areas maps, creates searchable options to be used in location search inputs.
 */
export function createSearchOptions({
  locations,
  administrativeAreas,
  filter
}: {
  locations: Map<UUID, Location>
  administrativeAreas: Map<UUID, AdministrativeArea>
  filter?: (location: Location | AdministrativeArea) => boolean
}) {
  let locationsArr = Array.from(locations.values())
  let administrativeAreasArr = Array.from(administrativeAreas.values())

  // 1. Apply filter to both locations and administrative areas if provided.
  if (filter) {
    locationsArr = locationsArr.filter(filter)
    administrativeAreasArr = administrativeAreasArr.filter(filter)
  }

  // 2. Map locations and administrative areas to SearchLocation format.
  const locationOptions: SearchLocation[] = locationsArr.map((location) => {
    // 3a. For locations, get the full administrative area hierarchy for display label. e.g. 'Office, District, Province'
    const hierarchy = getAdministrativeAreaHierarchy(
      location.administrativeAreaId,
      administrativeAreas
    )

    return {
      id: location.id,
      searchableText: location.name,
      displayLabel: joinValues(
        [location.name, ...hierarchy.map((area) => area.name)],
        ', '
      )
    }
  })

  return locationOptions
}

export function getJurisidictionType(
  locations: { [key: string]: ILocation },
  locationId: string
): string {
  const relevantLocation = locations[locationId]

  if (!relevantLocation) {
    throw new Error(`Location ${locationId} not found`)
  }

  return relevantLocation.jurisdictionType as string
}

type LocationName = string | MessageDescriptor

export function getLocationNameMapOfFacility(
  facilityLocation: ILocation,
  offlineLocations: Record<string, ILocation>,
  countryAsString?: boolean
): Record<string, LocationName> {
  let location: ILocation = facilityLocation
  let continueLoop = true
  const map: Record<string, LocationName> = { facility: location.name }
  while (location.partOf && continueLoop) {
    const parent = location.partOf.split('/')[1]
    if (parent === '0') {
      continueLoop = false
      map.country = countryAsString
        ? (countries.find(({ value }) => value === window.config.COUNTRY)?.label
            .defaultMessage as string)
        : (countries.find(({ value }) => value === window.config.COUNTRY)
            ?.label as MessageDescriptor)
    } else {
      location = offlineLocations[parent]
      map[location.jurisdictionType?.toLowerCase() as string] = location.name
    }
  }
  return map
}

function getLocalizedLocationName(intl: IntlShape, location: ILocation) {
  if (intl.locale === getDefaultLanguage()) {
    return location.name
  } else {
    return location.alias?.toString()
  }
}

/**
 * Determines if the given other location is under the jurisdiction (administrative area) of the specified location.
 *
 * @param {string} params.locationId - The UUID of the reference location (the one representing the office's jurisdiction).
 * @param {string} params.otherLocationId - The UUID of the location to check against the jurisdiction.
 * @param {Map<UUID, Location>} params.locations - A map of all locations, keyed by UUID.
 * @param {Map<UUID, AdministrativeArea>} params.administrativeAreas - A map of administrative areas, keyed by UUID.
 * @returns {boolean} True if the other location falls under the parent administrative area of the given location, otherwise false.
 */
export function isLocationUnderJurisdiction({
  locationId,
  otherLocationId,
  locations,
  administrativeAreas
}: {
  locationId: string
  otherLocationId: string
  locations: Map<UUID, Location>
  administrativeAreas: Map<UUID, AdministrativeArea>
}) {
  const location = locations.get(UUID.parse(locationId))
  const otherLocation = locations.get(UUID.parse(otherLocationId))
  const officeAdministrativeAreaId = location?.administrativeAreaId
  const otherLocationAdministrativeAreaId = otherLocation?.administrativeAreaId

  if (!officeAdministrativeAreaId || !otherLocationAdministrativeAreaId) {
    return false
  }

  const parentAdministrativeArea = administrativeAreas.get(
    officeAdministrativeAreaId
  )
  if (!parentAdministrativeArea) {
    return false
  }

  const hierarchy = getAdministrativeAreaHierarchy(
    otherLocationAdministrativeAreaId,
    administrativeAreas
  )

  return hierarchy.some(({ id }) => id === parentAdministrativeArea.id)
}
