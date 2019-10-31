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
import { ILocation } from '@register/offline/reducer'
import { IUserDetails, IGQLLocation, IIdentifier } from './userUtils'
import { SYS_ADMIN_ROLES } from './constants'

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
