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
import {
  extractFilenameFromUrl,
  getUnsignedFileUrl
} from '@client/utils/persistence/fileCache'

/**
 * User details for resolving system variables used through the event configuration.
 *
 * @returns System variable compatible user object.
 */
export function useUserAddress(): {
  district: string
  province: string
} {
  const userDetails = useSelector(getUserDetails)
  const locations = useSelector(getLocations)

  const primaryOfficeId = userDetails?.primaryOffice.id

  if (primaryOfficeId) {
    const primaryOfficeLocation = locations[primaryOfficeId]

    const districtId = primaryOfficeLocation?.partOf.split('/')[1]
    const district = districtId ? locations[districtId] : undefined

    const provinceId = district?.partOf.split('/')[1]

    return {
      district: districtId ?? '',
      province: provinceId ?? ''
    }
  }

  return {
    district: '',
    province: ''
  }
}
