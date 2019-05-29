import { GQLResolver } from 'src/graphql/schema'
import { fetchFHIR } from 'src/features/fhir/utils'

interface IUserModelData {
  _id: string
  username: string
  name: string
  email: string
  mobile: string
  active: boolean
  practitionerId: string
  primaryOfficeId: string
  catchmentAreaIds: string[]
}

export interface IUserSearchPayload {
  username?: string
  mobile?: string
  active?: boolean
  role?: string
  primaryOfficeId?: string
  locationId?: string
  count: number
  skip: number
  sortOrder: string
}

export const userTypeResolvers: GQLResolver = {
  User: {
    id(userModel: IUserModelData) {
      return userModel._id
    },
    userMgntUserID(userModel: IUserModelData) {
      return userModel._id
    },
    async primaryOffice(userModel: IUserModelData, _, authHeader) {
      return await fetchFHIR(
        `/Location/${userModel.primaryOfficeId}`,
        authHeader
      )
    },
    async catchmentArea(userModel: IUserModelData, _, authHeader) {
      return (
        (userModel.catchmentAreaIds &&
          userModel.catchmentAreaIds.map(async (areaId: string) => {
            return await fetchFHIR(`/Location/${areaId}`, authHeader)
          })) ||
        []
      )
    }
  }
}
