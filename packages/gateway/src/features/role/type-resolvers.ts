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
import { GQLResolver } from '@gateway/graphql/schema'
import { IMongoComparisonObject } from '@gateway/features/role/utils'

type Role = {
  lang: string
  label: string
}

interface IRoleModelData {
  _id: string
  title: string
  value: string
  roles: Role[]
  active: boolean
}

export interface IRoleSearchPayload {
  title?: string
  value?: IMongoComparisonObject
  role?: string
  active?: boolean
  sortBy?: string
  sortOrder?: string
}
export const roleTypeResolvers: GQLResolver = {
  SystemRole: {
    id(roleModel: IRoleModelData) {
      return roleModel._id
    }
  }
}
