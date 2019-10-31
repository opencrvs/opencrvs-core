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
import {
  GQLLocation,
  GQLUser,
  GQLHumanName,
  GQLIdentifier
} from '@opencrvs/gateway/src/graphql/schema'
import { storage } from '@opencrvs/performance/src/storage'

export const USER_DETAILS = 'USER_DETAILS'

export interface ILocation {
  id: string
  identifier?: IIdentifier[]
  name?: string
  status?: string
}

export interface IIdentifier {
  system: string
  value: string
}
export interface IGQLLocation {
  id: string
  identifier?: IIdentifier[]
  name?: string
  status?: string
}

export interface IUserDetails {
  role?: string
  name?: Array<GQLHumanName | null>
  catchmentArea?: ILocation[]
  primaryOffice?: ILocation
}

export function getUserDetails(user: GQLUser): IUserDetails {
  const { catchmentArea, primaryOffice, name, role } = user
  const userDetails: IUserDetails = {}
  if (name) {
    userDetails.name = name
  }
  if (role) {
    userDetails.role = role
  }
  if (primaryOffice) {
    userDetails.primaryOffice = {
      id: primaryOffice.id,
      name: primaryOffice.name,
      status: primaryOffice.status
    }
  }

  if (catchmentArea) {
    const areaWithLocations: GQLLocation[] = catchmentArea as GQLLocation[]
    const potentialCatchmentAreas = areaWithLocations.map(
      (cArea: GQLLocation) => {
        if (cArea.identifier) {
          const identifiers: GQLIdentifier[] = cArea.identifier as GQLIdentifier[]
          return {
            id: cArea.id,
            name: cArea.name,
            status: cArea.status,
            identifier: identifiers.map((identifier: GQLIdentifier) => {
              return {
                system: identifier.system,
                value: identifier.value
              }
            })
          }
        }
      }
    ) as IGQLLocation[]
    if (potentialCatchmentAreas !== undefined) {
      userDetails.catchmentArea = potentialCatchmentAreas
    }
  }
  return userDetails
}

export function getUserLocation(userDetails: IUserDetails) {
  if (!userDetails.primaryOffice) {
    throw Error('The user has no primary office')
  }

  return userDetails.primaryOffice
}

export async function storeUserDetails(userDetails: IUserDetails) {
  storage.setItem(USER_DETAILS, JSON.stringify(userDetails))
}
