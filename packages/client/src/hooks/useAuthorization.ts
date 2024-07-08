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
import { Scope } from '@opencrvs/commons/authentication'
import { User } from '@client/utils/gateway'

export function usePermissions() {
  const userScopes = useSelector(getScope)
  const userPrimaryOffice = useSelector(getUserDetails)?.primaryOffice

  const hasScopes = (neededScopes: Scope[]) =>
    neededScopes.every((scope) => userScopes?.includes(scope))

  const hasScope = (neededScope: Scope) => hasScopes([neededScope])

  const canReadUser = (user: User) => {
    if (hasScope('user.read:all')) return true
    if (hasScope('user.read:my-office'))
      return user.primaryOffice.id === userPrimaryOffice?.id

    return false
  }

  return { hasScopes, hasScope, canReadUser }
}
