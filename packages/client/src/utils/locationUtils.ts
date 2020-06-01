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
import { ILocation } from '@client/offline/reducer'
import { IUserDetails, IGQLLocation, IIdentifier } from './userUtils'
import { SYS_ADMIN_ROLES, JURISDICTION_TYPE } from './constants'
import { ISearchLocation } from '@opencrvs/components/lib/interface/LocationSearch/LocationSearch'

export function filterLocations(
  locations: { [key: string]: ILocation },
  filterValue: string,
  userDetails: IUserDetails
): { [key: string]: ILocation } {
  const locationsCopy = Object.assign({}, locations)
  Object.values(locationsCopy).forEach((location: ILocation) => {
    if (
      location.partOf !== `Location/${filterValue}` &&
      !(
        userDetails.role &&
        SYS_ADMIN_ROLES.includes(userDetails.role) &&
        location.type === 'CRVS_OFFICE'
      )
    ) {
      delete locationsCopy[location.id]
    }
  })

  return locationsCopy
}

export function getLocation(userDetails: IUserDetails, locationKey: string) {
  if (!userDetails.catchmentArea) {
    throw Error('The user has no catchment area')
  }
  const filteredArea: IGQLLocation[] = userDetails.catchmentArea.filter(
    (area: IGQLLocation) => {
      if (area.identifier) {
        const relevantIdentifier: IIdentifier[] = area.identifier.filter(
          (identifier: IIdentifier) => {
            return identifier.value === locationKey
          }
        )
        return relevantIdentifier[0] ? area : false
      } else {
        throw Error('The catchment area has no identifier')
      }
    }
  )
  return filteredArea[0] ? filteredArea[0].id : ''
}

export function generateLocations(
  locations: { [key: string]: ILocation },
  filterByJurisdictionTypes?: string[]
) {
  let locationArray = Object.values(locations)

  if (filterByJurisdictionTypes) {
    locationArray = locationArray.filter(
      location =>
        location.jurisdictionType &&
        filterByJurisdictionTypes.includes(location.jurisdictionType)
    )
  }

  const generated: ISearchLocation[] = locationArray.map(
    (location: ILocation) => {
      let locationName = location.name
      location.jurisdictionType &&
        (locationName += ` ${JURISDICTION_TYPE[location.jurisdictionType]}`)

      if (location.partOf && location.partOf !== 'Location/0') {
        const locRef = location.partOf.split('/')[1]
        let parent
        if ((parent = locations[locRef] && locations[locRef].name)) {
          locationName += `, ${parent}`
        }
      }

      return {
        id: location.id,
        searchableText: location.name,
        displayLabel: locationName
      }
    }
  )
  return generated
}

export function generateOfficeLocations(locations: {
  [key: string]: ILocation
}) {
  const generated: ISearchLocation[] = Object.values(locations)
    .filter(
      (location: ILocation) =>
        location.jurisdictionType && location.jurisdictionType === 'UNION'
    )
    .map((location: ILocation) => {
      let locationName = location.name
      location.jurisdictionType &&
        (locationName += ` ${JURISDICTION_TYPE[location.jurisdictionType]}`)

      if (location.partOf && location.partOf !== 'Location/0') {
        const locRef = location.partOf.split('/')[1]
        let parent
        if ((parent = locations[locRef] && locations[locRef].name)) {
          locationName += `, ${parent}`
        }
      }

      return {
        id: location.id,
        searchableText: location.name,
        displayLabel: locationName
      }
    })
  return generated
}

export function getJurisidictionType(
  locations: { [key: string]: ILocation },
  locationId: string
): string {
  const relevantLocation = Object.values(locations).filter(
    (location: ILocation) => {
      return location.id === locationId
    }
  )
  return relevantLocation[0].jurisdictionType as string
}
