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
