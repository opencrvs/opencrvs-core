import {
  GQLResolver,
  GQLUserIdentifierInput,
  GQLSignatureInput
} from '@gateway/graphql/schema'
import { fetchFHIR, findExtension } from '@gateway/features/fhir/utils'
import { OPENCRVS_SPECIFICATION_URL } from '@gateway/features/fhir/constants'

interface IUserModelData {
  _id: string
  username: string
  name: string
  scope?: string[]
  email: string
  mobile: string
  status: string
  practitionerId: string
  primaryOfficeId: string
  catchmentAreaIds: string[]
}

export interface IUserPayload
  extends Omit<
    IUserModelData,
    | '_id'
    | 'catchmentAreaIds'
    | 'status'
    | 'practitionerId'
    | 'username'
    | 'name'
  > {
  identifiers: GQLUserIdentifierInput[]
  name: {
    use: string
    family: string
    given: string[]
  }[]
  role: string
  type: string
  signature?: GQLSignatureInput
}

export interface IUserSearchPayload {
  username?: string
  mobile?: string
  status?: string
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
      return await Promise.all(
        userModel.catchmentAreaIds.map((areaId: string) => {
          return fetchFHIR(`/Location/${areaId}`, authHeader)
        })
      )
    },
    async signature(userModel: IUserModelData, _, authHeader) {
      const scope = userModel.scope

      if (scope && scope.includes('certify')) {
        let practitionerId
        if (!scope.includes('register')) {
          const roleBundle: fhir.Bundle = await fetchFHIR(
            `/PractitionerRole?location=${
              userModel.primaryOfficeId
            }&role=LOCAL_REGISTRAR`,
            authHeader
          )

          const practitionerRole =
            roleBundle &&
            roleBundle.entry &&
            roleBundle.entry &&
            roleBundle.entry.length > 0 &&
            (roleBundle.entry[0].resource as fhir.PractitionerRole)

          practitionerId =
            practitionerRole &&
            practitionerRole.practitioner &&
            practitionerRole.practitioner.reference
        } else if (scope.includes('register')) {
          practitionerId = `Practitioner/${userModel.practitionerId}`
        }

        const practitioner: fhir.Practitioner =
          practitionerId && (await fetchFHIR(`/${practitionerId}`, authHeader))

        const signatureExtension =
          practitioner &&
          findExtension(
            `${OPENCRVS_SPECIFICATION_URL}extension/employee-signature`,
            practitioner.extension || []
          )

        const signature =
          signatureExtension && signatureExtension.valueSignature

        if (signature) {
          return {
            type: signature.contentType,
            data: signature.blob
          }
        }
      }

      return null
    }
  }
}
