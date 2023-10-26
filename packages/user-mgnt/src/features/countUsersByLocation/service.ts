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
import User from '@user-mgnt/model/user'

export async function countUsersByLocation(
  systemRole: string,
  locationId: string | undefined
) {
  // For the whole country
  if (!locationId) {
    const resArray = await User.aggregate([
      {
        $match: {
          systemRole
        }
      },
      { $count: 'registrars' }
    ])
    return resArray[0] ?? { registrars: 0 }
  }
  const resArray = await User.aggregate([
    {
      $match: {
        catchmentAreaIds: locationId,
        systemRole
      }
    },
    { $unwind: '$catchmentAreaIds' },
    { $group: { _id: '$catchmentAreaIds', registrars: { $sum: 1 } } },
    { $match: { _id: locationId } }
  ])
  return resArray[0] ?? { registrars: 0 }
}
