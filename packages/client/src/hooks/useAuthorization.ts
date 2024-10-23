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
import { Scope, User, Location, SCOPES } from '@client/utils/gateway'

export function usePermissions() {
  const userScopes = useSelector(getScope)
  const userPrimaryOffice = useSelector(getUserDetails)?.primaryOffice

  const hasScopes = (neededScopes: Scope[]) =>
    neededScopes.every((scope) => userScopes?.includes(scope))

  const hasAnyScope = (neededScopes: Scope[]) =>
    neededScopes.length === 0 ||
    neededScopes.some((scope) => userScopes?.includes(scope))

  const hasScope = (neededScope: Scope) => hasAnyScope([neededScope])

  const canReadUser = (user: Pick<User, 'primaryOffice'>) => {
    if (hasScope(SCOPES.USER_READ)) return true
    if (hasScope(SCOPES.USER_READ_MY_OFFICE))
      return user.primaryOffice.id === userPrimaryOffice?.id

    return false
  }

  const canEditUser = (user: Pick<User, 'primaryOffice'>) => {
    if (hasScope(SCOPES.USER_UPDATE)) return true
    if (hasScope(SCOPES.USER_UPDATE_MY_JURISDICTION))
      return user.primaryOffice.id === userPrimaryOffice?.id

    return false
  }

  const canReadOfficeUsers = (office: Pick<Location, 'id'>) => {
    if (hasScope(SCOPES.ORGANISATION_READ_LOCATIONS)) return true
    if (hasScope(SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE))
      return office.id === userPrimaryOffice?.id

    return false
  }

  const canAddOfficeUsers = (office: Pick<Location, 'id'>) => {
    if (hasScope(SCOPES.USER_CREATE)) return true
    if (hasScope(SCOPES.USER_CREATE_MY_JURISDICTION))
      return office.id === userPrimaryOffice?.id

    return false
  }

  return {
    hasScopes,
    hasScope,
    hasAnyScope,
    canReadUser,
    canEditUser,
    canReadOfficeUsers,
    canAddOfficeUsers
  }
}
