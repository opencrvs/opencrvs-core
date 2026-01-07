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
import { FullNameV1, personNameFromV1ToV2 } from '@opencrvs/commons/client'
import { getLocations } from '@client/offline/selectors'
import { getUserDetails } from '@client/profile/profileSelectors'
import { getUsersFullName } from '../utils'
import { useUsers } from './useUsers'

export function useUserDetails() {
  const userDetails = useSelector(getUserDetails)
  const locations = useSelector(getLocations)
  const loggedInUser = useSelector(getUserDetails)
  const { getUser } = useUsers()
  const [user] = getUser.useSuspenseQuery(loggedInUser?.id ?? '')

  const normalizedName =
    userDetails &&
    (userDetails.name.map((n) => ({
      use: n.use ?? 'official',
      family: n.familyName ?? '',
      given: n.firstNames ? n.firstNames.split(' ') : []
    })) satisfies FullNameV1)

  const name = normalizedName ? getUsersFullName(normalizedName, 'en') : ''
  const { name: userName, role, ...rest } = user

  const splitNames = normalizedName
    ? personNameFromV1ToV2(normalizedName)
    : {
        firstname: '',
        middlename: '',
        surname: ''
      }

  const primaryOfficeId = userDetails?.primaryOffice.id

  if (primaryOfficeId) {
    const primaryOfficeLocation = locations[primaryOfficeId]

    const districtId = primaryOfficeLocation?.partOf.split('/')[1]
    const district = districtId ? locations[districtId] : undefined

    const provinceId = district?.partOf.split('/')[1]

    return {
      name,
      role: userDetails.role.id,
      district: districtId ?? '',
      province: provinceId ?? '',
      ...splitNames,
      ...rest
    }
  }

  return {
    name,
    role: userDetails?.role.id,
    district: '',
    province: '',
    ...splitNames,
    ...rest
  }
}
