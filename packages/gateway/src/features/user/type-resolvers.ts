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

import { GQLResolver, GQLSignatureInput } from '@gateway/graphql/schema'

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

type Label = {
  lang: string
  label: string
}
interface IUserRole {
  labels: Label[]
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
  systemRole: string
  role: IUserRole
  creationDate?: string
  practitionerId: string
  primaryOfficeId: string
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
  systemRole: string
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
  systemRole?: string
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
    email(userModel: IUserModelData) {
      return userModel.emailForNotification
    },
    async name(userModel: IUserModelData) {
      return [
        {
          familyName: userModel.name[0].family,
          firstNames: userModel.name[0].given[0]
        }
      ]
    },
    async primaryOffice(userModel: IUserModelData, _, { dataSources }) {
      return dataSources.locationsAPI.getLocation(userModel.primaryOfficeId)
    },
    async localRegistrar(
      userModel: IUserModelData,
      _,
      { headers: authHeader, dataSources }
    ) {
      return null /* @todo what is the idea of this? what if there are two registrars */
    },
    async signature(
      userModel: IUserModelData,
      _,
      { headers: authHeader, dataSources }
    ) {
      return null /* @todo */
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
