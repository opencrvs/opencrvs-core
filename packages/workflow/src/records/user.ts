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

import { getTokenPayload } from '@opencrvs/commons/authentication'
import { getSystem, getUser } from '@workflow/features/user/utils'

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
  catchmentAreaIds: string[]
  identifiers: {
    system?: string
    value?: string
  }[]
  device: string
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

export async function getUserOrSystem(
  token: string
): Promise<IUserModelData | ISystemModelData> {
  const tokenPayload = getTokenPayload(token)
  const isNotificationAPIUser = tokenPayload.scope.includes('notification-api')
  const isRecordSearchAPIUser = tokenPayload.scope.includes('recordsearch')

  if (isNotificationAPIUser || isRecordSearchAPIUser) {
    return await getSystem(tokenPayload.sub, {
      Authorization: `Bearer ${token}`
    })
  }
  return await getUser(tokenPayload.sub, {
    Authorization: `Bearer ${token}`
  })
}
