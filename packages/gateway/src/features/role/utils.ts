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

import { Scope } from '@opencrvs/commons/authentication'

export const SYSTEM_ROLE_KEYS = [
  'FIELD_AGENT',
  'LOCAL_REGISTRAR',
  'LOCAL_SYSTEM_ADMIN',
  'NATIONAL_REGISTRAR',
  'NATIONAL_SYSTEM_ADMIN',
  'PERFORMANCE_MANAGEMENT',
  'REGISTRATION_AGENT'
] as const

// Derive the type from SYSTEM_ROLE_KEYS
type SystemRoleKeyType = (typeof SYSTEM_ROLE_KEYS)[number]

export const SysAdminAccessMap: Partial<
  Record<SystemRoleKeyType, SystemRoleKeyType[]>
> = {
  LOCAL_SYSTEM_ADMIN: [
    'FIELD_AGENT',
    'LOCAL_REGISTRAR',
    'LOCAL_SYSTEM_ADMIN',
    'PERFORMANCE_MANAGEMENT',
    'REGISTRATION_AGENT'
  ],
  NATIONAL_SYSTEM_ADMIN: [
    'FIELD_AGENT',
    'LOCAL_REGISTRAR',
    'LOCAL_SYSTEM_ADMIN',
    'NATIONAL_REGISTRAR',
    'NATIONAL_SYSTEM_ADMIN',
    'PERFORMANCE_MANAGEMENT',
    'REGISTRATION_AGENT'
  ]
}

type UserRole = {
  labels: Label[]
}

type Label = {
  lang: string
  label: string
}

export type SystemRole = {
  value: SystemRoleKeyType
  roles: UserRole[]
  active: boolean
  creationDate: number
}
export interface IComparisonObject {
  eq?: string
  gt?: string
  lt?: string
  gte?: string
  lte?: string
  in?: string[]
  ne?: string
  nin?: string[]
}

export interface IMongoComparisonObject {
  $eq?: string
  $gt?: string
  $lt?: string
  $gte?: string
  $lte?: string
  $in?: string[]
  $ne?: string
  $nin?: string[]
}

export function transformMongoComparisonObject(
  obj: IComparisonObject
): IMongoComparisonObject | {} {
  const keys = Object.keys(obj)
  if (!keys.length) {
    return obj
  }

  return Object.keys(obj).reduce(
    (result, key) => ({
      ...result,
      [`$${key}`]: obj[key as keyof IComparisonObject]
    }),
    {}
  )
}

export function getAccessibleRolesForScope(scope: Scope[]) {
  let roleFilter: keyof typeof SysAdminAccessMap
  if (scope.includes('natlsysadmin')) {
    roleFilter = 'NATIONAL_SYSTEM_ADMIN'
  } else if (scope.includes('sysadmin')) {
    roleFilter = 'LOCAL_SYSTEM_ADMIN'
  } else {
    throw Error('Create user is only allowed for sysadmin/natlsysadmin')
  }

  return SysAdminAccessMap[roleFilter]
}
