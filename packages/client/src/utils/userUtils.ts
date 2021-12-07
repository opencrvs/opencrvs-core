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
  GQLIdentifier,
  GQLSignature
} from '@opencrvs/gateway/src/graphql/schema'
import { storage } from '@opencrvs/client/src/storage'
import { getDefaultLanguage } from '@client/i18n/utils'

export const USER_DETAILS = 'USER_DETAILS'

export interface IIdentifier {
  system: string
  value: string
}
export interface IGQLLocation {
  id: string
  identifier?: IIdentifier[]
  name?: string
  alias?: (string | null)[]
  status?: string
}

export interface IAvatar {
  type: string
  data: string
}

export interface IUserDetails {
  userMgntUserID?: string
  practitionerId?: string
  mobile?: string
  role?: string
  type?: string
  status?: string
  name?: Array<GQLHumanName | null>
  catchmentArea?: IGQLLocation[]
  primaryOffice?: IGQLLocation
  language: string
  localRegistrar: {
    name: Array<GQLHumanName | null>
    role?: string
    signature?: GQLSignature
  }
  avatar?: IAvatar
}

export function getUserDetails(user: GQLUser): IUserDetails {
  const {
    catchmentArea,
    primaryOffice,
    name,
    mobile,
    role,
    type,
    status,
    userMgntUserID,
    practitionerId,
    localRegistrar
  } = user
  const userDetails: IUserDetails = {
    language: getDefaultLanguage(),
    localRegistrar
  }
  if (userMgntUserID) {
    userDetails.userMgntUserID = userMgntUserID
  }
  if (practitionerId) {
    userDetails.practitionerId = practitionerId
  }
  if (name) {
    userDetails.name = name
  }
  if (mobile) {
    userDetails.mobile = mobile
  }
  if (role) {
    userDetails.role = role
  }
  if (type) {
    userDetails.type = type
  }
  if (status) {
    userDetails.status = status
  }
  if (primaryOffice) {
    userDetails.primaryOffice = {
      id: primaryOffice.id,
      name: primaryOffice.name,
      alias: primaryOffice.alias,
      status: primaryOffice.status
    }
  }

  if (catchmentArea) {
    const areaWithLocations: GQLLocation[] = catchmentArea as GQLLocation[]
    const potentialCatchmentAreas = areaWithLocations.map(
      (cArea: GQLLocation) => {
        if (cArea.identifier) {
          const identifiers: GQLIdentifier[] =
            cArea.identifier as GQLIdentifier[]
          return {
            id: cArea.id,
            name: cArea.name,
            alias: cArea.alias,
            status: cArea.status,
            identifier: identifiers.map((identifier: GQLIdentifier) => {
              return {
                system: identifier.system,
                value: identifier.value
              }
            })
          }
        }
        return {}
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
export async function removeUserDetails() {
  storage.removeItem(USER_DETAILS)
}

export function getIndividualNameObj(
  individualNameArr: Array<GQLHumanName | null>,
  language: string
) {
  return (
    individualNameArr.find((name: GQLHumanName | null) => {
      return name && name.use === language ? true : false
    }) || individualNameArr[0]
  )
}
