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
import { getLocations } from '@client/offline/selectors'
import { getUserDetails } from '@client/profile/profileSelectors'
import type { User, SystemVariables } from '@opencrvs/commons/client'

export function useUserDetails(): SystemVariables['$user'] {
  const userDetails = useSelector(getUserDetails)
  const locations = useSelector(getLocations)

  const normalizedName =
    userDetails &&
    userDetails.name.map((n) => ({
      use: n.use ?? 'official',
      family: n.familyName ?? '',
      given: n.firstNames ? [n.firstNames] : []
    }))

  const primaryOfficeId = userDetails?.primaryOffice.id

  let districtId = ''
  let provinceId = ''

  if (primaryOfficeId) {
    const primaryOfficeLocation = locations[primaryOfficeId]
    districtId = primaryOfficeLocation?.partOf.split('/')[1] ?? ''
    const district = districtId ? locations[districtId] : undefined
    provinceId = district?.partOf.split('/')[1] ?? ''
  }

  return {
    id: userDetails?.id ?? '',
    name: normalizedName ?? [],
    role: userDetails?.role.id ?? '',
    avatar: userDetails?.avatar?.data,
    signature: userDetails?.signature?.data,
    primaryOfficeId: primaryOfficeId ?? '',
    fullHonorificName: userDetails?.fullHonorificName,
    device: userDetails?.device,
    type: 'user' as const,
    district: districtId,
    province: provinceId
  }
}
