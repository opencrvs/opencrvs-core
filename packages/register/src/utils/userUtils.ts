import {
  GQLLocation,
  GQLUser,
  GQLHumanName
} from '@opencrvs/gateway/src/graphql/schema'
import { storage } from '@opencrvs/register/src/storage'

export const USER_DETAILS = 'USER_DETAILS'

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
  userMgntUserID?: string
  practitionerId?: string
  role?: string
  type?: string
  status?: string
  name?: Array<GQLHumanName | null>
  catchmentArea?: IGQLLocation[]
  primaryOffice?: IGQLLocation
  language: string
}

export function getUserDetails(user: GQLUser): IUserDetails {
  const {
    catchmentArea,
    primaryOffice,
    name,
    role,
    type,
    status,
    userMgntUserID,
    practitionerId
  } = user
  const userDetails: IUserDetails = {
    language: window.config.LANGUAGE
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
      status: primaryOffice.status
    }
  }
  userDetails.catchmentArea =
    catchmentArea &&
    catchmentArea.map((cArea: GQLLocation) => {
      return {
        id: cArea.id,
        name: cArea.name,
        status: cArea.status,
        identifier:
          cArea.identifier &&
          cArea.identifier.map((identifier: IIdentifier) => {
            return {
              system: identifier.system,
              value: identifier.value
            }
          })
      }
    })
  return userDetails
}

export function getUserLocation(
  userDetails: IUserDetails,
  locationKey: string
): string {
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

export async function storeUserDetails(userDetails: IUserDetails) {
  storage.setItem(USER_DETAILS, JSON.stringify(userDetails))
}
export async function removeUserDetails() {
  storage.removeItem(USER_DETAILS)
}
