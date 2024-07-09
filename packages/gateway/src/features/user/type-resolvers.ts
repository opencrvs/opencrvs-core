/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import {
  IAuthHeader,
  UUID,
  fetchJSON,
  joinURL,
  logger,
  Roles
} from '@opencrvs/commons'

import { COUNTRY_CONFIG_URL } from '@gateway/constants'
import { fetchFHIR } from '@gateway/features/fhir/service'
import {
  GQLIdentifier,
  GQLResolver,
  GQLSignatureInput,
  GQLUserIdentifierInput
} from '@gateway/graphql/schema'
import {
  Bundle,
  Extension,
  OPENCRVS_SPECIFICATION_URL,
  PractitionerRole,
  ResourceIdentifier,
  findExtension,
  resourceIdentifierToUUID
} from '@opencrvs/commons/types'

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
  emailForNotification?: string
  mobile?: string
  status: string
  role: string
  creationDate?: string
  practitionerId: string
  primaryOfficeId: string
  identifiers: GQLIdentifier[]
  device: string
  auditHistory?: IAuditHistory[]
  avatar?: IAvatar
}

export interface ISystemModelData {
  scope?: string[]
  name: string
  createdBy: string
  client_id: string
  username: string
  status: string
  sha_secret: string
  type: 'HEALTH'
  practitionerId: string
  settings: {
    dailyQuota: number
  }
}

export function isSystem(
  systemOrUser: IUserModelData | ISystemModelData
): systemOrUser is ISystemModelData {
  return (systemOrUser as ISystemModelData).client_id !== undefined
}

export interface IUserPayload
  extends Omit<
    IUserModelData,
    '_id' | 'status' | 'practitionerId' | 'username' | 'identifiers' | 'role'
  > {
  id?: string
  identifiers: GQLUserIdentifierInput[]
  status?: string
  username?: string
  password?: string
  role: string
  signature?: GQLSignatureInput
}

export interface IUserSearchPayload {
  username?: string
  mobile?: string
  status?: string
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
  const roleBundle: Bundle = await fetchFHIR(
    `/PractitionerRole?location=${primaryOfficeId}&role=LOCAL_REGISTRAR`,
    authHeader
  )

  const practitionerRole =
    roleBundle &&
    roleBundle.entry &&
    roleBundle.entry &&
    roleBundle.entry.length > 0 &&
    (roleBundle.entry[0].resource as PractitionerRole)

  const roleCode =
    practitionerRole &&
    practitionerRole.code &&
    practitionerRole.code.length > 0 &&
    practitionerRole.code[0].coding &&
    practitionerRole.code[0].coding[0].code

  return {
    practitionerId:
      practitionerRole && practitionerRole.practitioner
        ? (practitionerRole.practitioner.reference as ResourceIdentifier)
        : undefined,
    practitionerRole: roleCode || undefined
  }
}

export function getSignatureExtension(extensions: Extension[] | undefined) {
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
    role: async (userModel: IUserModelData) => {
      const roles = await fetchJSON<Roles>(
        joinURL(COUNTRY_CONFIG_URL, '/roles')
      )

      logger.info('Fetching roles from country config')
      return roles.find((role) => role.id === userModel.role)
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
    email(userModel: IUserModelData) {
      return userModel.emailForNotification
    },
    async primaryOffice(userModel: IUserModelData, _, { dataSources }) {
      return dataSources.locationsAPI.getLocation(userModel.primaryOfficeId)
    },
    async localRegistrar(
      userModel: IUserModelData,
      _,
      { headers: authHeader, dataSources }
    ) {
      const scope = userModel.scope

      if (!scope) {
        return null
      }

      const { practitionerId, practitionerRole } = !scope.includes('register')
        ? await getPractitionerByOfficeId(userModel.primaryOfficeId, authHeader)
        : {
            practitionerId: `Practitioner/${
              userModel.practitionerId as UUID
            }` as const,
            practitionerRole: userModel.role
          }

      if (!practitionerId) {
        return
      }

      const practitioner = await dataSources.fhirAPI.getPractitioner(
        resourceIdentifierToUUID(practitionerId)
      )

      if (!practitioner) {
        return
      }

      const signatureExtension = getSignatureExtension(practitioner.extension)

      const signature = signatureExtension && signatureExtension?.valueSignature

      return {
        role: practitionerRole,
        name: practitioner.name,
        signature: signature && {
          type: signature.contentType,
          data: signature.blob
        }
      }
    },
    async signature(userModel: IUserModelData, _, { dataSources }) {
      const practitioner = await dataSources.fhirAPI.getPractitioner(
        userModel.practitionerId
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
  },

  Avatar: {
    async data(avatar: IAvatar, _, { dataSources }) {
      if (avatar.data) {
        const { presignedURL } = await dataSources.minioAPI.getStaticData(
          avatar.data
        )
        return presignedURL
      }
      return null
    }
  }
}
