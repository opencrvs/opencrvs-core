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
import { getUserDetails } from '@client/profile/profileSelectors'
import { getUsersFullName } from '../utils'
import { useLocations } from './useLocations'

export function useUserDetails() {
  const userDetails = useSelector(getUserDetails)

  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()

  const normalizedName =
    userDetails &&
    userDetails.name.map((n) => ({
      use: n.use ?? 'official',
      family: n.familyName ?? '',
      given: n.firstNames ? [n.firstNames] : []
    }))

  const name = normalizedName ? getUsersFullName(normalizedName, 'en') : ''

  const primaryOfficeId = userDetails?.primaryOffice.id

  if (primaryOfficeId) {
    const primaryOfficeLocation = locations.find(
      ({ id }) => id === primaryOfficeId
    )

    const districtId = primaryOfficeLocation?.parentId?.split('/')[1]
    const district = districtId
      ? locations.find(({ id }) => id === districtId)
      : undefined

    const provinceId = district?.parentId?.split('/')[1]

    return {
      name,
      role: userDetails.role.id,
      district: districtId ?? '',
      province: provinceId ?? ''
    }
  }

  return {
    name,
    role: userDetails?.role.id,
    district: '',
    province: ''
  }
}
