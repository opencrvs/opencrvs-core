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
export interface ILocation {
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

export async function storeUserDetails(userDetails: IUserDetails) {
  storage.setItem(USER_DETAILS, JSON.stringify(userDetails))
}
