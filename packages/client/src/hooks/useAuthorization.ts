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
import { useSelector } from 'react-redux'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import {
  findScope,
  getAcceptedScopesByType,
  SCOPES,
  User,
  Location
} from '@opencrvs/commons/client'
import { isLocationUnderJurisdiction } from '@client/utils/locationUtils'
import { IStoreState } from '@client/store'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { useAdministrativeAreas } from '../v2-events/hooks/useAdministrativeAreas'

export const RECORD_DECLARE_SCOPES = [
  SCOPES.RECORD_DECLARE_BIRTH,
  SCOPES.RECORD_DECLARE_BIRTH_MY_JURISDICTION,
  SCOPES.RECORD_DECLARE_DEATH,
  SCOPES.RECORD_DECLARE_DEATH_MY_JURISDICTION,
  SCOPES.RECORD_DECLARE_MARRIAGE,
  SCOPES.RECORD_DECLARE_MARRIAGE_MY_JURISDICTION
]

export function usePermissions() {
  const userScopes = useSelector(getScope)

  const currentUser = useSelector(getUserDetails)
  const userPrimaryOfficeId = currentUser?.primaryOfficeId

  const { getLocations } = useLocations()
  const locations = getLocations.useSuspenseQuery()
  const { getAdministrativeAreas } = useAdministrativeAreas()
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery()

  const roles = useSelector((store: IStoreState) => store.userForm.userRoles)

  const roleScopes = (role: string) =>
    roles.find(({ id }) => id === role)?.scopes ?? []

  const hasScopes = (neededScopes: string[]) =>
    neededScopes.every((scope) => userScopes?.includes(scope))

  const hasAnyScope = (neededScopes: string[]) =>
    neededScopes.length === 0 ||
    neededScopes.some((scope) => userScopes?.includes(scope))

  const hasScope = (neededScope: string) => hasAnyScope([neededScope])

  const canSearchRecords =
    getAcceptedScopesByType({
      acceptedScopes: ['record.search'],
      scopes: userScopes ?? []
    }).length > 0

  const canReadUser = (user: Pick<User, 'id' | 'primaryOfficeId'>) => {
    if (!userPrimaryOfficeId) {
      return false
    }
    if (hasScope(SCOPES.USER_READ)) {
      return true
    }
    if (hasScope(SCOPES.USER_READ_MY_OFFICE)) {
      return user.primaryOfficeId === userPrimaryOfficeId
    }
    if (hasScope(SCOPES.USER_READ_MY_JURISDICTION)) {
      return isLocationUnderJurisdiction({
        locationId: userPrimaryOfficeId,
        otherLocationId: user.primaryOfficeId,
        locations,
        administrativeAreas
      })
    }
    if (hasScope(SCOPES.USER_READ_ONLY_MY_AUDIT)) {
      return user.id === currentUser?.id
    }

    return false
  }

  const canEditUser = (user: User) => {
    const editableRoleIds = findScope(userScopes ?? [], 'user.edit')?.options
      ?.role

    if (Array.isArray(editableRoleIds)) {
      return editableRoleIds.includes(user.role)
    }
    if (!userPrimaryOfficeId) {
      return false
    }
    if (hasScope(SCOPES.USER_UPDATE)) {
      return true
    }
    if (hasScope(SCOPES.USER_UPDATE_MY_JURISDICTION)) {
      if (roleScopes(user.role).includes(SCOPES.USER_UPDATE)) {
        return false
      }
      return isLocationUnderJurisdiction({
        locationId: userPrimaryOfficeId,
        otherLocationId: user.primaryOfficeId,
        locations,
        administrativeAreas
      })
    }

    return false
  }

  const creatableRoleIds = findScope(userScopes ?? [], 'user.create')?.options
    ?.role
  const canCreateUser = Array.isArray(creatableRoleIds)
    ? creatableRoleIds.length > 0
    : hasAnyScope([SCOPES.USER_CREATE, SCOPES.USER_CREATE_MY_JURISDICTION])

  const canAccessOffice = (office: Pick<Location, 'id'>) => {
    if (!userPrimaryOfficeId) {
      return false
    }
    if (hasScope(SCOPES.ORGANISATION_READ_LOCATIONS)) {
      return true
    }
    if (hasScope(SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE)) {
      return office.id === userPrimaryOfficeId
    }

    if (hasScope(SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION)) {
      return isLocationUnderJurisdiction({
        locationId: userPrimaryOfficeId,
        otherLocationId: office.id,
        locations,
        administrativeAreas
      })
    }
    return false
  }

  const canAddOfficeUsers = (office: Pick<Location, 'id'>) => {
    if (!userPrimaryOfficeId) {
      return false
    }
    if (hasScope(SCOPES.USER_CREATE)) {
      return true
    }
    if (hasScope(SCOPES.USER_CREATE_MY_JURISDICTION)) {
      return isLocationUnderJurisdiction({
        locationId: userPrimaryOfficeId,
        otherLocationId: office.id,
        locations,
        administrativeAreas
      })
    }
    return false
  }

  return {
    hasScopes,
    hasScope,
    hasAnyScope,
    canSearchRecords,
    canReadUser,
    canEditUser,
    canCreateUser,
    canAccessOffice,
    canAddOfficeUsers
  }
}
