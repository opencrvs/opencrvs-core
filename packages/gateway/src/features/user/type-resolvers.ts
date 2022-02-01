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
import { IAuthHeader } from '@gateway/common-types'
import { OPENCRVS_SPECIFICATION_URL } from '@gateway/features/fhir/constants'
import { fetchFHIR, findExtension } from '@gateway/features/fhir/utils'
import {
  GQLIdentifier,
  GQLResolver,
  GQLSignatureInput,
  GQLUserIdentifierInput
} from '@gateway/graphql/schema'

interface IAuditHistory {
  auditedBy: string
  auditedOn: number
  action: string
  reason: string
  comment?: string
}

interface IAvatar {
  type: string
  data: string
}

export interface IUserModelData {
  _id: string
  username: string
  name: {
    use: string
    family: string
    given: string[]
  }[]
  scope?: string[]
  email: string
  mobile: string
  status: string
  role: string
  type: string
  creationDate?: string
  practitionerId: string
  primaryOfficeId: string
  catchmentAreaIds: string[]
  identifiers: GQLIdentifier[]
  device: string
  auditHistory?: IAuditHistory[]
  avatar?: IAvatar
}

export interface IUserPayload
  extends Omit<
    IUserModelData,
    | '_id'
    | 'catchmentAreaIds'
    | 'status'
    | 'practitionerId'
    | 'username'
    | 'identifiers'
  > {
  id?: string
  identifiers: GQLUserIdentifierInput[]
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

async function getPractitionerByOfficeId(
  primaryOfficeId: string,
  authHeader: IAuthHeader
) {
  const roleBundle: fhir.Bundle = await fetchFHIR(
    `/PractitionerRole?location=${primaryOfficeId}&role=LOCAL_REGISTRAR`,
    authHeader
  )

  const practitionerRole =
    roleBundle &&
    roleBundle.entry &&
    roleBundle.entry &&
    roleBundle.entry.length > 0 &&
    (roleBundle.entry[0].resource as fhir.PractitionerRole)

  const roleCode =
    practitionerRole &&
    practitionerRole.code &&
    practitionerRole.code.length > 0 &&
    practitionerRole.code[0].coding &&
    practitionerRole.code[0].coding[0].code

  return {
    practitionerId:
      practitionerRole && practitionerRole.practitioner
        ? practitionerRole.practitioner.reference
        : undefined,
    practitionerRole: roleCode || undefined
  }
}

function getSignatureExtension(
  extensions: fhir.Extension[] | undefined
): fhir.Extension | undefined {
  return findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/employee-signature`,
    extensions || []
  )
}

export const userTypeResolvers: GQLResolver = {
  User: {
    id(userModel: IUserModelData) {
      return userModel._id
    },
    userMgntUserID(userModel: IUserModelData) {
      return userModel._id
    },
    underInvestigation(userModel: IUserModelData) {
      return (
        userModel &&
        userModel.status &&
        userModel.status === 'deactivated' &&
        userModel.auditHistory &&
        userModel.auditHistory[userModel.auditHistory.length - 1].reason ===
          'SUSPICIOUS'
      )
    },
    identifier(userModel: IUserModelData) {
      return userModel.identifiers && userModel.identifiers[0]
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
    async localRegistrar(userModel: IUserModelData, _, authHeader) {
      const scope = userModel.scope

      if (!scope) {
        return null
      }

      const { practitionerId, practitionerRole } = !scope.includes('register')
        ? await getPractitionerByOfficeId(userModel.primaryOfficeId, authHeader)
        : {
            practitionerId: `Practitioner/${userModel.practitionerId}`,
            practitionerRole: userModel.role
          }

      if (!practitionerId) {
        return
      }

      const practitioner: fhir.Practitioner = await fetchFHIR(
        `/${practitionerId}`,
        authHeader
      )

      if (!practitioner) {
        return
      }

      const signatureExtension = getSignatureExtension(practitioner.extension)

      const signature = signatureExtension && signatureExtension.valueSignature
      return {
        role: practitionerRole,
        name: practitioner.name,
        signature: signature && {
          type: signature.contentType,
          data: signature.blob
        }
      }
    },
    async signature(userModel: IUserModelData, _, authHeader) {
      const practitioner: fhir.Practitioner = await fetchFHIR(
        `/Practitioner/${userModel.practitionerId}`,
        authHeader
      )

      const signatureExtension = getSignatureExtension(practitioner.extension)

      const signature = signatureExtension && signatureExtension.valueSignature
      return (
        signature && {
          type: signature.contentType,
          data: signature.blob
        }
      )
    }
  }
}
