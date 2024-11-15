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
import * as Hapi from '@hapi/hapi'
import { ITokenPayload } from '@user-mgnt/utils/token'
import decode from 'jwt-decode'
import SystemRole, {
  ISystemRoleModel,
  sysAdminAccessMap
} from '@user-mgnt/model/systemRole'
import { SortOrder, ObjectId } from 'mongoose'

export const statuses = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  DEACTIVATED: 'deactivated'
}

export interface IAuthHeader {
  Authorization: string
}

export const hasScope = (request: Hapi.Request, scope: string): boolean => {
  if (
    !request.auth ||
    !request.auth.credentials ||
    !request.auth.credentials.scope
  ) {
    return false
  }
  return request.auth.credentials.scope.includes(scope)
}

export function hasDemoScope(request: Hapi.Request): boolean {
  return hasScope(request, 'demo')
}

export const getTokenPayload = (token: string): ITokenPayload => {
  let decoded: ITokenPayload
  try {
    decoded = decode(token)
  } catch (err) {
    throw new Error(
      `getTokenPayload: Error occurred during token decode : ${err}`
    )
  }
  return decoded
}

export const getUserId = (authHeader: IAuthHeader): string => {
  if (!authHeader || !authHeader.Authorization) {
    throw new Error(`getUserId: Error occurred during token decode`)
  }
  const tokenPayload = getTokenPayload(authHeader.Authorization.split(' ')[1])
  return tokenPayload.sub
}

export async function getValidRoles(
  criteria = {},
  sortOrder: SortOrder = 'asc',
  sortBy: string,
  token: string,
  systemRole?: string
): Promise<Omit<ISystemRoleModel & { _id: ObjectId }, never>[] | null> {
  const scope = getTokenPayload(token).scope
  const allRoles = await SystemRole.find(criteria)
    .populate('roles')
    .sort({
      [sortBy]: sortOrder
    })
  let roleFilter = ''
  if (scope.includes('natlsysadmin')) {
    roleFilter = 'NATIONAL_SYSTEM_ADMIN'
  } else if (scope.includes('sysadmin')) {
    roleFilter = 'LOCAL_SYSTEM_ADMIN'
  } else {
    return null
  }
  const accessibleRoleValues = sysAdminAccessMap.get(roleFilter) || []
  if (
    (systemRole && accessibleRoleValues.includes(systemRole)) ||
    !systemRole
  ) {
    return allRoles.filter((role) => accessibleRoleValues.includes(role.value))
  } else {
    return null
  }
}
