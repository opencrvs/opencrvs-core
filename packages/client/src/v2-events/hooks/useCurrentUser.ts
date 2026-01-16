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
import { LocationType } from '@opencrvs/commons/client'
import { getUserDetails } from '@client/profile/profileSelectors'
import { getOfflineData } from '@client/offline/selectors'
import { getAdminLevelHierarchy, getUsersFullName } from '../utils'
import { useLocations } from './useLocations'
import { useUsers } from './useUsers'

export function useCurrentUser() {
  const { config } = useSelector(getOfflineData)
  const appConfigAdminLevels = config.ADMIN_STRUCTURE

  const loggedInUser = useSelector(getUserDetails)
  const { getUser } = useUsers()
  const [user] = getUser.useSuspenseQuery(loggedInUser?.id ?? '')

  const { getLocations } = useLocations()
  const locations = getLocations.useSuspenseQuery()

  const name = getUsersFullName(user.name, 'en')

  if (user.primaryOfficeId) {
    const primaryOfficeLocation = locations.get(user.primaryOfficeId)

    const adminStructureLocations = new Map(
      [...locations].filter(
        ([, location]) =>
          location.locationType === LocationType.enum.ADMIN_STRUCTURE
      )
    )

    const adminLevelIds = appConfigAdminLevels.map((level) => level.id)

    const adminLevels = getAdminLevelHierarchy(
      primaryOfficeLocation?.parentId ?? undefined,
      adminStructureLocations,
      adminLevelIds
    )
    return {
      id: user.id,
      name,
      role: user.role,
      ...adminLevels
    }
  }

  return {
    id: user.id,
    name,
    role: user.role
  }
}
