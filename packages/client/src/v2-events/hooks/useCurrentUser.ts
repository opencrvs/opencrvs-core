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
import { User } from '@opencrvs/commons/client'
import { getUserDetails } from '@client/profile/profileSelectors'
import { getOfflineData } from '@client/offline/selectors'
import { getAdminLevelHierarchy, getUsersFullName } from '../utils'
import { useLocations } from './useLocations'
import { useUsers } from './useUsers'
import { useAdministrativeAreas } from './useAdministrativeAreas'

export function useCurrentUser() {
  const { config } = useSelector(getOfflineData)
  const appConfigAdminLevels = config.ADMIN_STRUCTURE

  const loggedInUser = useSelector(getUserDetails)
  const { getUser } = useUsers()
  const [user] = getUser.useSuspenseQuery(loggedInUser?.id ?? '') as [User]

  const { getLocations } = useLocations()
  const { getAdministrativeAreas } = useAdministrativeAreas()

  const locations = getLocations.useSuspenseQuery()
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery()

  const name = getUsersFullName(user.name, 'en')

  if (user.primaryOfficeId) {
    const primaryOfficeLocation = locations.get(user.primaryOfficeId)
    const officeAdministrativeAreaId =
      primaryOfficeLocation?.administrativeAreaId

    const adminLevelIds = appConfigAdminLevels.map((level) => level.id)

    const adminLevels = getAdminLevelHierarchy(
      officeAdministrativeAreaId,
      administrativeAreas,
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
