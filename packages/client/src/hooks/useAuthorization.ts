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
  User,
  Location,
  hasScope as hasScopeFromCommons,
  hasAnyScope as hasAnyScopeFromCommons,
  ScopeType,
  getAcceptedScopesByType,
  getScopeOptionValue,
  JurisdictionFilter
} from '@opencrvs/commons/client'
import { isLocationUnderJurisdiction } from '@client/utils/locationUtils'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { useAdministrativeAreas } from '../v2-events/hooks/useAdministrativeAreas'

export function usePermissions() {
  const userScopes = useSelector(getScope) || []

  const currentUser = useSelector(getUserDetails)
  const userPrimaryOfficeId = currentUser?.primaryOfficeId

  const { getLocations } = useLocations()
  const locations = getLocations.useSuspenseQuery()
  const { getAdministrativeAreas } = useAdministrativeAreas()
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery()

  const hasAnyScope = (neededScopes: ScopeType[]) =>
    hasAnyScopeFromCommons(userScopes, neededScopes)

  const hasScope = (neededScope: ScopeType) =>
    hasScopeFromCommons(userScopes, neededScope)

  const canSearchRecords =
    getAcceptedScopesByType({
      acceptedScopes: ['record.search'],
      scopes: userScopes ?? []
    }).length > 0

  const canReadUser = (user: Pick<User, 'id' | 'primaryOfficeId'>) => {
    if (!userPrimaryOfficeId) {
      return false
    }

    const acceptedScopes = getAcceptedScopesByType({
      acceptedScopes: ['user.read'],
      scopes: userScopes
    })

    const accessLevels = acceptedScopes.map((s) =>
      getScopeOptionValue(s, 'accessLevel')
    )

    if (accessLevels.includes(JurisdictionFilter.enum.all)) {
      return true
    }

    if (accessLevels.includes(JurisdictionFilter.enum.location)) {
      return user.primaryOfficeId === userPrimaryOfficeId
    }

    if (accessLevels.includes(JurisdictionFilter.enum.administrativeArea)) {
      return isLocationUnderJurisdiction({
        locationId: userPrimaryOfficeId,
        otherLocationId: user.primaryOfficeId,
        locations,
        administrativeAreas
      })
    }

    if (hasScope('user.read-only-my-audit')) {
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

    const acceptedScopes = getAcceptedScopesByType({
      acceptedScopes: ['user.edit'],
      scopes: userScopes
    })

    const accessLevels = acceptedScopes.map((s) =>
      getScopeOptionValue(s, 'accessLevel')
    )

    if (accessLevels.includes(JurisdictionFilter.enum.all)) {
      return true
    }

    if (accessLevels.includes(JurisdictionFilter.enum.location)) {
      return user.primaryOfficeId === userPrimaryOfficeId
    }

    if (accessLevels.includes(JurisdictionFilter.enum.administrativeArea)) {
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
    : hasScope('user.create')

  const canAccessOffice = (office: Pick<Location, 'id'>) => {
    if (!userPrimaryOfficeId) {
      return false
    }

    const acceptedScopes = getAcceptedScopesByType({
      acceptedScopes: ['organisation.read-locations'],
      scopes: userScopes
    })

    const accessLevels = acceptedScopes.map((s) =>
      getScopeOptionValue(s, 'accessLevel')
    )

    if (accessLevels.includes(JurisdictionFilter.enum.all)) {
      return true
    }

    if (accessLevels.includes(JurisdictionFilter.enum.location)) {
      return office.id === userPrimaryOfficeId
    }

    if (accessLevels.includes(JurisdictionFilter.enum.administrativeArea)) {
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

    const acceptedScopes = getAcceptedScopesByType({
      acceptedScopes: ['user.create'],
      scopes: userScopes
    })

    const accessLevels = acceptedScopes.map((s) =>
      getScopeOptionValue(s, 'accessLevel')
    )

    if (accessLevels.includes(JurisdictionFilter.enum.all)) {
      return true
    }

    if (accessLevels.includes(JurisdictionFilter.enum.location)) {
      return office.id === userPrimaryOfficeId
    }

    if (accessLevels.includes(JurisdictionFilter.enum.administrativeArea)) {
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
