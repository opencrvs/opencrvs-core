import { GQLLocation, GQLUser } from '@opencrvs/gateway/src/graphql/schema'
import { storage } from '@opencrvs/register/src/storage'

export const USER_DETAILS = 'USER_DETAILS'

export interface ILocation {
  id: string
  name?: string
  status?: string
}

export interface IUserDetails {
  catchmentArea?: ILocation[]
  primaryOffice?: ILocation
}

export function getUserDetails(user: GQLUser): IUserDetails {
  const { catchmentArea, primaryOffice } = user
  const userDetails: IUserDetails = {}

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
      return { id: cArea.id, name: cArea.name, status: cArea.status }
    })
  return userDetails
}

export async function storeUserDetails(userDetails: IUserDetails) {
  storage.setItem(USER_DETAILS, JSON.stringify(userDetails))
}
